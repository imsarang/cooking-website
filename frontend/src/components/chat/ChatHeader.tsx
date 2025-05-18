"use client"

import React, { useState } from 'react'
import "@/styles/chat/chatheader.css"
import { FaGear, FaMessage } from 'react-icons/fa6'
import FormInput from '../common/FormInput'
import { FaUser, FaUserPlus } from 'react-icons/fa'

const ChatHeader = () => {

  const [search,setSearch] = useState({
    friend: ""
  })

  const handleSearch = (name : string, value: string)=>{

  }

  return (
    <div className='chat-header'>
      <div className="chats">
        <FaMessage
        />
      </div>
      <div className="chat-search">
        <FormInput
        label='search'
        type='text'
        name='friend'
        value={search.friend}
        setData={handleSearch}
        />
      </div>
      <div className="create-group">
        <FaUserPlus
        />
      </div>
      <div className="settings">
        <FaGear/>
      </div>
    </div>
  )
}

export default ChatHeader