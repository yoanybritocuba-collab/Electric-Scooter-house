// api/chat.js - PARA VERCEL (SIN dotenv)
import admin from 'firebase-admin';
import Groq from 'groq-sdk';

// ============================================================
// 🔥 FIREBASE
// ============================================================
let db = null;
try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!privateKey) {
    console.error('❌ FIREBASE_PRIVATE_KEY no configurada');
  } else if (!process.env.FIREBASE_PROJECT_ID) {
    console.error('❌ FIREBASE_PROJECT_ID no configurado');
  } else if (!process.env.FIREBASE_CLIENT_EMAIL) {
    console.error('❌ FIREBASE_CLIENT_EMAIL no configurado');
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
} catch (error) {
  console.error('❌ Error:', error.message);
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
    console.log(`📦 ${productos.length} productos`);
    return productos;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
};

// ============================================================
// 💬 CHAT
// ============================================================
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { messages, language = 'es' } = req.body;
    const userMessage = messages[messages.length - 1]?.content || '';
    console.log(`💬 Usuario: "${userMessage}"`);
    
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
    
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ reply: 'Error: Groq no configurado' });
    }
    
    const groq = new Groq({ apiKey });
    const systemPrompt = `Eres "Scooter", asistente de Electric Scooter House. Usa 🐶.

${lista}

REGLAS:
1. Usa la lista de productos para responder.
2. Cuando te pregunten "qué venden", muestra la lista.
3. Responde en español, breve y amable.`;

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
    console.log(`✅ Respuesta: ${reply.substring(0, 50)}...`);
    res.status(200).json({ reply });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ reply: 'Error. Contacta WhatsApp +30 699 318 5757' });
  }
}