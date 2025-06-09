'use client'
import "@/styles/chat/chats.css"
import React, { useEffect, useState } from "react"
import { FaUserCircle } from "react-icons/fa"
import { ChatInterface } from "@/components/interfaces"
import { ChatsProps } from '@/components/interfaces'

const chatsStubs = [
    {
        id: 1,
        name: "John Doe",
        lastMessage: "Hello, how are you?",
        lastMessageTime: "12:00 PM",
        unreadMessages: 0,
        isOnline: true,
        isTyping: false,
        
    },
    {
        id: 2,
        name: "Jane Doefff",
        lastMessage: "Hello, how are you?",
        lastMessageTime: "12:00 PM",
        unreadMessages: 0,
        isOnline: false,
        isTyping: true,
    },
    {
        id: 3,
        name: "Allen Doe",
        lastMessage: "Hello, how are you?",
        lastMessageTime: "12:00 PM",
        unreadMessages: 0,
        isOnline: true,
        isTyping: false,
    },
    {
        id: 4,
        name: "Joe Allen",
        lastMessage: "Hello, how are you?",
        lastMessageTime: "12:00 PM",
        unreadMessages: 0,
    }
]

const Chats = ({ chats, handleChatClick, currentChatId, selectedUser, privateReciever}: ChatsProps) => {
    return (
        <div className='chats-main'>
            {chats.map((chat) => (
                <div
                    key={chat.id}
                    className={`chat ${chat.id === currentChatId ? 'active' : ''}`}
                    onClick={() => handleChatClick(chat.id)}
                >
                    <div className="chat-image">
                        {chat.image ? (
                            <img src={chat.image} alt={chat.name} />
                        ) : (
                            <div className="chat-item-avatar-placeholder">
                                {/* {chat.name.charAt(0).toUpperCase()}
                                 */}
                                <FaUserCircle />
                            </div>
                        )}
                    </div>
                    <div className="chat-item-info">
                        <div className="chat-item-name">
                            {chat.conversation  == 'private'? privateReciever?.email : "Group"}
                        </div>
                        {/* <div className="chat-item-last-message">
                            {chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : 'No messages yet'}
                        </div> */}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Chats;