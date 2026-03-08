'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage()

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-xl bg-card transition-all hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={product.images[0]}
          alt={product.name[language]}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/60">
            <span className="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground">
              {t.products.outOfStock}
            </span>
          </div>
        )}
        {product.featured && product.inStock && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Featured
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          {t.categories[product.category]}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-card-foreground line-clamp-2">
          {product.name[language]}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {product.description[language]}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            €{product.price.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-primary group-hover:underline">
            {t.products.viewDetails} →
          </span>
        </div>
      </div>
    </Link>
  )
}
