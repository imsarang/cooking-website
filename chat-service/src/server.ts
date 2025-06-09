import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Store active users
const activeUsers = new Map<string, string>();

// Middleware to check authentication
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error('Authentication error'));
  }
  socket.userId = userId;
  next();
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  // Store user's socket ID
  activeUsers.set(socket.userId, socket.id);
  
  // Join user's personal room
  socket.join(`user:${socket.userId}`);

  // Handle authentication
  socket.on('authenticate', async (userId) => {
    try {
      // Get user's active chats from Redis
      const userChats = await redis.smembers(`user:${userId}:chats`);
      
      // Join all chat rooms
      userChats.forEach(chatId => {
        socket.join(`chat:${chatId}`);
      });

      // Emit success
      socket.emit('authenticated', {
        userId,
        chats: userChats
      });
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('error', 'Authentication failed');
    }
  });

  // Handle fetching chat messages
  socket.on('fetch_chat_messages', async (chatId) => {
    try {
      const messages = await redis.lrange(`chats:${chatId}:messages`, 0, -1);
      const parsedMessages = messages.map(msg => JSON.parse(msg));
      socket.emit('chat_messages', parsedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      socket.emit('error', 'Failed to fetch messages');
    }
  });

  // Handle new messages
  socket.on('send_message', async (message) => {
    try {
      // Store message in Redis
      await redis.rpush(`chats:${message.chatId}:messages`, JSON.stringify(message));
      
      // Broadcast to all users in the chat
      io.to(`chat:${message.chatId}`).emit('new_message', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle typing status
  socket.on('typing', ({ userId, chatId, isTyping }) => {
    socket.to(`chat:${chatId}`).emit('user_typing', { userId, chatId, isTyping });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
    activeUsers.delete(socket.userId);
  });
});

const PORT = process.env.PORT || 3003;
httpServer.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
}); 