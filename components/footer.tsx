'use client'

import Link from 'next/link'
import { Zap, Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { contactInfo } from '@/lib/data'

export function Footer() {
  const { language, t } = useLanguage()

  const quickLinks = [
    { label: t.nav.home, href: '/' },
    { label: t.categories.motorcycles, href: '/products/motorcycles' },
    { label: t.categories.scooters, href: '/products/scooters' },
    { label: t.categories.bicycles, href: '/products/bicycles' },
    { label: t.categories.accessories, href: '/products/accessories' },
    { label: t.nav.about, href: '/about' },
    { label: t.nav.contact, href: '/contact' },
  ]

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Electric Scooter House
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {language === 'en'
                ? 'Your trusted partner for premium electric vehicles in Greece. Experience the future of urban mobility.'
                : 'Ο αξιόπιστος συνεργάτης σας για premium ηλεκτρικά οχήματα στην Ελλάδα. Ζήστε το μέλλον της αστικής κινητικότητας.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold">{t.footer.quickLinks}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold">{t.footer.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{contactInfo.address[language]}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="hover:text-primary">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-primary">
                  {contactInfo.email}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              {contactInfo.hours[language]}
            </p>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 font-semibold">{t.footer.followUs}</h3>
            <div className="flex gap-3">
              {contactInfo.socialLinks.facebook && (
                <a
                  href={contactInfo.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {contactInfo.socialLinks.instagram && (
                <a
                  href={contactInfo.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {contactInfo.socialLinks.youtube && (
                <a
                  href={contactInfo.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Electric Scooter House. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
