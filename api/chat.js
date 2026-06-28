// api/chat.js - Chatbot SOLO TEXTO (sin voz, sin audio)
import admin from 'firebase-admin';
import Groq from 'groq-sdk';

// ============================================================
// 🔥 FIREBASE - CONEXIÓN CON VARIABLES DE ENTORNO
// ============================================================
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
  } else {
    console.error('❌ Faltan variables de entorno de Firebase');
  }
} catch (error) {
  console.error('❌ Error iniciando Firebase:', error.message);
}

// ============================================================
// 📦 OBTENER PRODUCTOS DE FIRESTORE
// ============================================================
const getProducts = async () => {
  if (!db) {
    console.log('⚠️ Firebase no disponible');
    return [];
  }
  
  try {
    const snapshot = await db.collection('productos').limit(50).get();
    const productos = [];
    snapshot.forEach(doc => {
      const d = doc.data();
      productos.push({
        nombre: d.nombre || 'Sin nombre',
        precio: d.precio || 0,
        categoria: d.categoria || 'General',
        stock: d.stock || 0,
        descripcion: d.descripcion || ''
      });
    });
    console.log(`📦 ${productos.length} productos obtenidos`);
    return productos;
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error.message);
    return [];
  }
};

// ============================================================
// 💬 ENDPOINT DEL CHAT (SOLO TEXTO)
// ============================================================
export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { messages, language = 'es' } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        reply: 'No recibí tu mensaje. ¿Puedes repetirlo?' 
      });
    }
    
    const userMessage = messages[messages.length - 1]?.content || '';
    console.log(`💬 Usuario: "${userMessage}"`);
    
    // Obtener productos de Firebase
    const productos = await getProducts();
    console.log(`📊 Productos encontrados: ${productos.length}`);
    
    // Construir lista de productos
    let listaProductos = 'No hay productos disponibles en este momento.';
    if (productos.length > 0) {
      listaProductos = 'PRODUCTOS EN STOCK:\n';
      for (let i = 0; i < productos.length; i++) {
        const p = productos[i];
        listaProductos += `${i+1}. ${p.nombre} - ${p.precio}€ (${p.categoria})`;
        if (p.stock > 0) {
          listaProductos += ` - Stock: ${p.stock}`;
        }
        listaProductos += '\n';
      }
    }
    
    // Configurar Groq
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY no configurada');
      return res.status(500).json({ 
        reply: 'Asistente no disponible. Contacta por WhatsApp +30 699 318 5757' 
      });
    }
    
    const groq = new Groq({ apiKey });
    
    // System prompt
    const systemPrompt = `Eres "Scooter", el asistente virtual de Electric Scooter House. Usa 🐶.

${listaProductos}

REGLAS IMPORTANTES:
1. SIEMPRE usa la lista de productos para responder sobre precios, disponibilidad y características.
2. Cuando te pregunten "qué venden" o "qué productos tienen", MUESTRA la lista completa con nombres y precios.
3. Si la lista tiene productos, NUNCA digas que no hay productos.
4. Responde en español, breve y amable.
5. Contacto de la tienda: WhatsApp +30 699 318 5757`;

    // Llamar a Groq
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
    console.log(`✅ Respuesta generada (${reply.length} caracteres)`);
    
    res.status(200).json({ reply });
    
  } catch (error) {
    console.error('❌ Error en el chat:', error.message);
    res.status(500).json({ 
      reply: 'Error. Contáctanos por WhatsApp +30 699 318 5757' 
    });
  }
}