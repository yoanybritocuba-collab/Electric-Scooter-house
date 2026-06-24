// server-local.js - Servidor local para pruebas
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import Groq from 'groq-sdk';

dotenv.config({ path: '.env' });

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Firebase
let db = null;
try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  console.log('🔍 Longitud de la clave:', privateKey?.length || 0);
  
  if (!privateKey) {
    console.error('❌ FIREBASE_PRIVATE_KEY no encontrada');
  } else if (!process.env.FIREBASE_PROJECT_ID) {
    console.error('❌ FIREBASE_PROJECT_ID no encontrado');
  } else if (!process.env.FIREBASE_CLIENT_EMAIL) {
    console.error('❌ FIREBASE_CLIENT_EMAIL no encontrado');
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      })
    });
    db = admin.firestore();
    console.log('✅ Firebase conectado correctamente');
  }
} catch (error) {
  console.error('❌ Firebase error:', error.message);
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, language = 'es' } = req.body;
    const userMessage = messages[messages.length - 1]?.content || '';
    
    console.log(`💬 Mensaje: "${userMessage}"`);
    
    // Buscar productos en Firebase
    let contexto = '';
    if (db) {
      try {
        const snapshot = await db.collection('productos').limit(10).get();
        const productos = [];
        snapshot.forEach(doc => productos.push(doc.data()));
        if (productos.length > 0) {
          contexto = 'PRODUCTOS:\n' + productos.map(p => `- ${p.nombre}: ${p.precio}€`).join('\n');
          console.log(`📦 ${productos.length} productos encontrados`);
        }
      } catch (e) { console.error('Error productos:', e.message); }
    }
    
    // Llamar a Groq
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY no configurada');
      return res.status(500).json({ reply: 'Error: GROQ_API_KEY no configurada' });
    }
    
    console.log('🤖 Llamando a Groq...');
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `Eres Scooter, asistente de Electric Scooter House. ${contexto}` },
        ...messages.slice(-10)
      ],
      temperature: 0.7,
      max_tokens: 300
    });
    
    const reply = completion.choices[0]?.message?.content || 'No pude procesar tu consulta.';
    console.log(`✅ Respuesta: "${reply.substring(0, 50)}..."`);
    res.json({ reply });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ reply: 'Error. Contacta por WhatsApp +30 699 318 5757' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    firebase: db ? 'conectado' : 'no',
    groq: process.env.GROQ_API_KEY ? 'configurada' : 'no'
  });
});

app.listen(PORT, () => console.log(`✅ Servidor en http://localhost:${PORT}`));