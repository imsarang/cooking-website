import mongoose from 'mongoose';
import User from './UserSchema.js';
import { Schema } from 'mongoose';
import { Types } from 'mongoose';

/**
 * Message Schema
 * This schema represents individual messages in the chat system.
 * It's designed to handle various types of messages (text, media) and track their status.
 * 
 * Key Features:
 * - Cross-container user references
 * - Message status tracking
 * - Read receipts
 * - Media support
 * - Message reactions
 * - Reply functionality
 * - Soft delete capability
 */
const messageSchema = new mongoose.Schema({
    // Reference to the user who sent the message
    // Uses ObjectId to reference User collection in another container
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function(v) {
                try {
                    const User = mongoose.model('User');
                    const user = await User.findById(v);
                    return user !== null;
                } catch (error) {
                    return false;
                }
            },
            message: 'Sender user does not exist'
        }
    },

    // Reference to the user who should receive the message
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
        validate: {
            validator: async function(v){
                try{
                    const Chat = mongoose.model('Chat')
                    const chat = await Chat.findById(v)
                    return chat !== null
                }catch(err){
                    console.log(err.message);
                    return false
                }
            }
        }
    },
    // The actual content of the message
    content: {
        type: String,
        required: true,
        trim: true
    },

    // Type of message to handle different content formats
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'audio', 'video'],
        default: 'text'
    },

    // URL for media content if message type is not text
    mediaUrl: {
        type: String,
        trim: true
    },

    // Track who has read the message and when
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Message delivery status
    status: {
        type: String,
        enum: ['pending','sent', 'delivered', 'read'],
        default: 'pending'
    },
    
    // Soft delete functionality
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,

    // Additional metadata for analytics and tracking
    metadata: {
        deviceInfo: String,    // Device used to send the message
        location: String,      // Location of the sender
        ipAddress: String      // IP address for security tracking
    }
}, {
    timestamps: true  // Automatically add createdAt and updatedAt fields
});

// Indexes for better query performance
messageSchema.index({ sender: 1, receiver: 1 });  // For finding messages between two users
messageSchema.index({ createdAt: -1 });           // For sorting messages by time
messageSchema.index({ 'readBy.user': 1 });        // For checking read status

/**
 * Pre-save middleware to handle cross-container references
 * This ensures proper handling of User references from other containers
 */
messageSchema.pre('save', async function(next) {
    try {
        if (!mongoose.models.User) {
            console.warn('User model not available in this container');
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
