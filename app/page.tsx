'use client'

import { Header } from '@/components/header'
import { HeroSlider } from '@/components/hero-slider'
import { CategorySection } from '@/components/category-section'
import { FeaturedProducts } from '@/components/featured-products'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/lib/language-context'
import { Zap, Truck, Shield, Headphones } from 'lucide-react'

function Features() {
  const { language } = useLanguage()

  const features = [
    {
      icon: Truck,
      title: { en: 'Free Delivery', el: 'Δωρεάν Παράδοση' },
      description: { en: 'Free delivery in Athens area', el: 'Δωρεάν παράδοση στην Αττική' },
    },
    {
      icon: Shield,
      title: { en: 'Warranty', el: 'Εγγύηση' },
      description: { en: 'Up to 5 years warranty', el: 'Εγγύηση έως 5 έτη' },
    },
    {
      icon: Zap,
      title: { en: 'Test Rides', el: 'Δοκιμαστικές' },
      description: { en: 'Try before you buy', el: 'Δοκιμάστε πριν αγοράσετε' },
    },
    {
      icon: Headphones,
      title: { en: 'Support', el: 'Υποστήριξη' },
      description: { en: 'Expert advice & service', el: 'Εξειδικευμένη βοήθεια & service' },
    },
  ]

  return (
    <section className="bg-secondary py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-foreground">
                    {feature.title[language]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description[language]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const { language } = useLanguage()

  return (
    <section className="bg-primary py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          {language === 'en'
            ? 'Ready to Go Electric?'
            : 'Έτοιμοι για Ηλεκτρική Μετακίνηση;'}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
          {language === 'en'
            ? 'Visit our showroom in Athens or contact us for a personalized consultation.'
            : 'Επισκεφθείτε το showroom μας στην Αθήνα ή επικοινωνήστε μαζί μας για εξατομικευμένη συμβουλευτική.'}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/contact"
            className="inline-flex items-center rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
          >
            {language === 'en' ? 'Contact Us' : 'Επικοινωνία'}
          </a>
          <a
            href="tel:+302101234567"
            className="inline-flex items-center rounded-lg border-2 border-primary-foreground px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            +30 210 123 4567
          </a>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSlider />
        <Features />
        <CategorySection />
        <FeaturedProducts />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
