'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useLanguage } from '@/lib/language-context'
import { useProduct, useRelatedProducts } from '@/hooks/use-firestore'
import { getProductBySlug as getFallbackProduct, getProductsByCategory as getFallbackCategory } from '@/lib/data'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Zap,
  Battery,
  Gauge,
  Weight,
  Timer,
  Shield,
} from 'lucide-react'

const specIcons: Record<string, typeof Zap> = {
  motor: Zap,
  battery: Battery,
  range: Gauge,
  topSpeed: Gauge,
  weight: Weight,
  chargingTime: Timer,
  warranty: Shield,
}

const specLabels: Record<string, { en: string; el: string }> = {
  motor: { en: 'Motor', el: 'Κινητήρας' },
  battery: { en: 'Battery', el: 'Μπαταρία' },
  range: { en: 'Range', el: 'Αυτονομία' },
  topSpeed: { en: 'Top Speed', el: 'Μέγιστη Ταχύτητα' },
  chargingTime: { en: 'Charging Time', el: 'Χρόνος Φόρτισης' },
  weight: { en: 'Weight', el: 'Βάρος' },
  maxLoad: { en: 'Max Load', el: 'Μέγιστο Φορτίο' },
  brakes: { en: 'Brakes', el: 'Φρένα' },
  tires: { en: 'Tires', el: 'Ελαστικά' },
  suspension: { en: 'Suspension', el: 'Ανάρτηση' },
  lights: { en: 'Lights', el: 'Φώτα' },
  display: { en: 'Display', el: 'Οθόνη' },
  waterResistance: { en: 'Water Resistance', el: 'Αντοχή στο Νερό' },
  warranty: { en: 'Warranty', el: 'Εγγύηση' },
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { language, t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState(0)

  const { data: firestoreProduct, isLoading: productLoading } = useProduct(slug)
  
  // Use Firestore data if available, otherwise fallback to mock data
  const product = firestoreProduct || getFallbackProduct(slug)

  const { data: firestoreRelated } = useRelatedProducts(product, 4)
  
  // Fallback for related products
  const relatedProducts = firestoreRelated && firestoreRelated.length > 0
    ? firestoreRelated
    : product
      ? getFallbackCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4)
      : []

  if (!product) {
    notFound()
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setSelectedImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Breadcrumb */}
        <nav className="bg-muted">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-primary">
                {t.nav.home}
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link
                href={`/products/${product.category}`}
                className="text-muted-foreground hover:text-primary"
              >
                {t.categories[product.category]}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">{product.name[language]}</span>
            </div>
          </div>
        </nav>

        {/* Product Details */}
        <section className="py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-card">
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name[language]}
                    fill
                    className="object-cover"
                    priority
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/80 text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/80 text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary/60">
                      <span className="rounded-full bg-destructive px-6 py-3 text-lg font-medium text-destructive-foreground">
                        {t.products.outOfStock}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative h-20 w-20 overflow-hidden rounded-lg ${
                          index === selectedImage
                            ? 'ring-2 ring-primary'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name[language]} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-primary">
                  {t.categories[product.category]}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {product.name[language]}
                </h1>

                <div className="mt-4 flex items-center gap-4">
                  <span className="text-3xl font-bold text-primary">
                    €{product.price.toLocaleString()}
                  </span>
                  <span
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                      product.inStock
                        ? 'bg-primary/20 text-primary'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {product.inStock ? (
                      <>
                        <Check className="h-4 w-4" />
                        {t.products.inStock}
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        {t.products.outOfStock}
                      </>
                    )}
                  </span>
                </div>

                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  {product.description[language]}
                </p>

                {/* Quick Specs */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {['motor', 'battery', 'range', 'topSpeed', 'weight', 'warranty'].map(
                    (key) => {
                      const value = product.specs[key]
                      if (!value) return null
                      const Icon = specIcons[key] || Zap
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 rounded-lg bg-card p-3"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {specLabels[key]?.[language] || key}
                            </p>
                            <p className="font-medium text-foreground">{value}</p>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-accent"
                  >
                    {language === 'en' ? 'Contact for Purchase' : 'Επικοινωνία για Αγορά'}
                  </a>
                  <a
                    href={`tel:+302101234567`}
                    className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    +30 210 123 4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full Specifications */}
        <section className="bg-muted py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground">
              {t.products.specifications}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(product.specs).map(([key, value]) => {
                if (!value) return null
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg bg-card p-4"
                  >
                    <span className="font-medium text-muted-foreground">
                      {specLabels[key]?.[language] || key}
                    </span>
                    <span className="font-semibold text-foreground">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground">{t.products.features}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.features[language].map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-card p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="bg-muted py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground">
                {t.products.relatedProducts}
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
