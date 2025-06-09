import { Server } from 'socket.io';
import { RedisMessageBucket } from './redisMessageBucket.js';
import { v4 as uuidv4 } from 'uuid';

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
        this.userSockets = new Map();
        this.current_user = null;
    }

    initialize(io) {
        this.io = io;
        console.log(`WebSocketService initialized with origin: ${process.env.MAIN_URL}`);
        // send heartbeat every 30 seconds
        setInterval(() => {
            this.io.emit('heartbeat', { timestamp: Date.now() });
        }, 30000);

        this.io.on('connection', (socket) => {
            console.log('New client connected');

            // handle user auth and fetch all chats with user as member
            socket.on('authenticate', async (userId) => {
                const result = await this.authenticateAndJoinChats(socket, userId);
                if(result.success)
                {
                    this.current_user = result.userId
                }
            });

            // handle heartbeat ack
            socket.on('heartbeat_ack', () => {
                console.log('Heartbeat acknowledged');
            });

            // handle fetch chat
            socket.on('fetch_chat', async ({ currentUser, receiver, chatType }) => {
                try {
                    console.log('Fetching chat between:', currentUser, 'and', receiver);
                    // Get both users' chat lists
                    // const currentUserChats = await redisMessageBucket.redis.smembers(`users:${currentUser._id}:chats`);
                    // const receiverChats = await redisMessageBucket.redis.smembers(`users:${receiver._id}:chats`);

                    console.log('Current user chats:', currentUserChats);
                    console.log('Receiver chats:', receiverChats);

                    // Find common chats between users
                    const commonChats = currentUserChats.filter(chatId => receiverChats.includes(chatId));

                    console.log('Common chats:', commonChats);

                    // Check if any of the common chats matches the chat type
                    for (const chatId of commonChats) {
                        // const chatData = await redisMessageBucket.redis.hgetall(`chats:${chatId}`);
                        // console.log('Checking chat:', chatId, 'Data:', chatData);
                        // if (chatData && chatData.type === chatType) {
                        //     // Found existing chat
                        //     console.log('Found existing chat:', chatId);

                        //     // fetch chat messages
                        //     const result = await this.fetchChatMessages(chatId);
                            
                        //     console.log('Joining chat room:', `chats:${chatId}`);
                        //     socket.join(`chats:${chatId}`);
                            
                        //     socket.emit('chat_found', {
                        //         chat: {
                        //             ...chatData,
                        //             id: chatId
                        //         },
                        //         messages : result.messages
                        //     });
                        //     return;
                        // }
                    }

                    // If no existing chat found, create a new one
                    console.log('No existing chat found, creating new chat');
                    const newChatId = uuidv4();
                    const newChat = {
                        id: newChatId,
                        type: chatType,
                        members: [currentUser._id, receiver._id],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    // // Store new chat in Redis
                    // await redisMessageBucket.storeNewChat(newChat);

                    // // Add chat to both users' chat lists
                    // await redisMessageBucket.redis.sadd(`user:${currentUser._id}:chats`, newChatId);
                    // await redisMessageBucket.redis.sadd(`user:${receiver._id}:chats`, newChatId);

                    // // Join the chat room
                    // console.log('Joining new chat room:', `chats:${newChatId}`);
                    // socket.join(`chats:${newChatId}`);

                    // // Emit chat created event
                    // socket.emit('chat_found', {
                    //     chat : newChat,
                    //     messages: []
                    // });

                } catch (error) {
                    console.error('Error fetching/creating chat:', error);
                    socket.emit('error', 'Failed to fetch/create chat');
                }
            });

            // Handle joining a chat room
            socket.on('join_chat', (chatId) => {
                console.log(`Joining chat room: chats:${chatId}`);
                socket.join(`chats:${chatId}`);
            });

            // send message
            socket.on('send_message', async ({chat, message}) => {
                console.log(`Chat : ${chat.id}`);
                console.log(`Message : ${message.id}`);
                
                await this.sendMessage(socket, chat, message);
            })
        });
    }

    async sendMessage(socket, chat, message) {
        try {
            // console.log('Sending message to redis : ', message.content);
            // console.log('Chat : ', chat.id);
            
            // // Store message in Redis
            // const storeStatus = await redisMessageBucket.storeMessage(message);
            // console.log(`After storing in redis : ${storeStatus}`);

            // // Broadcast to all users in the chat
            // if (storeStatus.status == 200) {
            //     message = { ...message, chatId: storeStatus.chatId }
            //     console.log('Broadcasting message to room:', `chats:${storeStatus.chatId}`);
            //     console.log('Message being broadcast:', message);

            //     this.io.to(`chats:${storeStatus.chatId}`).emit('message_sent', {
            //         status: 200,
            //         message: "Message Sent",
            //         data: message
            //     });
            //     console.log('Message broadcast complete');
            // }
        } catch (error) {
            console.error('Error handling message:', error);
            socket.emit('message_sent', {
                status: 500,
                message: 'Failed to send message'
            });
        }
    }

    async authenticateAndJoinChats(socket, userId) {
        try {
            this.userSockets.set(userId, socket.id);
            // await redisMessageBucket.setUserOnlineStatus(userId, true);

            // get user's active chats
            // const userChats = await redisMessageBucket.redis.smembers(`user:${userId}:chats`);

            // join all chat rooms
            userChats.forEach(chatId => {
                socket.join(`chats:${chatId}`);
            });

            // emit success
            socket.emit('authenticated', {
                success:true,
                userId,
                chats: userChats
            });
            console.log("Authenticated and joined chats for user: ", userId);

            return {
                success: true
            }

        } catch (error) {
            success:false,
            console.error('Authentication error:', error);
            socket.emit('error', 'Authentication failed');
        }
    }

    async fetchChatMessages(chatId) {
        try {
            // const chatMessagesKey = `chats:${chatId}:messages`;
            // const messageIds = await redisMessageBucket.redis.zrevrange(chatMessagesKey, 0, -1);
            
            // const messages = await Promise.all(
            //     messageIds.map(async (id) => {
            //         const messageData = await redisMessageBucket.redis.hgetall(`messages:${id}`);
            //         return messageData;
            //     })
            // );

            // return {
            //     status: 200,
            //     messages: messages.filter(msg => Object.keys(msg).length > 0)
            // };
        } catch (error) {
            console.error('Error fetching chat messages:', error);
            return {
                status: 500,
                messages: [],
                error: error.message
            };
        }
    }
}

export default new WebSocketService();