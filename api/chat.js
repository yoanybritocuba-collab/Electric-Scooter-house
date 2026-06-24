// api/chat.js - Para Vercel
import admin from 'firebase-admin';
import Groq from 'groq-sdk';

// Firebase
let db = null;
try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (privateKey && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      })
    });
    db = admin.firestore();
    console.log('✅ Firebase conectado');
  }
} catch (error) {
  console.error('Firebase error:', error.message);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { messages, language = 'es' } = req.body;
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Buscar productos en Firebase
    let contexto = '';
    if (db) {
      try {
        const snapshot = await db.collection('productos').limit(10).get();
        const productos = [];
        snapshot.forEach(doc => productos.push(doc.data()));
        if (productos.length > 0) {
          contexto = 'PRODUCTOS:\n' + productos.map(p => `- ${p.nombre}: ${p.precio}€`).join('\n');
        }
      } catch (e) { console.error('Error productos:', e.message); }
    }
    
    // Llamar a Groq
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ reply: 'Error: GROQ_API_KEY no configurada' });
    }
    
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
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ reply: 'Error. Contacta por WhatsApp +30 699 318 5757' });
  }
}