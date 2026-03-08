'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useLanguage } from '@/lib/language-context'
import { useProductsByCategory } from '@/hooks/use-firestore'
import { getProductsByCategory as getFallbackProducts } from '@/lib/data'
import type { Category } from '@/lib/types'

const validCategories: Category[] = ['motorcycles', 'scooters', 'bicycles', 'accessories']

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = use(params)
  const { t } = useLanguage()
  
  const { data: firestoreProducts, isLoading } = useProductsByCategory(category)

  if (!validCategories.includes(category as Category)) {
    notFound()
  }

  // Use Firestore data if available, otherwise fallback to mock data
  const products = firestoreProducts && firestoreProducts.length > 0 
    ? firestoreProducts 
    : getFallbackProducts(category)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-secondary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight text-secondary-foreground sm:text-5xl">
              {t.categories[category as Category]}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {products.length > 0
                ? `${products.length} ${products.length === 1 ? 'product' : 'products'} available`
                : t.products.noProducts}
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">{t.products.noProducts}</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
