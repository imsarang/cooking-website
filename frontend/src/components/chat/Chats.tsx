'use client'
import "@/styles/chat/chats.css"
import React, { useEffect, useState } from "react"
import { FaUserCircle } from "react-icons/fa"
import { ChatsProps, UserInterface, ChatInterface } from '@/components/interfaces'
import { useSelector } from "react-redux"

const Chats: React.FC<ChatsProps> = ({ chats, handleChatClick, onUserSelect}) => {
    console.log('Chats component received props:', { 
        chatsLength: chats?.length,
        chats,
    });
    
    const user = useSelector((state: any) => state.user?.user)
    console.log('Current user:', user);

    if (!chats) {
        console.log('Chats is undefined');
        return <div className="chats-main"><div className="chats-list">Loading chats...</div></div>;
    }

    return (
        <div className="chats-main">
            <div className="chats-list">
                {chats.length > 0 ? (
                    chats.map((chat: ChatInterface) => {
                        console.log('Rendering chat:', chat);
                        return (
                            <div
                                key={chat._id}
                                className={`chat-item`}
                                onClick={() => {
                                    console.log('Chat clicked:', chat);
                                    handleChatClick(chat._id);
                                    const otherMember = chat.members?.find((member: UserInterface) => member._id !== user._id);
                                    console.log('Other member:', otherMember);
                                    if (otherMember) {
                                        onUserSelect(otherMember);
                                    }
                                }}
                            >
                                <div className="chat-item-avatar">
                                    {chat.image ? (
                                        <img src={chat.image} alt={chat.chatName} />
                                    ) : (
                                        <FaUserCircle size={40} />
                                    )}
                                </div>
                                <div className="chat-item-info">
                                    <div className="chat-item-name">
                                        {chat.type === 'private' || chat.conversation === 'private' ? 
                                        chat.members?.find((member: UserInterface) => member._id !== user._id)?.email || 'Unknown User'
                                        : 
                                        chat.chatName || chat.members?.map((member: UserInterface) => member.email).join(', ')
                                        }
                                    </div>
                                    {chat.lastMessage && (
                                        <div className="chat-item-last-message">
                                            {chat.lastMessage.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-chats">No chats available</div>
                )}
            </div>
        </div>
    )
}

export default Chats