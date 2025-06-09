'use client'
import React from 'react'
import '@/styles/chat/chatbody.css'
import { ChatBodyProps, MessageInterface } from '@/components/interfaces'
import { useAuth } from '@/context/AuthContext'

const messageStubs = [
  {
    id: 1,
    content: "Hello, how are you?",
    sender: "user1",
    messageType: "text",
    mediaUrl: "",
    status: "sent",
    chatId: "1",
    createdAt: "2021-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    content: "Hello, how are you?",
    sender: "user2",
    messageType: "text",
    mediaUrl: "",
    status: "sent",
    chatId: "1",
    createdAt: "2021-01-01T00:00:00.000Z"
  },
]

const currentUserStub = {
  _id: "user1",
}

const ChatBody = ({ messages, isTyping, currentUser }: ChatBodyProps) => {

  return (
    <div className='chat-body-main'>
      <div className='chat-body-main-chats'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message`}
          >
            <div className={`message-container ${message.sender === currentUser._id ? 'sent' : 'received'}`}>
              <div className='message-wrapper'>
                <div className="chat-message-content">
                  {message.content}
                </div>
                <div className="chat-message-time">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatBody;