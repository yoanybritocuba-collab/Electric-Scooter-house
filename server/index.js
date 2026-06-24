// server/index.js - VERSIÓN PARA VERCEL (SIN ARCHIVO)
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// 🔥 FIREBASE CON VARIABLES DE ENTORNO (SIN ARCHIVO)
// ============================================================
let db = null;
try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!privateKey) {
    console.error('❌ FIREBASE_PRIVATE_KEY no configurada');
  } else {
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
} catch (e) {
  console.error('❌ Firebase error:', e.message);
}

// ============================================================
// 📦 OBTENER PRODUCTOS
// ============================================================
const getProducts = async () => {
  if (!db) return [];
  
  try {
    const snapshot = await db.collection('productos').limit(50).get();
    const productos = [];
    snapshot.forEach(doc => {
      const d = doc.data();
      productos.push({
        nombre: d.nombre || 'Sin nombre',
        precio: d.precio || 0,
        categoria: d.categoria || 'General',
        stock: d.stock || 0
      });
    });
    return productos;
  } catch (e) {
    console.error('Error:', e.message);
    return [];
  }
};

// ============================================================
// 💬 CHAT ENDPOINT
// ============================================================
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, language = 'es' } = req.body;
    const productos = await getProducts();

    let lista = 'No hay productos disponibles.';
    if (productos.length > 0) {
      lista = 'PRODUCTOS EN STOCK:\n';
      for (let i = 0; i < productos.length; i++) {
        const p = productos[i];
        lista += `${i+1}. ${p.nombre} - ${p.precio}€ (${p.categoria})`;
        if (p.stock > 0) lista += ` - Stock: ${p.stock}`;
        lista += '\n';
      }
    }

    const systemPrompt = `Eres Scooter, asistente de Electric Scooter House.

${lista}

REGLAS OBLIGATORIAS:
1. SIEMPRE usa la lista de productos para responder.
2. Cuando te pregunten "que venden", MUESTRA la lista completa.
3. Si la lista tiene productos, NUNCA digas que no hay productos.
4. Responde en español.`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10)
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    const reply = completion.choices[0]?.message?.content || 'No pude procesar tu consulta.';
    res.json({ reply });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ reply: 'Error. Contacta WhatsApp +30 699 318 5757' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3001, () => {
  console.log('🚀 Servidor en puerto 3001');
});