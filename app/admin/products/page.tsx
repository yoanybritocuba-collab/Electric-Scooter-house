'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth'
import { AdminLogin } from '@/components/admin-login'
import { AdminSidebar } from '@/components/admin-sidebar'
import { useLanguage } from '@/lib/language-context'
import { useProducts } from '@/hooks/use-firestore'
import { products as fallbackProducts } from '@/lib/data'
import { deleteProduct } from '@/lib/firestore-service'
import { Search, Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react'

function ProductsContent() {
  const { language, t } = useLanguage()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const { data: firestoreProducts, isLoading, mutate } = useProducts()
  
  // Use Firestore data if available, otherwise fallback to mock data
  const products = firestoreProducts && firestoreProducts.length > 0 ? firestoreProducts : fallbackProducts

  const handleDelete = async (id: string) => {
    // Mensaje de confirmación en 4 idiomas
    const confirmMessages = {
      en: 'Are you sure you want to delete this product?',
      es: '¿Estás seguro de que quieres eliminar este producto?',
      it: 'Sei sicuro di voler eliminare questo prodotto?',
      el: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν;'
    }
    
    if (!confirm(confirmMessages[language])) return
    
    setDeletingId(id)
    const success = await deleteProduct(id)
    if (success) {
      mutate() // Refresh the products list
    }
    setDeletingId(null)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name[language] || product.name.en).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description[language] || product.description.en).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Textos según idioma
  const texts = {
    allCategories: {
      en: 'All Categories',
      es: 'Todas las Categorías',
      it: 'Tutte le Categorie',
      el: 'Όλες οι Κατηγορίες'
    },
    product: {
      en: 'Product',
      es: 'Producto',
      it: 'Prodotto',
      el: 'Προϊόν'
    },
    category: {
      en: 'Category',
      es: 'Categoría',
      it: 'Categoria',
      el: 'Κατηγορία'
    },
    price: {
      en: 'Price',
      es: 'Precio',
      it: 'Prezzo',
      el: 'Τιμή'
    },
    status: {
      en: 'Status',
      es: 'Estado',
      it: 'Stato',
      el: 'Κατάσταση'
    },
    featured: {
      en: 'Featured',
      es: 'Destacado',
      it: 'In Vetrina',
      el: 'Προτεινόμενο'
    },
    actions: {
      en: 'Actions',
      es: 'Acciones',
      it: 'Azioni',
      el: 'Ενέργειες'
    },
    yes: {
      en: 'Yes',
      es: 'Sí',
      it: 'Sì',
      el: 'Ναι'
    },
    no: {
      en: 'No',
      es: 'No',
      it: 'No',
      el: 'Όχι'
    },
    showing: {
      en: `Showing ${filteredProducts.length} of ${products.length} products`,
      es: `Mostrando ${filteredProducts.length} de ${products.length} productos`,
      it: `Mostrando ${filteredProducts.length} di ${products.length} prodotti`,
      el: `Εμφάνιση ${filteredProducts.length} από ${products.length} προϊόντα`
    }
  }

  if (isLoading) {
    return (
      <div className="ml-64 flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="ml-64 min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <h1 className="text-xl font-bold text-foreground">{t.admin.products}</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
          {t.admin.addProduct}
        </Link>
      </header>

      <main className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.products.searchPlaceholder}
              className="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-input bg-card px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">{texts.allCategories[language]}</option>
            <option value="motorcycles">{t.categories.motorcycles}</option>
            <option value="scooters">{t.categories.scooters}</option>
            <option value="bicycles">{t.categories.bicycles}</option>
            <option value="accessories">{t.categories.accessories}</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4 font-medium">{texts.product[language]}</th>
                  <th className="px-6 py-4 font-medium">{texts.category[language]}</th>
                  <th className="px-6 py-4 font-medium">{texts.price[language]}</th>
                  <th className="px-6 py-4 font-medium">{texts.status[language]}</th>
                  <th className="px-6 py-4 font-medium">{texts.featured[language]}</th>
                  <th className="px-6 py-4 font-medium">{texts.actions[language]}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border hover:bg-muted/30 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name[language] || product.name.en}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                              <span className="text-xs">No img</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {product.name[language] || product.name.en}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {product.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize text-foreground">
                        {t.categories[product.category as keyof typeof t.categories] || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      €{product.price?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.inStock
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {product.inStock ? t.products.inStock : t.products.outOfStock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.featured
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {product.featured ? texts.yes[language] : texts.no[language]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {t.products.noProducts}
            </div>
          )}
        </div>

        {/* Info */}
        <p className="mt-4 text-sm text-muted-foreground">
          {texts.showing[language]}
        </p>
      </main>
    </div>
  )
}

export default function AdminProductsPage() {
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <>
      <AdminSidebar />
      <ProductsContent />
    </>
  )
}