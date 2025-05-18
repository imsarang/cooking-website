import React from 'react'
import '@/styles/chat/home.css'
import ChatHeader from '@/components/chat/ChatHeader'
import ChatBody from '@/components/chat/ChatBody'
import ChatInput from '@/components/chat/ChatInput'

const Chat = () => {
  return (
    <div className='chat-main'>
      <ChatHeader/>
      <ChatBody/>
      <ChatInput/>
      {/* chat header */}
      {/* chat body */}
      {/* chat input */}
    </div>
  )
}

export default Chat