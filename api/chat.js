// api/chat.js - VERSIÓN DEFINITIVA Y CORREGIDA (SOLO ESTE ARCHIVO)
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
// 🔍 CORRECCIÓN DE ORTOGRAFÍA
// ============================================================
const normalizarTexto = (texto) => {
  const correcciones = {
    'paticnete': 'patinete',
    'patinetes': 'patinete',
    'bicicleta': 'bicicleta',
    'bicis': 'bicicleta',
    'moto': 'moto',
    'motos': 'moto',
    'accesorio': 'accesorio',
    'accesorios': 'accesorio',
    'pieza': 'pieza',
    'piezas': 'pieza',
    'repuesto': 'pieza',
    'bateria': 'batería',
    'cargador': 'cargador',
    'cargadores': 'cargador',
    'timon': 'timón',
    'manilla': 'manilla',
    'manillas': 'manilla',
    'casco': 'casco',
    'cascos': 'casco',
    'colores': 'colores',
    'color': 'color',
    'precio': 'precio',
    'precios': 'precio',
    'stock': 'stock',
    'garantia': 'garantía',
    'garantías': 'garantía',
    'envio': 'envío',
    'envios': 'envíos',
    'informacion': 'información',
    'información': 'información',
    'disponible': 'disponible',
    'disponibles': 'disponible',
    'modelo': 'modelo',
    'modelos': 'modelo',
    'marca': 'marca',
    'marcas': 'marca',
    'negro': 'negro',
    'blanco': 'blanco',
    'rojo': 'rojo',
    'azul': 'azul',
    'verde': 'verde',
    'amarillo': 'amarillo',
    'gris': 'gris',
    'plateado': 'plateado',
    'dorado': 'dorado',
    'rosa': 'rosa'
  };
  
  let normalized = texto.toLowerCase().trim();
  for (const wrong in correcciones) {
    if (normalized.includes(wrong)) {
      normalized = normalized.replace(new RegExp(wrong, 'g'), correcciones[wrong]);
    }
  }
  return normalized;
};

// ============================================================
// 📦 OBTENER PRODUCTOS (VERSIÓN SIMPLE Y SEGURA)
// ============================================================
const getProducts = async () => {
  if (!db) return [];
  
  try {
    const snapshot = await db.collection('productos').limit(100).get();
    const productos = [];
    
    snapshot.forEach(doc => {
      const d = doc.data();
      
      // Leer colores (si existen)
      let colores = [];
      if (d.opciones && d.opciones.colores && Array.isArray(d.opciones.colores)) {
        colores = d.opciones.colores.map(c => c.nombre || 'Sin color').filter(c => c && c !== 'Sin color');
      }
      
      productos.push({
        nombre: d.nombre || 'Sin nombre',
        precio: d.precio || 0,
        categoria: d.categoria || 'General',
        stock: d.stock || 0,
        descripcion: d.descripcion || '',
        colores: colores,
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
// 📝 GENERAR CONTEXTO (SIMPLE Y CLARO)
// ============================================================
const generarContexto = (productos) => {
  if (!productos || productos.length === 0) {
    return 'No hay productos disponibles en la tienda.';
  }
  
  let contexto = '📋 **CATÁLOGO DE PRODUCTOS:**\n\n';
  
  for (let i = 0; i < productos.length; i++) {
    const p = productos[i];
    
    contexto += `**${i+1}. ${p.nombre}**\n`;
    contexto += `   💰 Precio: ${p.precio}€\n`;
    contexto += `   📂 Categoría: ${p.categoria}\n`;
    
    if (p.descripcion) {
      contexto += `   📝 ${p.descripcion}\n`;
    }
    
    if (p.stock > 0) {
      contexto += `   📦 Stock: ${p.stock} unidades\n`;
    }
    
    if (p.colores && p.colores.length > 0) {
      contexto += `   🎨 Colores: ${p.colores.join(', ')}\n`;
    }
    
    contexto += '\n';
  }
  
  return contexto;
};

// ============================================================
// 💬 ENDPOINT DEL CHAT
// ============================================================
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { messages, language = 'es' } = req.body;
    const userMessage = messages[messages.length - 1]?.content || '';
    console.log(`\n💬 Usuario: "${userMessage}"`);
    
    // 🔍 CORREGIR ORTOGRAFÍA
    const userMessageCorregido = normalizarTexto(userMessage);
    if (userMessageCorregido !== userMessage) {
      console.log(`🔍 Texto corregido: "${userMessageCorregido}"`);
    }
    
    // Obtener productos
    const productos = await getProducts();
    console.log(`📊 Productos encontrados: ${productos.length}`);
    
    // Generar contexto
    const contexto = generarContexto(productos);
    
    // Configurar Groq
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ reply: 'Error: Groq no configurado' });
    }
    
    const groq = new Groq({ apiKey });
    
    // 🧠 SYSTEM PROMPT
    const systemPrompt = `Eres "Scooter", un asistente virtual INTELIGENTE y AMABLE de Electric Scooter House. Usa 🐶.

${contexto}

REGLAS:
1. SIEMPRE usa la información de los productos para responder sobre la tienda.
2. Si te preguntan por colores, MUESTRA los colores disponibles.
3. Si la pregunta NO es sobre la tienda, RESPONDE igual (eres un asistente general).
4. Responde en español, breve y amable.
5. Contacto: WhatsApp +30 699 318 5757`;

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
    console.log(`✅ Respuesta: ${reply.substring(0, 50)}...`);
    res.status(200).json({ reply });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ reply: 'Error. Contacta WhatsApp +30 699 318 5757' });
  }
}