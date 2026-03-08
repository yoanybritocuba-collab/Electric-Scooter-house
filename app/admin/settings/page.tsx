'use client'

import { useAdminAuth } from '@/lib/admin-auth'
import { AdminLogin } from '@/components/admin-login'
import { AdminSidebar } from '@/components/admin-sidebar'
import { useLanguage } from '@/lib/language-context'
import { contactInfo } from '@/lib/data'
import { Save, Globe, Phone, Mail, MapPin, ExternalLink } from 'lucide-react'

function SettingsContent() {
  const { language, t } = useLanguage()

  return (
    <div className="ml-64 min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <h1 className="text-xl font-bold text-foreground">{t.admin.settings}</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
          <Save className="h-4 w-4" />
          {t.admin.save}
        </button>
      </header>

      <main className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Phone className="h-5 w-5 text-primary" />
              {language === 'en' ? 'Contact Information' : 'Στοιχεία Επικοινωνίας'}
            </h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {language === 'en' ? 'Phone Number' : 'Τηλέφωνο'}
                </label>
                <input
                  type="tel"
                  defaultValue={contactInfo.phone}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {language === 'en' ? 'Email Address' : 'Email'}
                </label>
                <input
                  type="email"
                  defaultValue={contactInfo.email}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {language === 'en' ? 'Address (English)' : 'Διεύθυνση (Αγγλικά)'}
                </label>
                <input
                  type="text"
                  defaultValue={contactInfo.address.en}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {language === 'en' ? 'Address (Greek)' : 'Διεύθυνση (Ελληνικά)'}
                </label>
                <input
                  type="text"
                  defaultValue={contactInfo.address.el}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {language === 'en' ? 'Working Hours (English)' : 'Ωράριο (Αγγλικά)'}
                </label>
                <input
                  type="text"
                  defaultValue={contactInfo.hours.en}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {language === 'en' ? 'Working Hours (Greek)' : 'Ωράριο (Ελληνικά)'}
                </label>
                <input
                  type="text"
                  defaultValue={contactInfo.hours.el}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Globe className="h-5 w-5 text-primary" />
              {language === 'en' ? 'Social Media Links' : 'Σύνδεσμοι Social Media'}
            </h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Facebook
                </label>
                <input
                  type="url"
                  defaultValue={contactInfo.socialLinks.facebook}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Instagram
                </label>
                <input
                  type="url"
                  defaultValue={contactInfo.socialLinks.instagram}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  YouTube
                </label>
                <input
                  type="url"
                  defaultValue={contactInfo.socialLinks.youtube}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Database Connection */}
          <div className="rounded-xl bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <ExternalLink className="h-5 w-5 text-primary" />
              {language === 'en' ? 'Database Connection' : 'Σύνδεση Βάσης Δεδομένων'}
            </h2>
            <div className="mt-4 rounded-lg bg-amber-500/10 p-4">
              <p className="text-sm text-amber-600">
                {language === 'en'
                  ? 'No database connected. Currently using mock data. To enable full CRUD functionality:'
                  : 'Δεν υπάρχει συνδεδεμένη βάση δεδομένων. Αυτή τη στιγμή χρησιμοποιούνται δοκιμαστικά δεδομένα. Για πλήρη λειτουργικότητα CRUD:'}
              </p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>
                  {language === 'en'
                    ? 'Click on "Connect" in the top-right settings menu'
                    : 'Κάντε κλικ στο "Connect" στο μενού ρυθμίσεων πάνω δεξιά'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Choose Supabase or Neon as your database provider'
                    : 'Επιλέξτε Supabase ή Neon ως πάροχο βάσης δεδομένων'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Follow the setup instructions'
                    : 'Ακολουθήστε τις οδηγίες εγκατάστασης'}
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminSettingsPage() {
  const { isAuthenticated } = useAdminAuth()

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <>
      <AdminSidebar />
      <SettingsContent />
    </>
  )
}
