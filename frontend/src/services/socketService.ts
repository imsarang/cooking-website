import { io, Socket } from 'socket.io-client';
import { ChatInterface, MessageInterface, UserInterface } from '@/components/interfaces';

class SocketService {
    private socket: Socket | null = null;
    private messageHandler: ((message: MessageInterface) => void) | null = null;
    private currentChatHandler: ((chat: ChatInterface, messages: MessageInterface[]) => void) | null = null;
    private isConnected: boolean = false;
    private connectionPromise: Promise<void> | null = null;

    initialize(userId: string) {
        if (this.socket) {
            console.log('Socket already initialized');
            return;
        }

        console.log('=== Socket Initialization START ===');
        console.log('Initializing socket connection for user:', userId);
        
        this.connectionPromise = new Promise((resolve, reject) => {
            this.socket = io('http://localhost:80', {
                auth: {
                    userId
                },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                path: '/socket.io/'
            });

            this.socket.on('connect', () => {
                console.log('Socket connected successfully');
                this.isConnected = true;
                // Emit authenticate event after connection
                console.log('Emitting authenticate event with userId:', userId);
                this.socket?.emit('authenticate', userId);
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                this.isConnected = false;
                reject(error);
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
                this.isConnected = false;
            });

            this.socket.on('authenticated', (response) => {
                console.log('Received authenticated response:', response);
            });
            
            this.socket.on('new_message', (response)=>{
                if(!this.messageHandler) {
                    console.error('No registered message handlers');
                    return;
                }
                if(!response) {
                    console.error('New message not received with this signal');
                    return;
                }
                this.messageHandler(response);
            });
        });
        
        console.log('=== Socket Initialization END ===');
    }

    async waitForConnection() {
        if (!this.connectionPromise) {
            throw new Error('Socket not initialized');
        }
        await this.connectionPromise;
    }

    async sendMessage(message: MessageInterface) {
        try {
            await this.waitForConnection();
            
            if (!this.socket || !this.isConnected) {
                console.error('Socket not connected');
                return;
            }
            
            console.log('=== Sending Message ===');
            console.log('Emitting send_message with:', message);
            
            // Ensure message has all required fields
            const messageToSend = {
                ...message,
                chatId: message.chat, // Add chatId field for backend compatibility
                sender: message.sender // Send sender ID for backend compatibility
            };
            
            this.socket.emit('send_message', messageToSend);
            console.log('=== Send Message Signal Sent ===');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    async JoinRoom(chatID: string | undefined) {
        try {
            await this.waitForConnection();
            
            if (!this.socket || !this.isConnected) {
                console.error('Socket not connected');
                return;
            }

            if (!chatID) {
                console.error('No chat ID provided');
                return;
            }

            this.socket.emit('join room', `chat:${chatID}`);
        } catch (error) {
            console.error('Error joining room:', error);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.messageHandler = null;
            this.currentChatHandler = null;
        }
    }

    subscribeToMessage(handler: (message: MessageInterface) => void) {
        this.messageHandler = handler;
    }

    subscribeToCurrentChat(handler: (chat: ChatInterface, messages: MessageInterface[]) => void) {
        this.currentChatHandler = handler;
    }
}

const socketService = new SocketService();
export default socketService; 