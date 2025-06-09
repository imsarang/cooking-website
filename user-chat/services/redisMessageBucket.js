import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

/**
 * Redis Message Bucket Service
 * Handles real-time message caching and retrieval using Redis data structures
 * with proper client and user isolation
 * 
 * Data Structures Used:
 * - Hash: For message metadata and content
 * - Sorted Set: For message ordering and pagination
 * - Set: For online users and typing status
 * - List: For message queues
 */
export class RedisMessageBucket {
    constructor() {
        // Get client ID from environment or use default
        this.clientId = process.env.CLIENT_ID || 'default';

        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'redis',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD,
            db: 0,
            // Add client-specific prefix to all keys
            keyPrefix: `client:${this.clientId}:`
        });

        // Handle Redis connection events
        this.redis.on('connect', () => console.log(`Redis connected for client: ${this.clientId}`));
        this.redis.on('error', (err) => console.error('Redis error:', err));
    }

    /**
     * Get namespaced key for Redis operations
     * @param {string} key - Original key
     * @returns {string} - Namespaced key
     */
    getNamespacedKey(key) {
        return `client:${this.clientId}:${key}`;
    }

    // store new chat

    async storeNewChat(chat) {
        try {
            const chatId = uuidv4();
            const chatKey = `chats:${chatId}`;
            const memberKey = `chats:${chatId}:members`;

            // Store chat metadata
            await this.redis.hmset(chatKey, {
                id: chatId,
                type: chat.conversation,
                name: chat.name,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            });

            // Store chat members
            for (const member of chat.members) {
                await this.redis.sadd(memberKey, member);
                await this.redis.sadd(`users:${member}:chats`, chat.id);
            }

            // Set expiration for chat data (24 hours)
            await this.redis.expire(chatKey, 86400);
            await this.redis.expire(memberKey, 86400);

            return {
                status: 200,
                message: "Chat created successfully",
                chatId: chatId
            };
        } catch (error) {
            console.error('Error creating chat:', error);
            return {
                status: 500,
                message: 'Error creating chat',
                error: error.message
            };
        }
    }

    /**
     * Store a new message in Redis
     * Uses Hash for message data and Sorted Set for ordering
     * @param {string} userId - Recipient's user ID
     * @param {Object} message - Message object
     */
    async storeMessage(message) {
        try {
            console.log(`Storing message : ${message}`);
            // console.log(`Chat : ${chat}`);

            const messageId = message.id || uuidv4();
            message = { ...message, status: 'sent' };

            let chatMessagesKey = `chats:${message.chatId}:messages`;
            let chatKey = `chats:${message.chatId}`;

            // let chatInfo = await this.getChat(chatKey);

            // if (!chatInfo) {
            //    const chatRes = await this.storeNewChat(chat)
            //    if(chatRes.status !== 200) {
            //     return chatRes
            //    }
            //    console.log(chatRes);
            //    chatKey = `chats:${chatRes.chatId}`;
            //    chatMessagesKey = `chats:${chatRes.chatId}:messages`;
            // }

            console.log(`Chat Key : ${chatKey}`);
            
            const memberKey = chatKey +`:members`;
            const members = await this.redis.smembers(memberKey);
            console.log(`Members : ${members}`);
            
            // Store message data (hash map data)
            await this.redis.hmset(`messages:${messageId}`, message);
            
            // Convert date to timestamp for Redis ZADD
            const timestamp = message.createdAt ? new Date(message.createdAt).getTime() : Date.now();

            // Add message to each member's message list (sorted list)
            for (const member of members) {
                const userMessagesKey = `users:${member}:messages`;
                await this.redis.zadd(userMessagesKey, timestamp, messageId);
                await this.redis.expire(userMessagesKey, 86400);
            }

            // Add message to chat's message list
            await this.redis.zadd(chatMessagesKey, timestamp, messageId);
            await this.redis.expire(chatMessagesKey, 86400);

            return {
                status: 200,
                message: "Message Stored Successfully",
                chatId: message.chatId,
                members : members
            }

        } catch (error) {
            console.error('Error storing message:', error);
            return {
                status: 500,
                message: 'Error storing message',
                error: error.message
            }
        }
    }

    /**
 * Get chat details including metadata and members
 * @param {string} chatId - Chat ID to retrieve
 * @returns {Object} Chat object with metadata and members
 */
    async getChat(chatId) {
        try {
            const chatKey = `chats:${chatId}`;
            const memberKey = `chats:${chatId}:members`;

            // Get chat metadata
            const chatData = await this.redis.hgetall(chatKey);
            if (!chatData || Object.keys(chatData).length === 0) {
                return null;
            }

            // Get chat members
            const members = await this.redis.smembers(memberKey);

            // Get last few messages
            const messageKey = `chats:${chatId}:messages`;
            const messageIds = await this.redis.zrevrange(messageKey, 0, 9); // Get last 10 messages
            const messages = await Promise.all(
                messageIds.map(async (id) => {
                    const messageData = await this.redis.hgetall(`messages:${id}`);
                    return messageData;
                })
            );

            return {
                ...chatData,
                members,
                messages: messages.filter(msg => Object.keys(msg).length > 0) // Filter out empty messages
            };
        } catch (error) {
            console.error('Error getting chat:', error);
            return {
                status: 500,
                message: 'Error getting chat',
                error: error.message
            };
        }
    }

    /**
     * Get messages for a specific chat with pagination
     * @param {string} chatId - Chat ID
     * @param {number} page - Page number
     * @param {number} limit - Messages per page
     */
    async getChatMessages(chatId, page = 1, limit = 20) {
        try {
            const chatMessagesKey = `chats:${chatId}:messages`;
            const start = (page - 1) * limit;
            const end = start + limit - 1;

            const messageIds = await this.redis.zrevrange(chatMessagesKey, start, end);

            const messages = await Promise.all(
                messageIds.map(async (id) => {
                    const messageData = await this.redis.hgetall(`messages:${id}`);
                    return messageData;
                })
            );

            return messages;
        } catch (error) {
            console.error('Error getting chat messages:', error);
            return {
                status: 500,
                message: 'Error getting chat messages',
                error: error.message
            }
        }
    }

    /**
     * Get user's recent messages with pagination
     * @param {string} userId - User ID
     * @param {number} page - Page number
     * @param {number} limit - Messages per page
     */
    async getUserMessages(userId, page = 1, limit = 20) {
        try {
            const userMessagesKey = `users:${userId}:messages`;
            const start = (page - 1) * limit;
            const end = start + limit - 1;

            const messageIds = await this.redis.zrevrange(userMessagesKey, start, end);

            const messages = await Promise.all(
                messageIds.map(async (id) => {
                    const messageData = await this.redis.hgetall(`messages:${id}`);
                    return messageData;
                })
            );

            return messages;
        } catch (error) {
            console.error('Error getting user messages:', error);
            return {
                status: 500,
                message: 'Error getting user messages',
                error: error.message
            }
        }
    }
    /**
     * Update message status (sent, delivered, read)
     * Uses Hash for status updates
     * @param {string} messageId - Message ID
     * @param {string} status - New status
     */
    async updateMessageStatus(messageId, status) {
        try {
            const messageKey = `messages:${messageId}`;
            await this.redis.hset(messageKey, 'status', status);
        } catch (error) {
            console.error('Error updating message status:', error);
            return {
                status: 500,
                message: 'Error updating message status',
                error: error.message
            }
        }
    }
    /**
     * Track user's online status
     * Uses Set for online users
     * @param {string} userId - User ID
     * @param {boolean} isOnline - Online status
     */
    async setUserOnlineStatus(userId, isOnline) {
        try {
            const userStatusKey = `users:${userId}:status:online`;
            if (isOnline) {
                await this.redis.set(userStatusKey, '1');
            } else {
                await this.redis.del(userStatusKey);
            }
        } catch (error) {
            console.error('Error setting user online status:', error);
            return {
                status: 500,
                message: 'Error setting user online status',
                error: error.message
            }
        }
    }
    /**
     * Get all online users for this client
     */
    async getOnlineUsers() {
        try {
            const pattern = 'users:*:status:online';
            const keys = await this.redis.keys(pattern);
            return keys.map(key => key.split(':')[1]); // Extract user IDs
        } catch (error) {
            console.error('Error getting online users:', error);
            return {
                status: 500,
                message: 'Error getting online users',
                error: error.message
            }
        }
    }
    /**
     * Track typing status
     * Uses Hash for typing status with expiration
     * @param {string} userId - User ID
     * @param {string} chatId - Chat ID
     * @param {boolean} isTyping - Typing status
     */
    async setTypingStatus(userId, chatId, isTyping) {
        try {
            const typingKey = `users:${userId}:typing:${chatId}`;
            if (isTyping) {
                await this.redis.set(typingKey, '1', 'EX', 10);
            } else {
                await this.redis.del(typingKey);
            }
        } catch (error) {
            console.error('Error setting typing status:', error);
            return {
                status: 500,
                message: 'Error setting typing status',
                error: error.message
            }
        }
    }
    /**
     * Get typing users in a chat for this client
     * Uses Hash for typing status
     * @param {string} chatId - Chat ID
     */
    async getTypingUsers(chatId) {
        try {
            const pattern = `users:*:typing:${chatId}`;
            const keys = await this.redis.keys(pattern);
            return keys.map(key => key.split(':')[1]); // Extract user IDs
        } catch (error) {
            console.error('Error getting typing users:', error);
            return {
                status: 500,
                message: 'Error getting typing users',
                error: error.message
            }
        }
    }
    /**
     * Store message in queue for offline users
     * Uses List for message queue
     * @param {string} userId - User ID
     * @param {Object} message - Message object
     */
    async queueMessageForOfflineUser(userId, message) {
        const queueKey = `users:${userId}:queue`;
        await this.redis.lpush(queueKey, JSON.stringify({
            ...message,
            clientId: this.clientId
        }));
    }

    /**
     * Get queued messages for user
     * Uses List for message queue
     * @param {string} userId - User ID
     */
    async getQueuedMessages(userId) {
        const queueKey = `users:${userId}:queue`;
        const messages = await this.redis.lrange(queueKey, 0, -1);
        await this.redis.del(queueKey);
        return messages.map(msg => JSON.parse(msg));
    }

    /**
     * Clean up expired data for this client only
     */
    async cleanup() {
        const patterns = [
            'messages:*',
            'users:*:messages',
            'chats:*:messages',
            'users:*:status:online',
            'users:*:typing:*',
            'users:*:queue'
        ];

        for (const pattern of patterns) {
            const keys = await this.redis.keys(pattern);
            for (const key of keys) {
                if (!await this.redis.exists(key)) {
                    await this.redis.del(key);
                }
            }
        }
    }

    // fetch chats that the user is part of
    async getUserChats(userId) {
        const userChatsKey = `users:${userId}:chats`;
        const chats = await this.redis.lrange(userChatsKey, 0, -1);
        return chats.map(chat => JSON.parse(chat));
    }
}