'use client'
import React, { useEffect, useRef, useState } from 'react'
import '@/styles/chat/home.css'
import ChatHeader from '@/components/chat/ChatHeader'
import ChatBody from '@/components/chat/ChatBody'
import ChatInput from '@/components/chat/ChatInput'
import Chats from '@/components/chat/Chats'
import { useSelector } from 'react-redux'
import { ChatInterface, MessageInterface, UserInterface } from '@/components/interfaces'
import socketService from '@/services/socketService'
import { APIFetchRequestWithToken, fetchServerEndpointAuth, fetchUser, getAccessToken } from '@/middleware/common'

const Chat = () => {
  const user = useSelector((state: any) => state.user?.user)

  const [chats, setChats] = useState<ChatInterface[]>([])
  const [currentChat, setCurrentChat] = useState<ChatInterface | null>(null)
  const [messages, setMessages] = useState<MessageInterface[]>([])
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [searchUsers, setSearchUsers] = useState<UserInterface[]>([])
  const [searchUserQuery, setSearchUserQuery] = useState<string>("")
  const [token, setToken] = useState<string | null>(null)
  const [showUsers, setShowUsers] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null)
  const [currentChatMembers, setCurrentChatMembers] = useState<string[]>([])
  const [privateReciever, setPrivateReciever] = useState<UserInterface>()

  useEffect(() => {
    if (user?._id) {
      // Initialize socket connection
      console.log(`Current User : ${user} ${user.email}`);
      
      console.log("Initializing socket connection");
      socketService.initialize(user._id);
      console.log("Socket connection initialized");
      
      // Set up message handler
      const unsubscribeMessage = socketService.onMessage((message) => {
        console.log('Received message:', message);
        setMessages(prev => [...prev, message]);
        
        // Update the chat in the chats list with the new message
        setChats(prev => prev.map(chat => {
          if (chat.id === message.chatId) {
            return {
              ...chat,
              messages: [...(chat.messages || []), message]
            };
          }
          return chat;
        }));
      });

      // Set up typing handler
      // const unsubscribeTyping = socketService.onTyping(({ userId, chatId, isTyping }) => {
      //   if (chatId === currentChat?.id && userId !== user._id) {
      //     setIsTyping(isTyping);
      //   }
      // });

      // Set up chat list handler
      const unsubscribeChatList = socketService.onChat((chat) => {
        setChats(prev => {
          const exists = prev.some(c => c.id === chat.id);
          if (exists) {
            return prev.map(c => c.id === chat.id ? { ...c, ...chat } : c);
          }
          return [...prev, chat];
        });
      });

      // Set up current chat handler
      const unsubscribeCurrentChat = socketService.onCurrentChat((chat, messages) => {
        console.log('Current chat updated:', chat);
        setCurrentChat(chat);
        setMessages(messages);
        setCurrentChatMembers(chat.members)
      });

      // Set up error handler
      const unsubscribeError = socketService.onError((error) => {
        console.error('Socket error:', error);
      });

      return () => {
        unsubscribeMessage();
        // unsubscribeTyping();
        unsubscribeChatList();
        unsubscribeCurrentChat();
        unsubscribeError();
        socketService.disconnect();
      };
    }
  }, [user?._id]);

  useEffect(() => {
    if (currentChat) {
      socketService.fetchChatMessages(currentChat.id);
    }
  }, [currentChat]);

  const handleChatClick = async (id: string) => {
    // const selectedChat = chats.find(chat => chat.id === id);
    // if (selectedChat) {
    //   setCurrentChat(selectedChat);
    //   if(selectedChat.conversation == 'private')
    //     selectedChat.members.forEach( async member=>{
    //       if(member != user._id)
    //       {
    //         const receiverUser = await fetchUser(
    //         `${fetchServerEndpointAuth()}/user/${member}`
    //         )
    //         setPrivateReciever(receiverUser)
    //       }
    //     })
    //   setMessages([]); // Clear existing messages
    //   socketService.fetchChatMessages(id);
    // }
  };

  const handleSendMessage = async () => {
    console.log(`Sending message : ${message}`);
    console.log(`Current chat : ${currentChat}`);
    
    // if (message.trim() === "" || !currentChat) return;
    if (message.trim() === "") return;

    const chat = {
      id: currentChat? currentChat.id : 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [user._id, selectedUser?._id],
      name: 'Private Chat',
      conversation: 'private' as const,
      messages: [] as MessageInterface[]
    }

    const newMessage: MessageInterface = {
      id: Date.now().toString(),
      content: message,
      messageType: 'text',
      mediaUrl: '',
      status: 'pending',
      chatId: currentChat? currentChat.id : 'New Chat',
      sender: user._id,
      createdAt: new Date().toISOString()
    };

    console.log(`Sending message : ${newMessage}`);
    socketService.sendMessage(chat, newMessage);
    setMessage('');
  };

  const handleTyping = () => {
    if (!currentChat) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socketService.setTypingStatus(user._id, currentChat.id, true);

    typingTimeoutRef.current = setTimeout(() => {
      socketService.setTypingStatus(user._id, currentChat.id, false);
    }, 2000);
  };

  const handleSearchUser = async (name: string, value: string) => {
    if (!value) {
      setSearchUserQuery('');
      setShowUsers(false);
      return;
    }

    setSearchUserQuery(value);
    if (value.length === 0) {
      setShowUsers(false);
      return;
    }

    const result = await APIFetchRequestWithToken(
      `${fetchServerEndpointAuth()}/api/auth/users`,
      token as string,
      'GET',
      {}
    );
    console.log(`Search UserResult : ${result}`);
    
    if (!result) return;

    const { response } = result;
    if (response.success) {
      setShowUsers(true);
      setSearchUsers(response.data);
    }
  };

  const handleUserSelect = async (selectedUser: UserInterface) => {
    console.log('Selecting chat');
    console.log(`Current User : ${user} ${user._id} ${user.email}`);
    
    setShowUsers(false);
    setSearchUserQuery('');
    setSelectedUser(selectedUser);
    
    const response = socketService.fetchPrivateChat({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      profilePicture: user.profilePicture
    }, {
      _id: selectedUser._id,
      username: selectedUser.username,
      email: selectedUser.email,
      firstname: selectedUser.firstname,
      lastname: selectedUser.lastname,
      profilePicture: selectedUser.profilePicture
    });
  };

  return (
    <div className='chat-main'>
      <ChatHeader
        searchUserQuery={searchUserQuery}
        handleSearchUser={handleSearchUser}
        showUsers={showUsers}
        searchUsers={searchUsers}
        setShowUsers={setShowUsers}
        setSearchUserQuery={setSearchUserQuery}
        onUserSelect={handleUserSelect}
        selectedUser={selectedUser}
      />
      <div className="chat-main-chats">
        <Chats
          chats={chats}
          handleChatClick={handleChatClick}
          currentChatId={currentChat?.id}
          selectedUser={selectedUser}
          privateReciever = {privateReciever}
        />
        <div className="chat-main-content">
              <ChatBody
                messages={messages}
                isTyping={isTyping}
                currentUser={user}
              />
              <ChatInput
                message={message}
                setMessage={setMessage}
                onSend={handleSendMessage}
                onTyping={handleTyping}
          />
        </div>
      </div>
    </div>
  )
}

export default Chat