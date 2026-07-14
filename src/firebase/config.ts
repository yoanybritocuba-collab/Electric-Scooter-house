import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 🔥 VALORES DIRECTOS (NO usar import.meta.env)
const firebaseConfig = {
  apiKey: "AIzaSyB1DVgrY0YlObelUPRhneUGz3jj08FBdkg",
  authDomain: "electric-scooter-house-tienda.firebaseapp.com",
  projectId: "electric-scooter-house-tienda",
  storageBucket: "electric-scooter-house-tienda.firebasestorage.app",
  messagingSenderId: "190555300752",
  appId: "1:190555300752:web:2aa7802f7b2963ed930915",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// 🔥 HABILITAR CACHÉ (guarda productos en el navegador para que carguen más rápido)
enableIndexedDbPersistence(db).catch((err) => {
  console.warn('⚠️ Firebase cache error:', err);
});