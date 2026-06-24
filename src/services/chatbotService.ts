const API_URL = import.meta.env.VITE_CHATBOT_API_URL || '/api/chat';

export const sendMessage = async (messages: any[], language: string) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, language }),
    });

    if (!response.ok) {
      throw new Error('Error en el servidor');
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error en servicio de chat:', error);
    throw error;
  }
};

export default { sendMessage };