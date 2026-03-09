'use client'

import { useFeaturedProducts } from '@/hooks/use-firestore'
import { getFeaturedProducts as getFallbackFeatured } from '@/lib/data'
import { ProductCard } from './product-card'
import { useLanguage } from '@/lib/language-context'

export function FeaturedProducts() {
  const { t } = useLanguage()
  const { data: firestoreProducts, isLoading } = useFeaturedProducts()
  
  // Use Firestore data if available, otherwise fallback to mock data
  const featuredProducts = firestoreProducts && firestoreProducts.length > 0 
    ? firestoreProducts 
    : getFallbackFeatured()

  if (isLoading) {
    return (
      <section className="bg-muted py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.products?.featured || 'Featured Products'}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t.products?.featuredDesc || 'Discover our most popular electric vehicles...'}
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-muted-foreground/10" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-muted py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.products?.featured || 'Featured Products'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t.products?.featuredDesc || 'Discover our most popular electric vehicles, handpicked for quality and performance.'}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}