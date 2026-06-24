import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

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

const limpiarMasVendidos = async () => {
  console.log("🧹 Limpiando configuración de más vendidos...\n");
  
  // Obtener la configuración actual
  const docRef = doc(db, "configuracion", "masVendidos");
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    const productos = data.productos || [];
    
    console.log("📦 IDs actuales:", productos);
    
    // Filtrar IDs válidos (que no sean strings con corchetes)
    const idsValidos = productos.filter(id => {
      return typeof id === 'string' && !id.startsWith('[') && id.length > 0;
    });
    
    console.log("✅ IDs válidos:", idsValidos);
    
    // Actualizar Firebase
    await updateDoc(docRef, {
      productos: idsValidos,
      updatedAt: new Date()
    });
    
    console.log("🎉 Configuración actualizada correctamente");
  }
};

limpiarMasVendidos();