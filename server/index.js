import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Importar firebase-admin directamente
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

let db = null;
let firebaseInitialized = false;

try {
  const credPath = join(__dirname, '../credentials/serviceAccountKey.json');
  console.log('Buscando credenciales en:', credPath);
  
  const content = readFileSync(credPath, 'utf8');
  const credentials = JSON.parse(content);
  console.log('Credenciales cargadas correctamente');
  
  // Inicializar Firebase
  if (!admin.apps || admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(credentials)
    });
    firebaseInitialized = true;
    db = admin.firestore();
    console.log('Firebase inicializado correctamente');
  } else {
    firebaseInitialized = true;
    db = admin.firestore();
    console.log('Firebase ya estaba inicializado');
  }
} catch (error) {
  console.log('Error inicializando Firebase:', error.message);
  console.log('Stack:', error.stack);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
    'cascos': 'casco'
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
  if (!db) {
    return [];
  }
  
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
    console.error('Error buscando productos:', error);
    return [];
  }
};

const generarContexto = (productos, language) => {
  if (!productos || productos.length === 0) {
    return 'No hay productos disponibles en la tienda.';
  }
  
  let contexto = 'PRODUCTOS DISPONIBLES EN LA TIENDA:\n\n';
  
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
    if (producto.stock !== undefined && producto.stock !== null) {
      contexto = contexto + '   Stock: ' + producto.stock + ' unidades\n';
    }
    contexto = contexto + '\n';
  }
  
  return contexto;
};

const getSystemPrompt = (language, context) => {
  let base = '';
  if (language === 'es') {
    base = 'Eres "Scooter", un asistente virtual AMABLE de Electric Scooter House. Usa 🐶.\n\nINFORMACION DE LA TIENDA:\n- Movilidad electrica: patinetes, bicicletas y motos.\n- Productos de calidad con garantia.\n- Envios a toda Espana.\n- Contacto: WhatsApp +30 699 318 5757\n\n' + (context || 'No hay productos especificos.') + '\n\nResponde en ESPANOL, breve y amable.';
  } else if (language === 'en') {
    base = 'You are "Scooter", a friendly assistant of Electric Scooter House. Use 🐶.\n\nSTORE INFO:\n- Electric mobility: scooters, bikes and motorcycles.\n- Quality products with warranty.\n- Shipping throughout Spain.\n- Contact: WhatsApp +30 699 318 5757\n\n' + (context || 'No specific products.') + '\n\nAnswer in ENGLISH, brief and friendly.';
  } else if (language === 'gr') {
    base = 'Είσαι ο "Scooter", βοηθος του Electric Scooter House. Use 🐶.\n\nΠΛΗΡΟΦΟΡΙΕΣ:\n- Ηλεκτρικη κινητικοτητα: πατινια, ποδηλατα, μοτοσυκλετες.\n- Προιοντα ποιοτητας με εγγυηση.\n- Αποστολες σε ολη την Ελλαδα.\n- Επικοινωνια: WhatsApp +30 699 318 5757\n\n' + (context || 'Δεν υπαρχουν προιοντα.') + '\n\nΑπαντησε στα ΕΛΛΗΝΙΚΑ, συντομα και φιλικα.';
  } else {
    base = 'Eres "Scooter", un asistente virtual AMABLE de Electric Scooter House. Usa 🐶.\n\nINFORMACION DE LA TIENDA:\n- Movilidad electrica: patinetes, bicicletas y motos.\n- Productos de calidad con garantia.\n- Envios a toda Espana.\n- Contacto: WhatsApp +30 699 318 5757\n\n' + (context || 'No hay productos especificos.') + '\n\nResponde en ESPANOL, breve y amable.';
  }
  return base;
};

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, language = 'es', context = '' } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ reply: 'No recibi tu mensaje.' });
    }
    
    const userMessage = messages[messages.length - 1]?.content || '';
    
    let productos = [];
    let contextoProductos = '';
    
    if (db) {
      productos = await buscarProductos(normalizarTexto(userMessage));
      contextoProductos = generarContexto(productos, language);
    }
    
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ reply: 'Asistente no disponible. Contacta por WhatsApp.' });
    }
    
    const groq = new Groq({ apiKey });
    const systemPrompt = getSystemPrompt(language, contextoProductos || context);
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
      temperature: 0.7,
      max_tokens: 300
    });
    
    const reply = completion.choices[0]?.message?.content || 'No pude procesar tu consulta.';
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ reply: 'Error. Contacta por WhatsApp +30 699 318 5757.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', firebase: firebaseInitialized ? 'conectado' : 'no' });
});

app.listen(PORT, () => {
  console.log('Servidor del Chatbot iniciado en puerto ' + PORT);
  console.log('Firebase: ' + (firebaseInitialized ? 'Conectado' : 'No disponible'));
  console.log('API Key: ' + (process.env.GROQ_API_KEY ? 'Configurada' : 'FALTA'));
});
