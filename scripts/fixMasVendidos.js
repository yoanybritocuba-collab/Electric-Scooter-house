const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

// Configuración de Firebase (la misma que usas en tu app)
const firebaseConfig = {
  apiKey: "AIzaSyB1DVgrY0YlObelUPRhneUGz3jj08FBdkg",
  authDomain: "electric-scooter-house-tienda.firebaseapp.com",
  projectId: "electric-scooter-house-tienda",
  storageBucket: "electric-scooter-house-tienda.firebasestorage.app",
  messagingSenderId: "190555300752",
  appId: "1:190555300752:web:2aa7802f7b2963ed930915",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixMasVendidos() {
  try {
    console.log('🔧 Corrigiendo productos destacados...');
    
    // Obtener la configuración actual
    const docRef = doc(db, 'configuracion', 'masVendidos');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('📊 Datos actuales en Firebase:', data);
      
      if (Array.isArray(data.productos)) {
        console.log('✅ IDs guardados:', data.productos);
        console.log('📝 Número de productos destacados:', data.productos.length);
      } else {
        console.log('❌ Error: "productos" no es un array');
        console.log('Tipo actual:', typeof data.productos);
      }
    } else {
      console.log('📝 No existe el documento. Creando uno de ejemplo...');
      
      // Crear documento de ejemplo con IDs reales de tu Firebase
      const ejemplo = {
        productos: ["8UJWRjcaI6QsOwTg9fkV", "BA7Awft5z1EcCX6ZPRVg", "QAtHlLwf741xbuNunli6"],
        updatedAt: new Date()
      };
      
      await setDoc(docRef, ejemplo);
      console.log('✅ Documento creado con IDs de ejemplo');
    }
    
    console.log('✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixMasVendidos();