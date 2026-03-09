'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AdminLogin } from '@/components/admin-login'
import { AdminSidebar } from '@/components/admin-sidebar'
import { useLanguage } from '@/lib/language-context'
import { products, sliderItems } from '@/lib/data'
import { Package, ImageIcon, TrendingUp, DollarSign } from 'lucide-react'

function DashboardContent() {
  const { t } = useLanguage()

  const stats = [
    {
      label: t.admin?.totalProducts || 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-primary/20 text-primary',
    },
    {
      label: t.admin?.inStock || 'In Stock',
      value: products.filter((p) => p.inStock).length,
      icon: TrendingUp,
      color: 'bg-green-500/20 text-green-500',
    },
    {
      label: t.admin?.featured || 'Featured',
      value: products.filter((p) => p.featured).length,
      icon: DollarSign,
      color: 'bg-amber-500/20 text-amber-500',
    },
    {
      label: t.admin?.sliderItems || 'Slider Items',
      value: sliderItems.length,
      icon: ImageIcon,
      color: 'bg-blue-500/20 text-blue-500',
    },
  ]

  const recentProducts = products.slice(0, 5)

  return (
    <div className="ml-64 min-h-screen bg-background">
      <header className="flex h-16 items-center border-b border-border bg-card px-6">
        <h1 className="text-xl font-bold text-foreground">
          {t.admin?.dashboard || 'Dashboard'}
        </h1>
      </header>

      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="rounded-xl bg-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Products */}
        <div className="mt-8 rounded-xl bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {t.admin?.recentProducts || 'Recent Products'}
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">
                    {t.admin?.product || 'Product'}
                  </th>
                  <th className="pb-3 font-medium">
                    {t.admin?.category || 'Category'}
                  </th>
                  <th className="pb-3 font-medium">
                    {t.admin?.price || 'Price'}
                  </th>
                  <th className="pb-3 font-medium">
                    {t.admin?.status || 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="py-4">
                      <span className="font-medium text-foreground">
                        {product.name[t.language as keyof typeof product.name] || product.name.en}
                      </span>
                    </td>
                    <td className="py-4 text-muted-foreground capitalize">
                      {t.categories?.[product.category as keyof typeof t.categories] || product.category}
                    </td>
                    <td className="py-4 font-medium text-foreground">
                      €{product.price.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.inStock
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {product.inStock
                          ? t.products?.inStock || 'In Stock'
                          : t.products?.outOfStock || 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-xl bg-primary/10 p-6">
          <h3 className="font-semibold text-foreground">
            {t.admin?.demoMode || 'Note: Demo Mode'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.admin?.demoDescription || 'This admin panel uses mock data. To enable full CRUD functionality, connect a database integration.'}
          </p>
        </div>
      </main>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (isLoading) {
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
      <DashboardContent />
    </>
  )
}