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
import { APIFetchRequestWithToken, fetchServerEndpointAuth, fetchServerEndpointChat, fetchUser, getAccessToken } from '@/middleware/common'

const Chat = () => {
  const user = useSelector((state: any) => state.user?.user)

  const [chats, setChats] = useState<ChatInterface[]>([])
  const [currentChat, setCurrentChat] = useState<ChatInterface | null>(null)
  const [chatMessages, setMessages] = useState<MessageInterface[]>([])
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [searchUsers, setSearchUsers] = useState<UserInterface[]>([])
  const [searchUserQuery, setSearchUserQuery] = useState<string>("")
  const [token, setToken] = useState<string | null>(null)
  const [showUsers, setShowUsers] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null)
  const [currentChatMembers, setCurrentChatMembers] = useState<UserInterface[]>([])
  const [privateReciever, setPrivateReciever] = useState<UserInterface>()

  useEffect(()=>{
    const initializeChat = async () => {
        const newToken = await fetchAccessToken();
        if (newToken) {
            await fetchChatsFromDB(newToken);
        }
        socketService.initialize(user._id);
    };
    
    initializeChat();
    
    return () => {
        socketService.disconnect();
    };
  },[user._id])

  useEffect(()=>{
    if (currentChat?._id) {
      socketService.JoinRoom(currentChat._id).catch(error => {
        console.error('Error joining chat room:', error);
      });
    }
  },[currentChat?._id])

  useEffect(() => {
    const handleNewMessage = (message: MessageInterface) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, message]);
      setChats(prev => prev.map(chat => 
        chat._id === message.chat 
          ? { ...chat, lastMessage: message }
          : chat
      ));
    };

    // Subscribe to new messages
    socketService.subscribeToMessage(handleNewMessage);

    // Cleanup subscription on unmount
    return () => {
      socketService.subscribeToMessage(() => {});
    };
  }, []);

  const fetchAccessToken = async()=>{
    try{
        console.log('=== Fetching Access Token ===');
        const result = await getAccessToken();
        if(!result) {
            console.error('Could not get access Token');
            return;
        }
        console.log('Got new token');
        setToken(result);
        return result; // Return the token
    }catch(err) {
        console.error('Error fetching access token:', err);
        return null;
    }
  }

  const fetchChatsFromDB = async(tokenToUse: string) => {
    try {
        console.log('=== Fetching Chats From DB ===');
        console.log('User ID:', user._id);
        console.log('Token:', tokenToUse);
        
        if (!tokenToUse) {
            console.error('No token available');
            return;
        }

        const result = await APIFetchRequestWithToken(
            `${fetchServerEndpointChat()}/api/chat/chats/${user._id}`,
            tokenToUse,
            'GET',
            {}
        );

        if (!result) {
            console.error('No result returned from API');
            return;
        }
        
        const {response, newToken} = result;
        console.log('API Response:', response);
        
        if (!response.success) {
            console.error('API request failed:', response.message);
            return;
        }
        
        setToken(newToken);
        console.log('Setting chats:', response.chats);
        setChats(response.chats);
        
        console.log('=== Fetch Chats Complete ===');
    } catch (error) {
        console.error('Error fetching chats:', error);
    }
  }

  const fetchChatMessagesFromDB = async (chatID: string) => {
    try {
        console.log('=== Fetching Chat Messages ===');
        console.log('Chat ID:', chatID);
        console.log('Token:', token);

        const result = await APIFetchRequestWithToken(
            `${fetchServerEndpointChat()}/api/chat/messages/${chatID}`,
            token as string,
            'GET',
            {}
        );

        if (!result) {
            console.error('No result returned from API');
            return;
        }

        const {response, newToken} = result;
        console.log('API Response:', response);

        if (!response.success) {
            console.error('API request failed:', response.message);
            return;
        }

        setToken(newToken);
        console.log('Setting messages:', response.messages);
        setMessages(response.messages || []);
        
        console.log('=== Fetch Messages Complete ===');
    } catch (err) {
        console.error('Error fetching messages:', err);
    }
  }

  const handleChatClick = async (id: string) => {
    try {
        console.log('=== Chat Selection START ===');
        console.log('Fetching chat messages for chat ID:', id);
        const selectedChat = chats.find(chat => chat._id === id);
        console.log('Selected chat:', selectedChat);
        
        if (!selectedChat) {
            console.error('No chat found with ID:', id);
            return;
        }

        // Set current chat first
        setCurrentChat(selectedChat);
        
        // If it's a private chat, find the other member
        if (selectedChat.type === 'private' || selectedChat.conversation === 'private') {
            const otherMember = selectedChat.members.find(member => member._id !== user._id);
            console.log('Other member:', otherMember);
            
            if (otherMember) {
                setPrivateReciever(otherMember);
            }
        }

        // Clear existing messages before fetching new ones
        setMessages([]);
        await fetchChatMessagesFromDB(id);

        console.log('=== Chat Selection END ===');
    } catch (error) {
        console.error('Error in handleChatClick:', error);
    }
  };

  const handleSendMessage = async () => {
    console.log(`Sending message : ${message}`);
    console.log(`Current chat : ${currentChat}`);
    
    if (message.trim() === "" || !currentChat || !currentChat._id) return;

    const newMessage: MessageInterface = {
      _id: new Date().toISOString(),
      content: message,
      messageType: 'text',
      mediaUrl: '',
      status: 'pending',
      chat: currentChat._id,
      sender: user._id,
      createdAt: new Date().toISOString()
    };

    // Send message through socket first
    console.log(`Sending message through socket:`, newMessage);
    try {
      await socketService.sendMessage(newMessage);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!currentChat) return;
    // Typing status functionality removed as it's not implemented in socket service
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
    const result = await APIFetchRequestWithToken(
      `${fetchServerEndpointChat()}/api/chat/private/${user._id}/${selectedUser._id}`,
      token as string,
      'GET',
      {}
    )

    if(!result) return

    const {response, newToken} = result

    setToken(newToken)
    setCurrentChat(response.chat)
    setMessages(response.messages)
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
          onUserSelect={handleUserSelect}
        />
        <div className="chat-main-content">
          <ChatBody
            messages={chatMessages}
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