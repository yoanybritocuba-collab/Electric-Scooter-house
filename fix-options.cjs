const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC7dQ3v5NzT5XP-qk6PRs0lE8jLfK9lM8k",
  authDomain: "electric-scooter-house-tienda.firebaseapp.com",
  projectId: "electric-scooter-house-tienda",
  storageBucket: "electric-scooter-house-tienda.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fix() {
  try {
    const docRef = doc(db, 'productos', '6PIwBxdqBAKF8IxFN8Ve');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return console.log('No encontrado');
    const data = docSnap.data();
    const colores = data.variantes?.map((v, i) => ({
      id: v.id || color_\,
      nombre: v.colorNombre || 'Color',
      nombre_en: v.colorNombreEn || v.colorNombre || 'Color',
      nombre_gr: v.colorNombreGr || v.colorNombre || 'Χρώμα',
      precioExtra: v.precioExtra || 0,
      stock: v.stock || 0,
      codigoColor: v.codigoColor || '#888888',
      imagenes: v.imagenes || []
    })) || [];
    await updateDoc(docRef, { opciones: { voltajes: [], potencias: [], colores } });
    console.log('✅ Producto actualizado!', colores.length, 'colores');
  } catch (error) { console.error('Error:', error.message); }
}
fix();
