import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1DVgrY0YlObelUPRhneUGz3jj08FBdkg",
  authDomain: "electric-scooter-house-tienda.firebaseapp.com",
  projectId: "electric-scooter-house-tienda",
  storageBucket: "electric-scooter-house-tienda.firebasestorage.app",
  messagingSenderId: "190555300752",
  appId: "1:190555300752:web:2aa7802f7b2963ed930915",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const verProductos = async () => {
  console.log("\n🔍 VERIFICANDO COLECCIÓN: productos 🔍\n");
  console.log("========================================\n");
  
  try {
    const snapshot = await getDocs(collection(db, "productos"));
    
    if (snapshot.empty) {
      console.log("❌ No hay productos en la colección");
      return;
    }
    
    console.log(`📦 Total productos: ${snapshot.size}\n`);
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`=== PRODUCTO ${index + 1} ===`);
      console.log(`ID: ${doc.id}`);
      console.log(`📝 Nombre: ${data.nombre || '❌ No tiene'}`);
      console.log(`💰 Precio: ${data.precio || '❌ No tiene'}€`);
      console.log(`📁 Categoría: ${data.categoria || '❌ No tiene'}`);
      console.log(`⭐ masVendido: ${data.masVendido ? '✅' : '❌'}`);
      console.log(`🏷️ rebaja: ${data.rebaja ? '✅' : '❌'}`);
      console.log(`📸 imágenes: ${data.imagenes?.length || 0}`);
      console.log('---\n');
    });
    
  } catch (error) {
    console.error("❌ Error al conectar con Firebase:", error);
  }
};

verProductos();