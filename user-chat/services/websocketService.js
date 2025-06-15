import { Server } from 'socket.io';
import { RedisMessageBucket } from './redisMessageBucket.js';
import { v4 as uuidv4 } from 'uuid';
import { fetchDataFromKafka, sendMessageToKafka, sendReqForChatMessages, sendReqForPrivateChat, sendReqForUserChats } from './kafkaService.js';

const redisMessageBucket = new RedisMessageBucket();

// class WebSocketService {
//     constructor() {
//         this.io = null;
//         this.userSockets = new Map(); // Map to store user-socket relationships
//     }

//     initialize(server) {
//         this.io = new Server(server, {
//             cors: {
//                 origin: process.env.FRONTEND_URL || "http://localhost:3000",
//                 methods: ["GET", "POST"]
//             },
//             pingTimeout: 60000, // 60 seconds
//             pingInterval: 25000 // 25 seconds
//         });

//         // Set up heartbeat interval
//         setInterval(() => {
//             this.io.emit('heartbeat', { timestamp: Date.now() });
//         }, 30000); // Send heartbeat every 30 seconds

//         this.io.on('connection', (socket) => {
//             console.log('New client connected');

//             // Handle user authentication
//             socket.on('authenticate', async (userId) => {
//                 try {
//                     this.userSockets.set(userId, socket.id);
//                     await redisMessageBucket.setUserOnlineStatus(userId, true);

//                     // Get user's active chats
//                     const userChats = await redisMessageBucket.redis.smembers(`user:${userId}:chats`);

//                     // Join all chat rooms
//                     userChats.forEach(chatId => {
//                         socket.join(`chat:${chatId}`);
//                     });

//                     // Emit success
//                     socket.emit('authenticated', {
//                         userId,
//                         chats: userChats
//                     });

//                 } catch (error) {
//                     console.error('Authentication error:', error);
//                     socket.emit('error', 'Authentication failed');
//                 }
//             });

//             // Handle fetching chat messages
//             socket.on('fetch_chat_messages', async (chatId) => {
//                 try {
//                     const messages = await redisMessageBucket.redis.lrange(`chats:${chatId}:messages`, 0, -1);
//                     const parsedMessages = messages.map(msg => JSON.parse(msg));
//                     socket.emit('chat_messages', parsedMessages);
//                 } catch (error) {
//                     console.error('Error fetching messages:', error);
//                     socket.emit('error', 'Failed to fetch messages');
//                 }
//             });

//             // Handle new messages
//             socket.on('send_message', async (message) => {
//                 try {
//                     // Store message in Redis
//                     await redisMessageBucket.redis.rpush(`chats:${message.chatId}:messages`, JSON.stringify(message));

//                     // Broadcast to all users in the chat
//                     this.io.to(`chat:${message.chatId}`).emit('new_message', message);
//                 } catch (error) {
//                     console.error('Error handling message:', error);
//                     socket.emit('error', 'Failed to send message');
//                 }
//             });

//             // Handle typing status
//             socket.on('typing', async ({ userId, chatId, isTyping }) => {
//                 try {
//                     await redisMessageBucket.setTypingStatus(userId, chatId, isTyping);
//                     socket.to(`chat:${chatId}`).emit('user_typing', { userId, chatId, isTyping });
//                 } catch (error) {
//                     console.error('Error handling typing status:', error);
//                     socket.emit('error', 'Failed to update typing status');
//                 }
//             });

//             // Handle disconnection
//             socket.on('disconnect', async () => {
//                 let disconnectedUserId = null;
//                 for (const [userId, socketId] of this.userSockets.entries()) {
//                     if (socketId === socket.id) {
//                         disconnectedUserId = userId;
//                         break;
//                     }
//                 }

//                 if (disconnectedUserId) {
//                     this.userSockets.delete(disconnectedUserId);
//                     await redisMessageBucket.setUserOnlineStatus(disconnectedUserId, false);
//                 }
//             });

//             socket.on('fetch_chat', async ({ receiver, chatType }) => {
//                 try {
//                     // Get chat from Redis with additional parameters
//                     const chat = await redisMessageBucket.redis.get(`chats:${receiver}:${chatType}`);

