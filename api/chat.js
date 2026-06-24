// api/chat.js - Chatbot para Vercel
import admin from 'firebase-admin';
import Groq from 'groq-sdk';

// Inicializar Firebase con variables de entorno
if (!admin.apps || admin.apps.length === 0) {
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
      console.log('✅ Firebase inicializado');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

const db = admin.firestore?.();

// Funciones del chatbot
const normalizarTexto = (texto) => {
  const correcciones = {
    'paticnete': 'patinete',
    'patinetes': 'patinete',
    'bicicleta': 'bicicleta',
    'bicis': 'bicicleta',
    'moto': 'moto',
    'motos': 'moto'
  };
  
  let normalized = texto.toLowerCase().trim();
  for (const wrong in correcciones) {
    if (normalized.includes(wrong)) {
      normalized = normalized.replace(new RegExp(wrong, 'g'), correcciones[wrong]);
    }
  }
  return normalized;
};

const buscarProductos = async (query) => {
  if (!db) return [];
  
  try {
    const snapshot = await db.collection('productos').limit(20).get();
    if (snapshot.empty) return [];
    
    const productos = [];
    const palabrasClave = normalizarTexto(query).split(/\s+/).filter(p => p.length > 2);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const nombre = (data.nombre || '').toLowerCase();
      const descripcion = (data.descripcion || '').toLowerCase();
      const categoria = (data.categoria || '').toLowerCase();
      
      let coincidencia = 0;
      for (const palabra of palabrasClave) {
        if (nombre.includes(palabra)) coincidencia += 3;
        if (descripcion.includes(palabra)) coincidencia += 2;
        if (categoria.includes(palabra)) coincidencia += 1;
      }
      
      if (coincidencia > 0) {
        const product = { id: doc.id, _coincidencia: coincidencia };
        for (const key in data) {
          product[key] = data[key];
        }
        productos.push(product);
      }
    });
    
    productos.sort((a, b) => b._coincidencia - a._coincidencia);
    return productos.slice(0, 5);
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

const generarContexto = (productos, language) => {
  if (!productos || productos.length === 0) {
    return 'No hay productos disponibles.';
  }
  
  let contexto = 'PRODUCTOS DISPONIBLES:\n\n';
  
  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    let nombre = producto.nombre || 'Producto sin nombre';
    if (language === 'en' && producto.nombre_en) nombre = producto.nombre_en;
    if (language === 'gr' && producto.nombre_gr) nombre = producto.nombre_gr;
    
    contexto = contexto + (i + 1) + '. ' + nombre + '\n';
    contexto = contexto + '   Precio: ' + (producto.precio || 0) + '€\n';
    contexto = contexto + '   Categoria: ' + (producto.categoria || 'General') + '\n';
    if (producto.descuento && producto.descuento > 0) {
      contexto = contexto + '   OFERTA: -' + producto.descuento + '%\n';
    }
    contexto = contexto + '\n';
  }
  
  return contexto;
};

const getSystemPrompt = (language, context) => {
  let base = '';
  if (language === 'es') {
    base = 'Eres "Scooter", asistente de Electric Scooter House. Usa 🐶.\n\nINFORMACION:\n- Patinetes, bicicletas y motos electricas\n- Envios a toda España\n- Contacto: WhatsApp +30 699 318 5757\n\n' + (context || '') + '\n\nResponde en ESPANOL, breve y amable.';
  } else if (language === 'en') {
    base = 'You are "Scooter", assistant of Electric Scooter House. Use 🐶.\n\nINFO:\n- Electric scooters, bikes and motorcycles\n- Shipping throughout Spain\n- Contact: WhatsApp +30 699 318 5757\n\n' + (context || '') + '\n\nAnswer in ENGLISH, brief and friendly.';
  } else {
    base = 'Eres "Scooter", asistente de Electric Scooter House. Usa 🐶.\n\nINFORMACION:\n- Patinetes, bicicletas y motos electricas\n- Envios a toda España\n- Contacto: WhatsApp +30 699 318 5757\n\n' + (context || '') + '\n\nResponde en ESPANOL, breve y amable.';
  }
  return base;
};

// 🎯 FUNCION PRINCIPAL DE VERCEL
export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { messages, language = 'es' } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        reply: '🐶 No recibí tu mensaje. ¿Puedes repetirlo?' 
      });
    }
    
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Buscar productos
    let productos = [];
    let contextoProductos = '';
    
    if (db) {
      try {
        productos = await buscarProductos(userMessage);
        contextoProductos = generarContexto(productos, language);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    // Configurar Groq
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        reply: '🐶 Asistente no disponible. Contacta por WhatsApp +30 699 318 5757' 
      });
    }
    
    const groq = new Groq({ apiKey });
    const systemPrompt = getSystemPrompt(language, contextoProductos);
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt }, 
        ...messages.slice(-10)
      ],
      temperature: 0.7,
      max_tokens: 300
    });
    
    const reply = completion.choices[0]?.message?.content || 'No pude procesar tu consulta.';
    
    res.status(200).json({ reply });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      reply: '🐶 Ups! Algo salió mal. Contáctanos por WhatsApp +30 699 318 5757' 
    });
  }
}