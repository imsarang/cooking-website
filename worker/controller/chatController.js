import Chat from "../models/ChatSchema.js"
import Message from "../models/MessageSchema.js"

export const storeMessageInDB = async (message) => {
    try {
        console.log('=== Storing Message in DB START ===');
        console.log('Received message to store:', message);

        // Validate required fields
        if (!message.sender || !message.chatId || !message.content) {
            throw new Error('Missing required message fields');
        }

        // Create new message
        const newMessage = await Message.create({
            sender: message.sender,
            chat: message.chatId,
            content: message.content,
            messageType: message.messageType || 'text',
            mediaUrl: message.mediaUrl || '',
            status: 'sent'
        });

        console.log('Created new message:', newMessage);

        // Update chat with new message
        const updatedChat = await Chat.findByIdAndUpdate(
            message.chatId,
            {
                $push: { messages: newMessage._id },
                $set: { lastMessage: newMessage }
            },
            { new: true }
        );

        console.log('Updated chat:', updatedChat);

        if (newMessage) {
            // Ensure all required properties are present in the response
            const responseMessage = {
                _id: newMessage._id,
                sender: newMessage.sender,
                chat: newMessage.chat,
                content: newMessage.content,
                messageType: newMessage.messageType,
                mediaUrl: newMessage.mediaUrl,
                status: newMessage.status,
                createdAt: newMessage.createdAt,
                updatedAt: newMessage.updatedAt
            };
            
            console.log('=== Storing Message in DB END ===');
            return {
                success: true,
                message: "Message Sent",
                data: responseMessage
            };
        }

        throw new Error('Failed to create message');
    } catch (error) {
        console.error('Error storing message:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

const getPrivateChat = async (chat) => {
    try {
        const chat = await Chat.findOne({
            members: chat.members,
            chatType: chat.conversation
        })

        if (chat)
            return {
                success: true,
                chat: chat
            }
    } catch (err) {
        return {
            success: false,
            message: err.message
        }
    }
}

export const fetchPrivateChat = async (currentUser, reciever) => {
    try {
        console.log('Current user:', currentUser);
        console.log('Receiver:', reciever);
        
        // Find existing chat
        const chat = await Chat.findOne({
            members: { $all: [currentUser, reciever] },
            chatType: 'private'
        }).populate('members');

        if (!chat) {
            // Create new chat
            const newChat = await Chat.create({
                chatName: `${currentUser} and ${reciever}`,
                chatType: 'private',
                members: [currentUser, reciever],
                messages: [],
                lastMessage: null
            });
            
            console.log(`New chat created with Id: ${newChat._id}`);
            
            return {
                success: true,
                data: {
                    chat: newChat,
                    messages: []
                }
            };
        }
        
        console.log(`Chat found with id: ${chat._id}`);
        
        // Get messages for the chat
        const messages = await Message.find({
            chat: chat._id
        }).sort({ createdAt: 1 });

        return {
            success: true,
            data: {
                chat: chat,
                messages: messages
            }
        };

    } catch (err) {
        console.error('Error in fetchPrivateChat:', err);
        return {
            success: false,
            message: err.message
        };
    }
}

export const fetchChatsFromDB = async (userId) => {
    try {

        const chats = await Chat.find({
            members: { $in: [userId] }
        }).populate('members', 'username email')
            .sort({ createdAt: -1 })
            .lean()

        if (!chats || chats.length === 0) return {
            success: true,
            message: "No chats found"
        }

        return {
            success: true,
            data: chats.map(chat => ({
                _id: chat._id,
                name: chat.chatName,
                type: chat.chatType,
                members: chat.members,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            }))
        }
    } catch (err) {
        return {
            success: false,
            message: err.message
        }
    }
}

export const fetchChatMessagesFromDB = async (chatId) => {
    try {
        console.log('=== Fetching Chat Messages From DB ===');
        console.log('Fetching messages for chatId:', chatId);
        
        const messages = await Message.find({
            chat: chatId
        }).populate('sender', 'username email profilePicture')
          .sort({ createdAt: 1 })
          .lean();

        console.log('Found messages:', messages);

        if (!messages || messages.length === 0) {
            console.log('No messages found for chat:', chatId);
            return {
                success: true,
                messages: []
            };
        }

        const formattedMessages = messages.map(message => ({
            _id: message._id,
            content: message.content,
            messageType: message.messageType || 'text',
            mediaUrl: message.mediaUrl || '',
            status: message.status || 'sent',
            chat: message.chat,
            sender: {
                _id: message.sender._id,
                email: message.sender.email,
                username: message.sender.username,
                profilePicture: message.sender.profilePicture
            },
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
        }));

        console.log('Formatted messages:', formattedMessages);
        console.log('=== Fetch Chat Messages From DB Complete ===');

        return {
            success: true,
            messages: formattedMessages
        };
    } catch (err) {
        console.error('Error in fetchChatMessagesFromDB:', err);
        return {
            success: false,
            message: err.message
        };
    }
}

const createNewChat = async (currentUser, reciever)=>{
    try{
        const chat = await Chat.create({
            chatName: `${currentUser._id} and ${reciever._id}`,
            chatType: 'private',
            members: [currentUser._id, reciever._id],
            messages: [],
            lastMessage: null
        })        

        console.log(`New chat : ${chat}`);
        
        return {
            success: true,
            chat: chat
        }
    }catch(err)
    {
        return {
            success: false,
            message: err.message
        }
    }
}