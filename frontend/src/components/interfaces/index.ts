export interface UserInterface {
  id: string;
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface MessageInterface {
  id: string;
  content: string;
  sender: string;
  chatId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatInterface {
  id: string;
  participants: UserInterface[];
  lastMessage: MessageInterface | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatHeaderInterface {
  searchUserQuery: string;
  handleSearchUser: (type: string, query: string) => void;
  showUsers: boolean;
  searchUsers: UserInterface[];
  setShowUsers: (show: boolean) => void;
  setSearchUserQuery: (query: string) => void;
  onUserSelect: (user: UserInterface) => void;
}

export interface ChatBodyProps {
  messages: MessageInterface[];
  isTyping: boolean;
  currentUser: UserInterface;
  selectedChat: ChatInterface | null;
}

export interface ChatFooterProps {
  onSendMessage: (message: string) => void;
  selectedChat: ChatInterface | null;
} 