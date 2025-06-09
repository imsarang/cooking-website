"use client"

import React, { useEffect, useState } from 'react'
import "@/styles/chat/chatheader.css"
import { FaSearch, FaUserPlus } from 'react-icons/fa'
import { FaEllipsisVertical, FaGear } from 'react-icons/fa6'
import FormInput from '../common/FormInput'
import { ChatHeaderInterface } from '@/components/interfaces'

const ChatHeader = ({ ...props }: ChatHeaderInterface) => {
  const [showOthers, setShowOthers] = useState(false)

  const headerItems = [
    {
      icon: <FaUserPlus />,
      text: 'New Group'
    },
    {
      icon: <FaGear />,
      text: 'Settings'
    }
  ];

  return (
    <div className='chat-header'>
      <div className="chat-search">
        <FormInput
          type="text"
          name="search"
          label="Search users..."
          value={props.searchUserQuery}
          setData={(name, value) => props.handleSearchUser(name, value)}
        />
      </div>
      {
        props.selectedUser?
        <div className="chat-header-user">
          <div className="chat-header-user-info">
            <div className="chat-header-user-info-name">
              {props.selectedUser.email}
            </div>
          </div>
        </div>
        :
        <div className="chat-header-user">
          <div className="chat-header-user-info">
            <div className="chat-header-user-info-name">
              Chat With your friends
            </div>
          </div>
        </div>
      }
      {props.showUsers && (
        <div className="show-users">
          {props.searchUsers.map((user, index) => (
            <div
              key={index}
              className="show-users-user"
              onClick={() => props.onUserSelect(user)}
            >
              {user.username}
            </div>
          ))}
        </div>
      )}
      <div className="chat-others" onClick={() => setShowOthers(!showOthers)}>
        <FaEllipsisVertical className='chat-icon' />
      </div>
      {showOthers && (
        <div className='chat-header-others-content'>
          {headerItems.map((item, index) => (
            <div key={index} className='chat-header-others-content-item'>
              <div className="chat-header-icon">
                {item.icon}
              </div>
              <div className="chat-header-text">
                {item.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatHeader