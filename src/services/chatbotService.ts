// src/services/chatbotService.ts
const API_URL = 'http://localhost:3001/api/chat';

export const sendMessage = async (messages: any[], language: string) => {
  try {
    console.log('📤 Enviando a:', API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, language }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta:', data.reply?.substring(0, 30));
    return data.reply;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

export default { sendMessage };