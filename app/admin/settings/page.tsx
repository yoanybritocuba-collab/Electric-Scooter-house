'use client'

import { useState } from 'react'
import { useAdminAuth } from '@/lib/admin-auth'
import { AdminLogin } from '@/components/admin-login'
import { AdminSidebar } from '@/components/admin-sidebar'
import { useLanguage } from '@/lib/language-context'
import { contactInfo } from '@/lib/data'
import { Save, Globe, Phone, Mail, MapPin, ExternalLink, Loader2 } from 'lucide-react'

function SettingsContent() {
  const { language, t } = useLanguage()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    phone: contactInfo.phone,
    email: contactInfo.email,
    addressEn: contactInfo.address.en,
    addressEl: contactInfo.address.el,
    hoursEn: contactInfo.hours.en,
    hoursEl: contactInfo.hours.el,
    facebook: contactInfo.socialLinks.facebook,
    instagram: contactInfo.socialLinks.instagram,
    youtube: contactInfo.socialLinks.youtube
  })

  const handleSave = async () => {
    setSaving(true)
    // Simular guardado (aquí iría la llamada a Firebase)
    setTimeout(() => {
      setSaving(false)
      const successMessages = {
        en: 'Settings saved successfully',
        es: 'Configuración guardada correctamente',
        it: 'Impostazioni salvate con successo',
        el: 'Οι ρυθμίσεις αποθηκεύτηκαν με επιτυχία'
      }
      alert(successMessages[language])
    }, 1000)
  }

  // Textos según idioma
  const texts = {
    contactInfo: {
      en: 'Contact Information',
      es: 'Información de Contacto',
      it: 'Informazioni di Contatto',
      el: 'Στοιχεία Επικοινωνίας'
    },
    phone: {
      en: 'Phone Number',
      es: 'Teléfono',
      it: 'Telefono',
      el: 'Τηλέφωνο'
    },
    email: {
      en: 'Email Address',
      es: 'Correo Electrónico',
      it: 'Indirizzo Email',
      el: 'Διεύθυνση Email'
    },
    addressEn: {
      en: 'Address (English)',
      es: 'Dirección (Inglés)',
      it: 'Indirizzo (Inglese)',
      el: 'Διεύθυνση (Αγγλικά)'
    },
    addressEl: {
      en: 'Address (Greek)',
      es: 'Dirección (Griego)',
      it: 'Indirizzo (Greco)',
      el: 'Διεύθυνση (Ελληνικά)'
    },
    hoursEn: {
      en: 'Working Hours (English)',
      es: 'Horario (Inglés)',
      it: 'Orario (Inglese)',
      el: 'Ωράριο (Αγγλικά)'
    },
    hoursEl: {
      en: 'Working Hours (Greek)',
      es: 'Horario (Griego)',
      it: 'Orario (Greco)',
      el: 'Ωράριο (Ελληνικά)'
    },
    socialLinks: {
      en: 'Social Media Links',
      es: 'Redes Sociales',
      it: 'Link Social',
      el: 'Σύνδεσμοι Social Media'
    },
    database: {
      en: 'Database Connection',
      es: 'Conexión a Base de Datos',
      it: 'Connessione Database',
      el: 'Σύνδεση Βάσης Δεδομένων'
    },
    noDb: {
      en: 'No database connected. Currently using mock data. To enable full CRUD functionality:',
      es: 'No hay base de datos conectada. Actualmente usando datos de prueba. Para funcionalidad CRUD completa:',
      it: 'Nessun database connesso. Attualmente utilizzo dati di test. Per funzionalità CRUD completa:',
      el: 'Δεν υπάρχει συνδεδεμένη βάση δεδομένων. Αυτή τη στιγμή χρησιμοποιούνται δοκιμαστικά δεδομένα. Για πλήρη λειτουργικότητα CRUD:'
    },
    step1: {
      en: 'Click on "Connect" in the top-right settings menu',
      es: 'Haz clic en "Conectar" en el menú superior derecho',
      it: 'Clicca su "Connetti" nel menu in alto a destra',
      el: 'Κάντε κλικ στο "Σύνδεση" στο μενού πάνω δεξιά'
    },
    step2: {
      en: 'Choose Supabase or Neon as your database provider',
      es: 'Elige Supabase o Neon como proveedor de base de datos',
      it: 'Scegli Supabase o Neon come provider del database',
      el: 'Επιλέξτε Supabase ή Neon ως πάροχο βάσης δεδομένων'
    },
    step3: {
      en: 'Follow the setup instructions',
      es: 'Sigue las instrucciones de configuración',
      it: 'Segui le istruzioni di configurazione',
      el: 'Ακολουθήστε τις οδηγίες εγκατάστασης'
    }
  }

  return (
    <div className="ml-64 min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <h1 className="text-xl font-bold text-foreground">{t.admin.settings}</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t.admin.save}
        </button>
      </header>

      <main className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Phone className="h-5 w-5 text-primary" />
              {texts.contactInfo[language]}
            </h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.phone[language]}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.email[language]}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.addressEn[language]}
                </label>
                <input
                  type="text"
                  value={formData.addressEn}
                  onChange={(e) => setFormData({...formData, addressEn: e.target.value})}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.addressEl[language]}
                </label>
                <input
                  type="text"
                  value={formData.addressEl}
                  onChange={(e) => setFormData({...formData, addressEl: e.target.value})}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.hoursEn[language]}
                </label>
                <input
                  type="text"
                  value={formData.hoursEn}
                  onChange={(e) => setFormData({...formData, hoursEn: e.target.value})}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.hoursEl[language]}
                </label>
                <input
                  type="text"
                  value={formData.hoursEl}
                  onChange={(e) => setFormData({...formData, hoursEl: e.target.value})}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Globe className="h-5 w-5 text-primary" />
              {texts.socialLinks[language]}
            </h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  YouTube
                </label>
                <input
                  type="url"
                  value={formData.youtube}
                  onChange={(e) => setFormData({...formData, youtube: e.target.value})}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Database Connection */}
          <div className="rounded-xl bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <ExternalLink className="h-5 w-5 text-primary" />
              {texts.database[language]}
            </h2>
            <div className="mt-4 rounded-lg bg-amber-500/10 p-4">
              <p className="text-sm text-amber-600">
                {texts.noDb[language]}
              </p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>{texts.step1[language]}</li>
                <li>{texts.step2[language]}</li>
                <li>{texts.step3[language]}</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminSettingsPage() {
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
      <SettingsContent />
    </>
  )
}