//                     if (chat) {
//                         const parsedChat = JSON.parse(chat);
//                         socket.emit('chat_created', parsedChat);
//                     } else {
//                         socket.emit('chat_not_found', { receiver, chatType });
//                     }
//                 } catch (error) {
//                     console.error('Error fetching chat:', error);
//                     socket.emit('error', 'Failed to fetch chat');
//                 }
//             });
//         });
//     }

//     // Method to emit events to specific users
//     emitToUser(userId, event, data) {
//         const socketId = this.userSockets.get(userId);
//         if (socketId) {
//             this.io.to(socketId).emit(event, data);
//         }
//     }
// }

// export default new WebSocketService(); 

class WebSocketService {
    constructor() {
        this.io = null;
        this.socket = null;
        this.userSockets = new Map();
        this.current_user = null;
        this.chatRoom = null;
        this.kafkaQueue = []
    }

    initialize(io) {
        this.io = io;
        console.log(`WebSocketService initialized with origin: ${process.env.MAIN_URL}`);

        this.io.on('connection', (socket) => {
            this.socket = socket;
            console.log('New client connected');

            // handle user auth and fetch all chats with user as member
            socket.on('authenticate', async (userId) => {
                const result = await this.authenticateAndJoinChats(socket, userId);
                if(result.success) {
                    this.current_user = userId;
                    // Fetch chats after successful authentication
                    await sendReqForUserChats(userId);
                }
            });

            // join a chat room
            socket.on('join room', async (chatRoom) => {
                this.chatRoom = chatRoom
                socket.join(this.chatRoom)
            })

            // send message
            socket.on('send_message', async (message) => {
                console.log('Sending message:', message);
                await this.sendMessage(socket, message);
            });
        });

        // store messages periodically in db
        setInterval(async () => {
            await this.processMessageQueue();
        }, 30 * 1000); // 30 seconds
    }

    async authenticateAndJoinChats(socket, userId) {
        try {
            console.log('=== authenticateAndJoinChats START ===');
            console.log('Authenticating user:', userId);
            
            this.userSockets.set(userId, socket.id);
            this.current_user = userId;
            
            console.log('Socket mapping updated:', {
                userId,
                socketId: socket.id,
                currentUser: this.current_user
            });
            
            // Create a mock request object for sendReqForUserChats
            const mockReq = {
                params: {
                    userId: userId
                }
            };
            
            // Create a mock response object
            const mockRes = {
                json: (data) => {
                    console.log('Sending chat list to socket:', data);
                    socket.emit('chat_list', data);
                }
            };
            
            // Request user's chats through Kafka
            console.log('Requesting chats through Kafka...');
            await sendReqForUserChats(mockReq, mockRes);
            
            // emit success
            socket.emit('authenticated', {
                success: true,
                userId
            });
            
            console.log("Authentication successful for user:", userId);
            console.log('=== authenticateAndJoinChats END ===');
            return { success: true };
        } catch (error) {
            console.error('Authentication error:', error);
            socket.emit('error', 'Authentication failed');
            return { success: false };
        }
    }

    async sendMessage(socket, message) {
        try {
            console.log('=== Sending Message START ===');
            console.log('Received message to send:', message);
            
            // Ensure message has required fields
            if (!message.chatId || !message.sender || !message.content) {
                throw new Error('Missing required message fields');
            }
            
            // Send to Kafka for processing
            this.kafkaQueue.push({socket, message})

            // Broadcast to all users in the chat room
            const chatRoom = `chat:${message.chatId}`;
            console.log('Broadcasting to chat room:', chatRoom);
            this.io.to(chatRoom).emit('new_message', message);
            
            console.log('=== Sending Message END ===');
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', 'Failed to send message');
        }
    }

    async processMessageQueue() {
        if (this.kafkaQueue.length === 0) return;

        console.log('Processing message queue...');
        const messagesToProcess = [...this.kafkaQueue];
        this.kafkaQueue = []; // Clear the queue

        for (const { message } of messagesToProcess) {
            try {
                await sendMessageToKafka(message);
                console.log('Message processed and sent to Kafka:', message._id);
            } catch (error) {
                console.error('Error processing message:', error);
                // Put failed messages back in queue
                this.kafkaQueue.push({ message });
            }
        }
    }
}

export default new WebSocketService();