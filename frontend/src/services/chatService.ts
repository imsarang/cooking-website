import { MessageInterface } from '@/components/interfaces';
import { fetchServerEndpointChat } from '@/middleware/common';

export const getChats = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_SERVICE_URL}/chats`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};

export const getMessages = async (chatId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_SERVICE_URL}/messages/${chatId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};

export const sendMessage = async (chatId: string, content: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_SERVICE_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      chatId,
      content
    })
  });
  return response.json();
}; 