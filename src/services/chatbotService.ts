// src/services/chatbotService.ts - Cliente SOLO TEXTO (sin voz)
const API_URL = '/api/chat';

export const sendMessage = async (messages: any[], language: string) => {
  try {
    console.log('📤 Enviando mensaje...');
    
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
    
    if (!data.reply) {
      throw new Error('No se recibió respuesta del asistente');
    }
    
    console.log('✅ Respuesta recibida');
    return data.reply;
  } catch (error) {
    console.error('❌ Error en servicio de chat:', error);
    throw error;
  }
};

export default { sendMessage };