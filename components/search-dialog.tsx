'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { useProducts } from '@/hooks/use-firestore'
import { products as fallbackProducts } from '@/lib/data'
import { fuzzySearchProducts } from '@/lib/fuzzy-search'
import type { Product } from '@/lib/types'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { language, t } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const { data: firestoreProducts } = useProducts()
  
  // Use Firestore data if available, otherwise fallback to mock data
  const products = firestoreProducts && firestoreProducts.length > 0 ? firestoreProducts : fallbackProducts

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }
    const searchResults = fuzzySearchProducts(products, searchQuery, language)
    setResults(searchResults.slice(0, 6))
  }, [language, products])

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(query)
    }, 150)
    return () => clearTimeout(debounce)
  }, [query, handleSearch])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpenChange])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setQuery('')
      setResults([])
    } else {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleProductClick = (slug: string) => {
    router.push(`/product/${slug}`)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-secondary/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div className="relative mx-4 w-full max-w-2xl rounded-xl bg-card shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.products.searchPlaceholder}
            className="flex-1 bg-transparent px-4 py-4 text-lg outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product.slug)}
                className="flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors hover:bg-muted"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={product.images[0]}
                    alt={product.name[language]}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {product.name[language]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t.categories[product.category]} • €{product.price.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    product.inStock
                      ? 'bg-primary/20 text-primary'
                      : 'bg-destructive/20 text-destructive'
                  }`}
                >
                  {product.inStock ? t.products.inStock : t.products.outOfStock}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {query && results.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {t.products.noProducts}
          </div>
        )}

        {/* Keyboard Shortcut Hint */}
        <div className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">ESC</kbd> to close
        </div>
      </div>
    </div>
  )
}
