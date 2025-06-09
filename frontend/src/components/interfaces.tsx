export interface UserInterface {
    _id: string,
    username: string,
    firstname: string,
    lastname: string,
    email: string,
    profilePicture?: string,
}

export interface MessageInterface {
    id: string,
    content: string,
    messageType: string,
    mediaUrl: string,
    status: string,
    chatId?: string,
    sender: string,
    createdAt: string
}

export interface ChatInterface {
    id: string;
    name: string;
    image?: string;
    conversation: 'private' | 'group';
    messages: MessageInterface[];
    members: string[];
    createdAt: string;
    loading?: boolean;
    error?: string | null;
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
    currentChatId?: string;
    selectedUser: UserInterface | null
    privateReciever: UserInterface | undefined
}

export interface ChatBodyProps {
    messages: MessageInterface[];
    isTyping: boolean;
    currentUser: UserInterface;
}

export interface ChatInputProps {
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    onSend: () => void;
    onTyping: () => void;
}