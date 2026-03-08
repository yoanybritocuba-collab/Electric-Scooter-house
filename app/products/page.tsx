'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useLanguage } from '@/lib/language-context'
import { useProducts } from '@/hooks/use-firestore'
import { products as fallbackProducts } from '@/lib/data'
import { fuzzySearchProducts } from '@/lib/fuzzy-search'
import { Search, Filter } from 'lucide-react'
import type { Category } from '@/lib/types'

const categories: (Category | 'all')[] = ['all', 'motorcycles', 'scooters', 'bicycles', 'accessories']

export default function AllProductsPage() {
  const { language, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name')
  
  const { data: firestoreProducts, isLoading } = useProducts()
  
  // Use Firestore data if available, otherwise fallback to mock data
  const products = firestoreProducts && firestoreProducts.length > 0 ? firestoreProducts : fallbackProducts

  // Filter products
  let filteredProducts = searchQuery
    ? fuzzySearchProducts(products, searchQuery, language)
    : products

  if (selectedCategory !== 'all') {
    filteredProducts = filteredProducts.filter((p) => p.category === selectedCategory)
  }

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      default:
        return a.name[language].localeCompare(b.name[language])
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-secondary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight text-secondary-foreground sm:text-5xl">
              {t.nav.products}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {language === 'en'
                ? 'Browse our complete collection of electric vehicles'
                : 'Περιηγηθείτε στην πλήρη συλλογή ηλεκτρικών οχημάτων'}
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.products.searchPlaceholder}
                  className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {cat === 'all'
                      ? language === 'en'
                        ? 'All'
                        : 'Όλα'
                      : t.categories[cat]}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="name">
                  {language === 'en' ? 'Sort by Name' : 'Ταξινόμηση κατά Όνομα'}
                </option>
                <option value="price-asc">
                  {language === 'en' ? 'Price: Low to High' : 'Τιμή: Χαμηλή προς Υψηλή'}
                </option>
                <option value="price-desc">
                  {language === 'en' ? 'Price: High to Low' : 'Τιμή: Υψηλή προς Χαμηλή'}
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-6 text-sm text-muted-foreground">
              {filteredProducts.length}{' '}
              {language === 'en'
                ? filteredProducts.length === 1
                  ? 'product found'
                  : 'products found'
                : filteredProducts.length === 1
                ? 'προϊόν βρέθηκε'
                : 'προϊόντα βρέθηκαν'}
            </p>

            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
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
