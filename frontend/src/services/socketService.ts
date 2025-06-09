import { io, Socket } from 'socket.io-client';
import { ChatInterface, MessageInterface, ResponseInterface, UserInterface } from '@/components/interfaces';
import { fetchServerEndpointChat } from '@/middleware/common';

class SocketService {
    private socket: Socket | null = null;
    private messageHandlers: ((message: MessageInterface) => void)[] = [];
    private currentChatHandlers: ((chat: ChatInterface, messages: MessageInterface[]) => void)[] = [];
    private typingHandlers: ((data: { userId: string; chatId: string; isTyping: boolean }) => void)[] = [];
    private errorHandlers: ((error: string) => void)[] = [];
    private fetchChatsHandler: ((chat: ChatInterface) => void)[] = [];
    private sendStatusHandler: ((status: ResponseInterface) => void)[] = [];

    initialize(userId: string) {
        console.log(`Initializing socket connection for user : ${userId} route : ${fetchServerEndpointChat()}`);

        this.socket = io(fetchServerEndpointChat() || 'http://localhost:3003', {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Wait for connection before authenticating
        this.socket.on('connect', () => {
            console.log('Connected to chat server');
            this.socket?.emit('authenticate', userId);
        });

        this.socket.on('heartbeat', () => {
            console.log('Received heartbeat');
            this.socket?.emit('heartbeat_ack');
        });

        this.socket.on('authenticated', (data: { userId: string; chats: ChatInterface[] }) => {
            console.log('Authentication successful:', data);
            data.chats.forEach(chat => {
                console.log('Processing chat:', chat.id);
                this.fetchChatsHandler.forEach(handler => handler(chat));
            });
        });

        this.socket.on('chat_found', (data: {chat: ChatInterface, messages : MessageInterface[]})=>{
            console.log('Chat found:', data);
            this.currentChatHandlers.forEach(handler=>handler(data.chat, data.messages))
        })

        this.socket.on('message_sent', (response: ResponseInterface) => {
            console.log('Received message_sent event:', response);
            if (response.status == 200) {
                console.log('Message sent successfully, data:', response.data);
                this.messageHandlers.forEach(handler => handler(response.data));
            } else {
                console.error('Message send failed:', response.message);
                this.errorHandlers.forEach(handler => handler(response.message));
            }
        });

        this.socket.on('user_typing', (data: { userId: string; chatId: string; isTyping: boolean }) => {
            this.typingHandlers.forEach(handler => handler(data));
        });

        this.socket.on('error', (error: string) => {
            this.errorHandlers.forEach(handler => handler(error));
        });

        this.socket.on('chat_messages', (messages: MessageInterface[]) => {
            messages.forEach(message => {
                this.messageHandlers.forEach(handler => handler(message));
            });
        });
    }
    fetchPrivateChat(currentUser: UserInterface, reciever: UserInterface) {
        console.log('Fetching private chat between:', currentUser._id, 'and', reciever);
        if (this.socket?.connected) {
            console.log('Socket is connected, emitting fetch_chat');
            this.socket.emit('fetch_chat', {
                currentUser: currentUser,
                receiver: reciever,
                chatType: 'private'
            });
        } else {
            console.error('Socket not connected');
        }
    }

    fetchGroupChat(currentUser: UserInterface, reciever: string) {
        console.log('Fetching group chat:', reciever);
        if (this.socket?.connected) {
            console.log('Socket is connected, emitting fetch_chat');
            this.socket.emit('fetch_chat', {
                currentUser,
                receiver: reciever,
                chatType: 'group'
            });
        }
        else {
            console.error(`Socket not connected`);
        }
    }

    fetchChatMessages(chatId: string) {
        console.log('Fetching messages for chat:', chatId);
        if (this.socket?.connected) {
            console.log('Socket is connected, emitting fetch_chat_messages');
            this.socket.emit('fetch_chat_messages', chatId);
        } else {
            console.error('Socket not connected');
        }
    }

    sendMessage(chat: ChatInterface, message: MessageInterface) {
        console.log('Sending message to chat server:', message);
        console.log('Current chat:', chat);

        if (this.socket?.connected) {
            console.log('Socket is connected, emitting send_message');
            console.log(`Chat : ${chat.id}, message : ${message.content}`);
            
            this.socket.emit('send_message', {chat, message});
        } else {
            console.error('Socket not connected');
        }
    }

    setTypingStatus(userId: string, chatId: string, isTyping: boolean) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { userId, chatId, isTyping });
        }
    }

    onMessage(handler: (message: MessageInterface) => void) {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    onChat(handler: (chat: ChatInterface) => void) {
        this.fetchChatsHandler.push(handler);
        return () => {
            this.fetchChatsHandler = this.fetchChatsHandler.filter(h => h !== handler);
        };
    }

    onCurrentChat(handler: (chat: ChatInterface, messages: MessageInterface[]) => void) {
        this.currentChatHandlers.push(handler);
        return () => {
            this.currentChatHandlers = this.currentChatHandlers.filter(h => h !== handler);
        }
    }

    onTyping(handler: (data: { userId: string; chatId: string; isTyping: boolean }) => void) {
        this.typingHandlers.push(handler);
        return () => {
            this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
        };
    }

    onError(handler: (error: string) => void) {
        this.errorHandlers.push(handler);
        return () => {
            this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService(); 