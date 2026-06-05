import api from './api';

interface ChatResponse {
  sessionId: string;
  reply: string;
}

export const chatWithBot = async (message: string, sessionId?: string | null): Promise<ChatResponse> => {
  const response = await api.post('/api/chatbot/chat', {
    message,
    sessionId: sessionId || "",
  });
  return response.data;
};

