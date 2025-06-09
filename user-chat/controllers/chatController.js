import websocketService from '../services/websocketService.js';
import chatService from '../services/chatService.js';
import { RedisMessageBucket } from '../services/redisMessageBucket.js';
import { v4 as uuidv4 } from 'uuid';

const redisMessageBucket = new RedisMessageBucket();

export const storeDataInRedis = async (req, res) => {
    try {
        const { message, senderId, receiverId } = req.body;
        let chatId = req.body.chatId;

        // If no chatId is provided, find or create a private chat
        if (!chatId) {
            const { isNew, chat } = await chatService.findOrCreatePrivateChat(senderId, receiverId);
            chatId = chat.id;

            // If it's a new chat, notify both users
            if (isNew) {
                websocketService.emitToUser(senderId, 'new_chat', chat);
                websocketService.emitToUser(receiverId, 'new_chat', chat);
            }
        }
        
        // Store message in Redis
        await chatService.storeMessage(message, chatId);
        
        // Emit to both sender and receiver
        websocketService.emitToUser(senderId, 'new_message', { ...message, chatId });
        websocketService.emitToUser(receiverId, 'new_message', { ...message, chatId });
        
        res.status(200).json({ 
            success: true, 
            message: 'Message stored successfully',
            chatId 
        });
    } catch (error) {
        console.error('Error storing message:', error);
        res.status(500).json({ success: false, error: 'Failed to store message' });
    }
}

export const getDataFromRedis = async (req, res) => {
    try {
        const { chatId, userId } = req.query;
        
        // Get messages from Redis
        const messages = await chatService.getChatMessages(chatId);
        
        // Emit messages to the requesting user
        websocketService.emitToUser(userId, 'chat_messages', messages);
        
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
}

export const deleteDataFromRedis = async (req, res) => {
    try {
        const { chatId, messageId, userId } = req.body;
        
        // Get messages from Redis
        const messages = await chatService.getChatMessages(chatId);
        const updatedMessages = messages.filter(msg => msg.id !== messageId);
        
        // Update Redis with filtered messages
        await redisMessageBucket.redis.del(`chats:${chatId}:messages`);
        if (updatedMessages.length > 0) {
            await chatService.storeMessage(updatedMessages, chatId);
        }
        
        // Emit updated messages to all users in the chat
        const chatMembers = await redisMessageBucket.redis.smembers(`chat:${chatId}:users`);
        chatMembers.forEach(userId => {
            websocketService.emitToUser(userId, 'chat_messages', updatedMessages);
        });
        
        res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, error: 'Failed to delete message' });
    }
}

export const fetchChats = async (req, res) => {
    try {
        const { userId } = req.query;
        
        // Get user's chats from Redis
        const userChats = await redisMessageBucket.redis.smembers(`user:${userId}:chats`);
        
        // Emit chat list to user
        websocketService.emitToUser(userId, 'chat_list', userChats);
        
        res.status(200).json({ success: true, chats: userChats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch chats' });
    }
}

export const fetchMessages = async (req, res) => {
    try {
        const { userId, chatId } = req.params;
        
        // Get messages from Redis
        const messages = await chatService.getChatMessages(chatId);
        
        const chatMembers = await redisMessageBucket.redis.smembers(`chat:${chatId}:users`);
        websocketService.emitToUser(userId, 'chat_messages', messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
}

export const sendDataToKafka = async (req,res)=>{

}

export const createPrivateChat = async (req, res) => {
    try {
        const { userId1, userId2 } = req.body;
        
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
                return res.status(200).json({ 
                    success: true, 
                    message: 'Existing private chat found',
                    chat: chatData 
                });
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
        
        // Notify both users about the new chat
        websocketService.emitToUser(userId1, 'new_chat', newChat);
        websocketService.emitToUser(userId2, 'new_chat', newChat);
        
        res.status(201).json({ 
            success: true, 
            message: 'New private chat created',
            chat: newChat 
        });
    } catch (error) {
        console.error('Error creating private chat:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create private chat' 
        });
    }
}

