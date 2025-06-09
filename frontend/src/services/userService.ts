import { UserInterface } from '@/components/interfaces';
import { fetchServerEndpointAuth } from '@/middleware/common';

export const searchUsers = async (query: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/users?search=${query}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
}; 