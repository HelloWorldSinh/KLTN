import api from './api';

interface ChatResponse {
  sessionId: string;
  reply: string;
}

export interface ChatMessage {
  role: 'USER' | 'AI';
  text: string;
}

export const chatWithBot = async (message: string): Promise<ChatResponse> => {
  const response = await api.post('/api/chatbot/chat', {
    message
  });
  return response.data;
};

export const getChatHistory = async (): Promise<ChatMessage[]> => {
  const response = await api.get('/api/chatbot/history');
  return response.data;
};
