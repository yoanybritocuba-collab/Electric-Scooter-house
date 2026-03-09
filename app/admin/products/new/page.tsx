'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth'
import { AdminLogin } from '@/components/admin-login'
import { AdminSidebar } from '@/components/admin-sidebar'
import { useLanguage } from '@/lib/language-context'
import { addProduct } from '@/lib/firestore-service'
import { AdminImageUpload } from '@/components/admin-image-upload'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

function NewProductForm() {
  const { language, t } = useLanguage()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    // Nombres en 4 idiomas
    name: {
      en: '',
      es: '',
      it: '',
      el: ''
    },
    // Descripciones en 4 idiomas
    description: {
      en: '',
      es: '',
      it: '',
      el: ''
    },
    price: '',
    category: 'motorcycles',
    inStock: true,
    featured: false,
    images: [] as string[],
    specifications: {
      battery: '',
      range: '',
      speed: '',
      chargingTime: '',
      motorPower: '',
      weight: '',
      warranty: ''
    }
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNameChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      name: { ...prev.name, [lang]: value }
    }))
  }

  const handleDescriptionChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      description: { ...prev.description, [lang]: value }
    }))
  }

  const handleSpecChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [field]: value }
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Validaciones básicas
    if (!formData.name.en || !formData.price) {
      const errorMessages = {
        en: 'Please fill in all required fields',
        es: 'Por favor completa todos los campos requeridos',
        it: 'Per favore compila tutti i campi obbligatori',
        el: 'Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία'
      }
      setError(errorMessages[language])
      setSaving(false)
      return
    }

    try {
      const slug = generateSlug(formData.name.en)
      const productData = {
        ...formData,
        slug,
        price: parseFloat(formData.price),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const id = await addProduct(productData)
      
      if (id) {
        const successMessages = {
          en: 'Product created successfully',
          es: 'Producto creado correctamente',
          it: 'Prodotto creato con successo',
          el: 'Το προϊόν δημιουργήθηκε με επιτυχία'
        }
        alert(successMessages[language])
        router.push('/admin/products')
        router.refresh()
      } else {
        throw new Error('Failed to create product')
      }
    } catch (err) {
      console.error('Error saving product:', err)
      const errorMessages = {
        en: 'Error saving product. Please try again.',
        es: 'Error al guardar el producto. Intenta de nuevo.',
        it: 'Errore durante il salvataggio. Riprova.',
        el: 'Σφάλμα κατά την αποθήκευση. Δοκιμάστε ξανά.'
      }
      setError(errorMessages[language])
    } finally {
      setSaving(false)
    }
  }

  // Textos según idioma
  const texts = {
    newProduct: {
      en: 'New Product',
      es: 'Nuevo Producto',
      it: 'Nuovo Prodotto',
      el: 'Νέο Προϊόν'
    },
    back: {
      en: 'Back to Products',
      es: 'Volver a Productos',
      it: 'Torna ai Prodotti',
      el: 'Επιστροφή στα Προϊόντα'
    },
    basicInfo: {
      en: 'Basic Information',
      es: 'Información Básica',
      it: 'Informazioni di Base',
      el: 'Βασικές Πληροφορίες'
    },
    nameEn: {
      en: 'Name (English)',
      es: 'Nombre (Inglés)',
      it: 'Nome (Inglese)',
      el: 'Όνομα (Αγγλικά)'
    },
    nameEs: {
      en: 'Name (Spanish)',
      es: 'Nombre (Español)',
      it: 'Nome (Spagnolo)',
      el: 'Όνομα (Ισπανικά)'
    },
    nameIt: {
      en: 'Name (Italian)',
      es: 'Nombre (Italiano)',
      it: 'Nome (Italiano)',
      el: 'Όνομα (Ιταλικά)'
    },
    nameEl: {
      en: 'Name (Greek)',
      es: 'Nombre (Griego)',
      it: 'Nome (Greco)',
      el: 'Όνομα (Ελληνικά)'
    },
    descriptionEn: {
      en: 'Description (English)',
      es: 'Descripción (Inglés)',
      it: 'Descrizione (Inglese)',
      el: 'Περιγραφή (Αγγλικά)'
    },
    price: {
      en: 'Price (€)',
      es: 'Precio (€)',
      it: 'Prezzo (€)',
      el: 'Τιμή (€)'
    },
    category: {
      en: 'Category',
      es: 'Categoría',
      it: 'Categoria',
      el: 'Κατηγορία'
    },
    inStock: {
      en: 'In Stock',
      es: 'En Stock',
      it: 'Disponibile',
      el: 'Διαθέσιμο'
    },
    featured: {
      en: 'Featured Product',
      es: 'Producto Destacado',
      it: 'Prodotto in Vetrina',
      el: 'Προτεινόμενο Προϊόν'
    },
    images: {
      en: 'Product Images',
      es: 'Imágenes del Producto',
      it: 'Immagini del Prodotto',
      el: 'Εικόνες Προϊόντος'
    },
    specifications: {
      en: 'Technical Specifications',
      es: 'Especificaciones Técnicas',
      it: 'Specifiche Tecniche',
      el: 'Τεχνικές Προδιαγραφές'
    },
    battery: {
      en: 'Battery',
      es: 'Batería',
      it: 'Batteria',
      el: 'Μπαταρία'
    },
    range: {
      en: 'Range (km)',
      es: 'Autonomía (km)',
      it: 'Autonomia (km)',
      el: 'Αυτονομία (χλμ)'
    },
    speed: {
      en: 'Max Speed (km/h)',
      es: 'Velocidad Máx (km/h)',
      it: 'Velocità Max (km/h)',
      el: 'Μέγιστη Ταχύτητα (χλμ/ώρα)'
    },
    chargingTime: {
      en: 'Charging Time (hours)',
      es: 'Tiempo de Carga (horas)',
      it: 'Tempo di Ricarica (ore)',
      el: 'Χρόνος Φόρτισης (ώρες)'
    },
    motorPower: {
      en: 'Motor Power (W)',
      es: 'Potencia del Motor (W)',
      it: 'Potenza Motore (W)',
      el: 'Ισχύς Κινητήρα (W)'
    },
    weight: {
      en: 'Weight (kg)',
      es: 'Peso (kg)',
      it: 'Peso (kg)',
      el: 'Βάρος (kg)'
    },
    warranty: {
      en: 'Warranty (years)',
      es: 'Garantía (años)',
      it: 'Garanzia (anni)',
      el: 'Εγγύηση (έτη)'
    },
    save: {
      en: 'Save Product',
      es: 'Guardar Producto',
      it: 'Salva Prodotto',
      el: 'Αποθήκευση Προϊόντος'
    },
    saving: {
      en: 'Saving...',
      es: 'Guardando...',
      it: 'Salvataggio...',
      el: 'Αποθήκευση...'
    }
  }

  return (
    <div className="ml-64 min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {texts.back[language]}
          </Link>
          <h1 className="text-xl font-bold text-foreground">{texts.newProduct[language]}</h1>
        </div>
      </header>

      <main className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{texts.basicInfo[language]}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Name in 4 languages */}
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.nameEn[language]} *
                </label>
                <input
                  type="text"
                  value={formData.name.en}
                  onChange={(e) => handleNameChange('en', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.nameEs[language]}
                </label>
                <input
                  type="text"
                  value={formData.name.es}
                  onChange={(e) => handleNameChange('es', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.nameIt[language]}
                </label>
                <input
                  type="text"
                  value={formData.name.it}
                  onChange={(e) => handleNameChange('it', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.nameEl[language]}
                </label>
                <input
                  type="text"
                  value={formData.name.el}
                  onChange={(e) => handleNameChange('el', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground">
                  {texts.descriptionEn[language]}
                </label>
                <textarea
                  value={formData.description.en}
                  onChange={(e) => handleDescriptionChange('en', e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Price and Category */}
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.price[language]} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.category[language]}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="motorcycles">{t.categories.motorcycles}</option>
                  <option value="scooters">{t.categories.scooters}</option>
                  <option value="bicycles">{t.categories.bicycles}</option>
                  <option value="accessories">{t.categories.accessories}</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => handleChange('inStock', e.target.checked)}
                    className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{texts.inStock[language]}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleChange('featured', e.target.checked)}
                    className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{texts.featured[language]}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{texts.images[language]}</h2>
            <AdminImageUpload
              images={formData.images}
              onChange={(images) => handleChange('images', images)}
            />
          </div>

          {/* Specifications */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{texts.specifications[language]}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.battery[language]}
                </label>
                <input
                  type="text"
                  value={formData.specifications.battery}
                  onChange={(e) => handleSpecChange('battery', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., 48V 20Ah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.range[language]}
                </label>
                <input
                  type="text"
                  value={formData.specifications.range}
                  onChange={(e) => handleSpecChange('range', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., 70 km"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.speed[language]}
                </label>
                <input
                  type="text"
                  value={formData.specifications.speed}
                  onChange={(e) => handleSpecChange('speed', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., 45 km/h"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.chargingTime[language]}
                </label>
                <input
                  type="text"
                  value={formData.specifications.chargingTime}
                  onChange={(e) => handleSpecChange('chargingTime', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., 6 hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.motorPower[language]}
                </label>
                <input
                  type="text"
                  value={formData.specifications.motorPower}
                  onChange={(e) => handleSpecChange('motorPower', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., 500W"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.weight[language]}
                </label>
                <input
                  type="text"
                  value={formData.specifications.weight}
                  onChange={(e) => handleSpecChange('weight', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., 25 kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {texts.warranty[language]}
                </label>
                <input
                  type="text"
                  value={formData.specifications.warranty}
                  onChange={(e) => handleSpecChange('warranty', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., 2 years"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {texts.saving[language]}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {texts.save[language]}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default function NewProductPage() {
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
      <NewProductForm />
    </>
  )
}