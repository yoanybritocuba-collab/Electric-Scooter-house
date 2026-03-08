import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Product, HeroSlide, StoreSettings } from './types'

// Collection names - adjust these to match your Firestore collections
const COLLECTIONS = {
  products: 'products',
  sliders: 'sliders',
  settings: 'settings',
  categories: 'categories',
}

// ============ PRODUCTS ============

export async function getProducts(constraints?: QueryConstraint[]): Promise<Product[]> {
  try {
    const productsRef = collection(db, COLLECTIONS.products)
    const q = constraints ? query(productsRef, ...constraints) : productsRef
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[]
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return getProducts([where('category', '==', category)])
}

export async function getFeaturedProducts(limitCount = 6): Promise<Product[]> {
  return getProducts([where('featured', '==', true), limit(limitCount)])
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const products = await getProducts([where('slug', '==', slug), limit(1)])
    return products[0] || null
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return null
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, COLLECTIONS.products, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product
    }
    return null
  } catch (error) {
    console.error('Error fetching product by id:', error)
    return null
  }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.products), {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding product:', error)
    return null
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.products, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error('Error updating product:', error)
    return false
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.products, id))
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    return false
  }
}

// ============ SLIDERS ============

export async function getSliders(): Promise<HeroSlide[]> {
  try {
    const slidersRef = collection(db, COLLECTIONS.sliders)
    const q = query(slidersRef, orderBy('order', 'asc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HeroSlide[]
  } catch (error) {
    console.error('Error fetching sliders:', error)
    return []
  }
}

export async function addSlider(slider: Omit<HeroSlide, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.sliders), slider)
    return docRef.id
  } catch (error) {
    console.error('Error adding slider:', error)
    return null
  }
}

export async function updateSlider(id: string, data: Partial<HeroSlide>): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.sliders, id)
    await updateDoc(docRef, data)
    return true
  } catch (error) {
    console.error('Error updating slider:', error)
    return false
  }
}

export async function deleteSlider(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.sliders, id))
    return true
  } catch (error) {
    console.error('Error deleting slider:', error)
    return false
  }
}

// ============ SETTINGS ============

export async function getSettings(): Promise<StoreSettings | null> {
  try {
    const settingsRef = collection(db, COLLECTIONS.settings)
    const snapshot = await getDocs(settingsRef)
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as StoreSettings
    }
    return null
  } catch (error) {
    console.error('Error fetching settings:', error)
    return null
  }
}

export async function updateSettings(id: string, data: Partial<StoreSettings>): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.settings, id)
    await updateDoc(docRef, data)
    return true
  } catch (error) {
    console.error('Error updating settings:', error)
    return false
  }
}

// ============ SEARCH ============

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  try {
    // Firestore doesn't support full-text search natively
    // This fetches all products and filters client-side
    // For production, consider using Algolia or Elasticsearch
    const products = await getProducts()
    const term = searchTerm.toLowerCase()
    
    return products.filter((product) => {
      const nameMatch = product.name.en.toLowerCase().includes(term) || 
                        product.name.el.toLowerCase().includes(term)
      const descMatch = product.description.en.toLowerCase().includes(term) || 
                        product.description.el.toLowerCase().includes(term)
      const catMatch = product.category.toLowerCase().includes(term)
      
      return nameMatch || descMatch || catMatch
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}

// ============ RELATED PRODUCTS ============

export async function getRelatedProducts(product: Product, limitCount = 4): Promise<Product[]> {
  try {
    const products = await getProducts([
      where('category', '==', product.category),
      limit(limitCount + 1),
    ])
    
    // Filter out the current product
    return products.filter((p) => p.id !== product.id).slice(0, limitCount)
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}
