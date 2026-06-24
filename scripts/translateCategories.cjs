const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Configuración de Firebase (la misma de tu proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyB1DVgrY0YlObelUPRhneUGz3jj08FBdkg",
  authDomain: "electric-scooter-house-tienda.firebaseapp.com",
  projectId: "electric-scooter-house-tienda",
  storageBucket: "electric-scooter-house-tienda.firebasestorage.app",
  messagingSenderId: "190555300752",
  appId: "1:190555300752:web:2aa7802f7b2963ed930915"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para traducir usando Google Translate API
async function translateText(text, targetLang) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=17b477fb2d7fd6762e3bccc16c0cdf8764b69fa7&q=${encodeURIComponent(text)}&target=${targetLang}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error(`Error traduciendo a ${targetLang}:`, error);
    return text; // Si falla, devuelve el texto original
  }
}

// Función principal
async function translateCategories() {
  console.log('🚀 Iniciando traducción de categorías...');
  
  const categoriesRef = collection(db, 'categorias');
  const snapshot = await getDocs(categoriesRef);
  
  let count = 0;
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const categoryId = docSnap.id;
    const spanishName = data.nombre;
    
    console.log(`\n📁 Categoría: ${categoryId} - ${spanishName}`);
    
    // Traducir a inglés
    const englishName = await translateText(spanishName, 'en');
    // Traducir a griego
    const greekName = await translateText(spanishName, 'el');
    
    // Actualizar en Firebase
    await updateDoc(doc(db, 'categorias', categoryId), {
      nombre_en: englishName,
      nombre_gr: greekName,
      updatedAt: new Date()
    });
    
    console.log(`  ✅ Español: ${spanishName}`);
    console.log(`  ✅ Inglés: ${englishName}`);
    console.log(`  ✅ Griego: ${greekName}`);
    
    count++;
  }
  
  console.log(`\n🎉 ${count} categorías traducidas correctamente`);
}

// Ejecutar
translateCategories().catch(console.error);