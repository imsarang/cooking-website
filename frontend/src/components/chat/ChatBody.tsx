'use client'
import React, { useRef, useEffect } from 'react'
import '@/styles/chat/chatbody.css'
import { ChatBodyProps, MessageInterface } from '@/components/interfaces'

const ChatBody: React.FC<ChatBodyProps> = ({ messages, isTyping, currentUser }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        console.log('Messages updated in ChatBody:', messages);
        scrollToBottom();
    }, [messages]);

    console.log('Rendering ChatBody with:', {
        messagesCount: messages?.length,
        isTyping,
        currentUser: currentUser?._id
    });

    return (
        <div className='chat-body-main'>
            <div className='chat-body-main-chats'>
                {messages?.map((message: MessageInterface) => {
                    console.log('Rendering message:', message);
                    return (
                        <div
                            key={message?._id}
                            className={`chat-message`}
                        >
                            <div className={`message-container ${message?.sender === currentUser._id ? 'sent' : 'received'}`}>
                                <div className='message-wrapper'>
                                    <div className="chat-message-content">
                                        {message?.content}
                                    </div>
                                    <div className="chat-message-time">
                                        {new Date(message?.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    )
}

export default ChatBody