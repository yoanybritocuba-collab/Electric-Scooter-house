'use client'

import useSWR from 'swr'
import {
  getProducts,
  getProductsByCategory,
  getFeaturedProducts,
  getProductBySlug,
  getSliders,
  getSettings,
  searchProducts,
  getRelatedProducts,
} from '@/lib/firestore-service'
import type { Product } from '@/lib/types'

// Products hooks
export function useProducts() {
  return useSWR('products', getProducts)
}

export function useProductsByCategory(category: string) {
  return useSWR(category ? `products-${category}` : null, () => getProductsByCategory(category))
}

export function useFeaturedProducts(limit = 6) {
  return useSWR(`featured-products-${limit}`, () => getFeaturedProducts(limit))
}

export function useProduct(slug: string) {
  return useSWR(slug ? `product-${slug}` : null, () => getProductBySlug(slug))
}

export function useRelatedProducts(product: Product | null, limit = 4) {
  return useSWR(
    product ? `related-${product.id}-${limit}` : null,
    () => product ? getRelatedProducts(product, limit) : []
  )
}

// Sliders hooks
export function useSliders() {
  return useSWR('sliders', getSliders)
}

// Settings hooks
export function useSettings() {
  return useSWR('settings', getSettings)
}

// Search hook
export function useSearch(query: string) {
  return useSWR(
    query && query.length >= 2 ? `search-${query}` : null,
    () => searchProducts(query),
    { revalidateOnFocus: false }
  )
}
