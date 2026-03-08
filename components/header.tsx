'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'
import { Menu, X, Search, ChevronDown, Zap } from 'lucide-react'
import { SearchDialog } from './search-dialog'

export function Header() {
  const { language, setLanguage, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const categories = [
    { key: 'motorcycles', href: '/products/motorcycles' },
    { key: 'scooters', href: '/products/scooters' },
    { key: 'bicycles', href: '/products/bicycles' },
    { key: 'accessories', href: '/products/accessories' },
  ] as const

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="hidden text-lg font-bold tracking-tight sm:block">
                Electric Scooter House
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:items-center lg:gap-1">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              >
                {t.nav.home}
              </Link>
              
              <div className="group relative">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-primary">
                  {t.nav.products}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="invisible absolute left-0 top-full w-56 rounded-lg bg-secondary p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {categories.map((cat) => (
                    <Link
                      key={cat.key}
                      href={cat.href}
                      className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {t.categories[cat.key]}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/about"
                className="px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              >
                {t.nav.about}
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              >
                {t.nav.contact}
              </Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'el' : 'en')}
                className="flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {language === 'en' ? 'EL' : 'EN'}
              </button>

              {/* Admin Link (hidden on mobile) */}
              <Link
                href="/admin"
                className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent sm:block"
              >
                {t.nav.admin}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-primary hover:text-primary-foreground lg:hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-secondary lg:hidden">
            <div className="space-y-1 px-4 py-3">
              <Link
                href="/"
                className="block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.home}
              </Link>
              <div className="py-2">
                <span className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.nav.products}
                </span>
              </div>
              {categories.map((cat) => (
                <Link
                  key={cat.key}
                  href={cat.href}
                  className="block rounded-md px-6 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.categories[cat.key]}
                </Link>
              ))}
              <Link
                href="/about"
                className="block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.about}
              </Link>
              <Link
                href="/contact"
                className="block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.contact}
              </Link>
              <Link
                href="/admin"
                className="block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.admin}
              </Link>
            </div>
          </div>
        )}
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
