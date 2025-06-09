import { RedisMessageBucket } from './redisMessageBucket.js';
import { v4 as uuidv4 } from 'uuid';

const redisMessageBucket = new RedisMessageBucket();

class ChatService {
    /**
     * Find or create a private chat between two users
     * @param {string} userId1 - First user's ID
     * @param {string} userId2 - Second user's ID
     * @returns {Promise<Object>} - The chat object
     */
    async findOrCreatePrivateChat(userId1, userId2) {
        // Check if a private chat already exists between these users
        const user1Chats = await redisMessageBucket.redis.smembers(`user:${userId1}:chats`);
        const user2Chats = await redisMessageBucket.redis.smembers(`user:${userId2}:chats`);
        
        // Find common chats between users
        const commonChats = user1Chats.filter(chatId => user2Chats.includes(chatId));
        
        // Check if any of the common chats is a private chat
        for (const chatId of commonChats) {
            const chatType = await redisMessageBucket.redis.hget(`chats:${chatId}`, 'type');
            if (chatType === 'private') {
                // Private chat already exists, return it
                const chatData = await redisMessageBucket.redis.hgetall(`chats:${chatId}`);
                return {
                    isNew: false,
                    chat: chatData
                };
            }
        }
        
        // No existing private chat found, create a new one
        const newChatId = uuidv4();
        const newChat = {
            id: newChatId,
            name: `Private Chat ${newChatId.slice(0, 8)}`,
            type: 'private',
            members: [userId1, userId2],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Store the new chat in Redis
        await redisMessageBucket.storeNewChat(newChat);
        
        return {
            isNew: true,
            chat: newChat
        };
    }

    /**
     * Store a message in a chat
     * @param {Object} message - The message object
     * @param {string} chatId - The chat ID
     * @returns {Promise<void>}
     */
    async storeMessage(message, chatId) {
        await redisMessageBucket.redis.rpush(`chats:${chatId}:messages`, JSON.stringify(message));
    }

    /**
     * Get chat messages
     * @param {string} chatId - The chat ID
     * @returns {Promise<Array>} - Array of messages
     */
    async getChatMessages(chatId) {
        const messages = await redisMessageBucket.redis.lrange(`chats:${chatId}:messages`, 0, -1);
        return messages.map(msg => JSON.parse(msg));
    }
}

export default new ChatService(); 