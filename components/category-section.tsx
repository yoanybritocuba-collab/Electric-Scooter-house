'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Bike, Zap, Battery, Wrench } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

const categories = [
  {
    key: 'motorcycles',
    icon: Zap,
    image: '/images/categories/motorcycles.jpg',
    color: 'from-primary/80 to-primary/40',
  },
  {
    key: 'scooters',
    icon: Battery,
    image: '/images/categories/scooters.jpg',
    color: 'from-accent/80 to-accent/40',
  },
  {
    key: 'bicycles',
    icon: Bike,
    image: '/images/categories/bicycles.jpg',
    color: 'from-primary/80 to-primary/40',
  },
  {
    key: 'accessories',
    icon: Wrench,
    image: '/images/categories/accessories.jpg',
    color: 'from-accent/80 to-accent/40',
  },
] as const

export function CategorySection() {
  const { t } = useLanguage()

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.nav.products}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t.hero.subtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.key}
                href={`/products/${category.key}`}
                className="group relative overflow-hidden rounded-xl bg-card aspect-[3/4]"
              >
                <Image
                  src={category.image}
                  alt={t.categories[category.key]}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color}`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-primary-foreground/20 p-4 backdrop-blur-sm">
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-foreground">
                    {t.categories[category.key]}
                  </h3>
                  <span className="mt-4 flex items-center gap-2 text-sm font-medium text-primary-foreground opacity-0 transition-all group-hover:opacity-100">
                    {t.products.viewAll}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
