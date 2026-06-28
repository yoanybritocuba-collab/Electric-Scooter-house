// api/chat.js - VERSIÓN DEFINITIVA CON IA INTELIGENTE
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
// 📦 OBTENER TODOS LOS DATOS DE LOS PRODUCTOS
// ============================================================
const getProducts = async () => {
  if (!db) return [];
  
  try {
    const snapshot = await db.collection('productos').limit(100).get();
    const productos = [];
    
    snapshot.forEach(doc => {
      const d = doc.data();
      
      // Extraer todos los datos disponibles
      const nombre = d.nombre || 'Sin nombre';
      const precio = d.precio || 0;
      const categoria = d.categoria || 'General';
      const stock = d.stock || 0;
      const descripcion = d.descripcion || '';
      const descuento = d.descuento || 0;
      const rebaja = d.rebaja || false;
      const nuevo = d.nuevo || false;
      const masVendido = d.masVendido || false;
      
      // Colores
      let colores = [];
      if (d.opciones && d.opciones.colores && Array.isArray(d.opciones.colores)) {
        colores = d.opciones.colores.map(c => ({
          nombre: c.nombre || 'Sin color',
          codigo: c.codigoColor || '#000000',
          precioExtra: c.precioExtra || 0,
          stock: c.stock || 0,
          imagenes: c.imagenes || []
        }));
      }
      
      const especificaciones = d.especificaciones || {};
      const imagenes = d.imagenes || [];
      const opciones = d.opciones || {};
      const stockCombinaciones = d.stockCombinaciones || [];
      const updatedAt = d.updatedAt || null;
      
      productos.push({
        id: doc.id,
        nombre,
        precio,
        categoria,
        stock,
        descripcion,
        descuento,
        rebaja,
        nuevo,
        masVendido,
        colores,
        especificaciones,
        imagenes,
        opciones,
        stockCombinaciones,
        updatedAt
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
// 📝 GENERAR CONTEXTO COMPLETO
// ============================================================
const generarContextoCompleto = (productos) => {
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
    
    if (p.descuento > 0) {
      contexto += `   🔥 OFERTA: -${p.descuento}%\n`;
    }
    
    if (p.rebaja) contexto += `   🏷️ EN REBAJA\n`;
    if (p.nuevo) contexto += `   ✨ NUEVO\n`;
    if (p.masVendido) contexto += `   ⭐ MÁS VENDIDO\n`;
    
    if (p.colores && p.colores.length > 0) {
      const nombresColores = p.colores.map(c => c.nombre).filter(n => n && n !== 'Sin color');
      if (nombresColores.length > 0) {
        contexto += `   🎨 Colores: ${nombresColores.join(', ')}\n`;
      }
    }
    
    if (p.especificaciones && Object.keys(p.especificaciones).length > 0) {
      contexto += `   ⚙️ Especificaciones:\n`;
      for (const [key, value] of Object.entries(p.especificaciones)) {
        if (value) {
          contexto += `      - ${key}: ${value}\n`;
        }
      }
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
    console.log(`📊 Productos: ${productos.length}`);
    
    // Generar contexto
    const contexto = generarContextoCompleto(productos);
    
    // Configurar Groq
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ reply: 'Error: Groq no configurado' });
    }
    
    const groq = new Groq({ apiKey });
    
    // 🧠 SYSTEM PROMPT INTELIGENTE
    const systemPrompt = `Eres "Scooter", un asistente virtual INTELIGENTE y AMABLE de Electric Scooter House. Usa 🐶.

${contexto}

⚠️ IMPORTANTE: TIENES ACCESO A TODA ESTA INFORMACIÓN:
- Productos: nombres, precios, categorías, stock, descripciones, descuentos, colores, especificaciones técnicas.
- También eres un asistente general: puedes responder preguntas sobre tecnología, movilidad eléctrica, consejos de compra, etc.

REGLAS:
1. SIEMPRE usa la información de los productos para responder sobre la tienda.
2. Si te preguntan por colores, MUESTRA los colores disponibles.
3. Si te preguntan por especificaciones, MUESTRA las especificaciones técnicas.
4. Si la pregunta NO es sobre la tienda, RESPONDE igual (eres un asistente general).
5. Responde en español, breve pero completo.
6. Contacto: WhatsApp +30 699 318 5757
7. Sé amable y cercano.`;

    // Llamar a Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10)
      ],
      temperature: 0.8,
      max_tokens: 800
    });
    
    const reply = completion.choices[0]?.message?.content || 'No pude procesar tu consulta.';
    console.log(`✅ Respuesta: ${reply.substring(0, 50)}...`);
    res.status(200).json({ reply });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ reply: 'Error. Contacta WhatsApp +30 699 318 5757' });
  }
}