'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { useSliders } from '@/hooks/use-firestore'
import { sliderItems as fallbackSliders } from '@/lib/data'

export function HeroSlider() {
  const { language } = useLanguage()
  const { data: firestoreSliders, isLoading } = useSliders()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Use Firestore data if available, otherwise fallback to mock data
  const sliderItems = firestoreSliders && firestoreSliders.length > 0 ? firestoreSliders : fallbackSliders

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % sliderItems.length)
  }, [sliderItems.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + sliderItems.length) % sliderItems.length)
  }, [sliderItems.length])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [isPaused, nextSlide])

  return (
    <section
      className="relative h-[100vh] min-h-[600px] w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {sliderItems.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 bg-secondary">
            <Image
              src={slide.image}
              alt={slide.title[language]}
              fill
              className="object-cover opacity-60"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-20 flex h-full items-center">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <h1 className="text-balance text-4xl font-bold tracking-tight text-secondary-foreground sm:text-5xl lg:text-6xl">
                  {slide.title[language]}
                </h1>
                <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
                  {slide.subtitle[language]}
                </p>
                <Link
                  href={slide.buttonLink}
                  className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-accent"
                >
                  {slide.buttonText[language]}
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50 text-secondary-foreground backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50 text-secondary-foreground backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {sliderItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === currentSlide
                ? 'w-8 bg-primary'
                : 'w-2.5 bg-secondary-foreground/50 hover:bg-secondary-foreground/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
