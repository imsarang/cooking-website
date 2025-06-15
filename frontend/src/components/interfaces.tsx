import React from 'react';

export interface UserInterface {
    _id: string,
    username: string,
    firstname: string,
    lastname: string,
    email: string,
    profilePicture?: string,
}

export interface MessageInterface {
    _id: string,
    content: string,
    messageType: string,
    mediaUrl: string,
    status: string,
    chat: string,
    sender: string,
    createdAt: string,
    updatedAt?: string,
    readBy?: Array<{
        user: string,
        readAt: Date
    }>,
    isDeleted?: boolean
}

export interface ChatInterface {
    _id: string;
    chatName: string;
    chatType: string;
    members: UserInterface[];
    messages: MessageInterface[];
    lastMessage?: MessageInterface;
    conversation?: string;
    type?: string;
    image?: string;
    id?: string;
}

export interface ResponseInterface {
    status: number,
    message: string,
    error?: string,
    data?: any
}

export interface ChatHeaderInterface {
    searchUserQuery: string;
    handleSearchUser: (name: string, value: string) => Promise<void>;
    showUsers: boolean;
    searchUsers: UserInterface[];
    setShowUsers: React.Dispatch<React.SetStateAction<boolean>>;
    setSearchUserQuery: React.Dispatch<React.SetStateAction<string>>;
    onUserSelect: (user: UserInterface) => Promise<void>;
    selectedUser: UserInterface | null;
    
}

export interface ChatsProps {
    chats: ChatInterface[];
    handleChatClick: (id: string) => void;
    onUserSelect: (user: UserInterface) => void;
}

export interface ChatBodyProps {
    messages: MessageInterface[];
    isTyping: boolean;
    currentUser: UserInterface;
}

export interface ChatInputProps {
    message: string;
    setMessage: (message: string) => void;
    handleSendMessage: () => Promise<void>;
    handleTyping: () => void;
}