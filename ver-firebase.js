import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

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

const verDatos = async () => {
  console.log("\n🔍 VERIFICANDO DATOS EN FIREBASE 🔍\n");
  
  // 1. Ver más vendidos
  console.log("📋 CONFIGURACIÓN: más vendidos");
  const masVendidosDoc = await getDoc(doc(db, "configuracion", "masVendidos"));
  if (masVendidosDoc.exists()) {
    console.log("✅ Documento existe");
    console.log("📦 Datos:", masVendidosDoc.data());
  } else {
    console.log("❌ Documento no existe");
  }
  
  // 2. Ver producto específico
  console.log("\n📦 PRODUCTO: aEdnIYdo3iJR3JXXzrlh");
  const productDoc = await getDoc(doc(db, "productos", "aEdnIYdo3iJR3JXXzrlh"));
  if (productDoc.exists()) {
    console.log("✅ Producto existe");
    console.log("📝 Datos:", productDoc.data());
  } else {
    console.log("❌ Producto no encontrado");
  }
  
  // 3. Ver todos los productos (primeros 3)
  console.log("\n📋 TODOS LOS PRODUCTOS (primeros 3):");
  const productsSnap = await getDocs(collection(db, "productos"));
  let count = 0;
  productsSnap.forEach(doc => {
    if (count < 3) {
      console.log(`\n🔹 ID: ${doc.id}`);
      console.log(`   Nombre: ${doc.data().nombre}`);
      console.log(`   masVendido: ${doc.data().masVendido}`);
      console.log(`   rebaja: ${doc.data().rebaja}`);
      count++;
    }
  });
};

verDatos();