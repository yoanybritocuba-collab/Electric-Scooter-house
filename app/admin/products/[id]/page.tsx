'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth'
import { AdminLogin } from '@/components/admin-login'
import { AdminSidebar } from '@/components/admin-sidebar'
import { useLanguage } from '@/lib/language-context'
import { getProductById, updateProduct } from '@/lib/firestore-service'
import { AdminImageUpload } from '@/components/admin-image-upload'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

function EditProductForm() {
  const { language, t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: {
      en: '',
      es: '',
      it: '',
      el: ''
    },
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

  // Cargar producto al montar el componente
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const product = await getProductById(productId)
        if (product) {
          setFormData({
            name: product.name || { en: '', es: '', it: '', el: '' },
            description: product.description || { en: '', es: '', it: '', el: '' },
            price: product.price?.toString() || '',
            category: product.category || 'motorcycles',
            inStock: product.inStock ?? true,
            featured: product.featured ?? false,
            images: product.images || [],
            specifications: product.specifications || {
              battery: '',
              range: '',
              speed: '',
              chargingTime: '',
              motorPower: '',
              weight: '',
              warranty: ''
            }
          })
        } else {
          const errorMessages = {
            en: 'Product not found',
            es: 'Producto no encontrado',
            it: 'Prodotto non trovato',
            el: 'Το προϊόν δεν βρέθηκε'
          }
          setError(errorMessages[language])
        }
      } catch (err) {
        console.error('Error loading product:', err)
        const errorMessages = {
          en: 'Error loading product',
          es: 'Error al cargar el producto',
          it: 'Errore durante il caricamento',
          el: 'Σφάλμα φόρτωσης προϊόντος'
        }
        setError(errorMessages[language])
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId, language])

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
        updatedAt: new Date().toISOString()
      }

      const success = await updateProduct(productId, productData)
      
      if (success) {
        const successMessages = {
          en: 'Product updated successfully',
          es: 'Producto actualizado correctamente',
          it: 'Prodotto aggiornato con successo',
          el: 'Το προϊόν ενημερώθηκε με επιτυχία'
        }
        alert(successMessages[language])
        router.push('/admin/products')
        router.refresh()
      } else {
        throw new Error('Failed to update product')
      }
    } catch (err) {
      console.error('Error updating product:', err)
      const errorMessages = {
        en: 'Error updating product. Please try again.',
        es: 'Error al actualizar el producto. Intenta de nuevo.',
        it: 'Errore durante l\'aggiornamento. Riprova.',
        el: 'Σφάλμα κατά την ενημέρωση. Δοκιμάστε ξανά.'
      }
      setError(errorMessages[language])
    } finally {
      setSaving(false)
    }
  }

  // Textos según idioma
  const texts = {
    editProduct: {
      en: 'Edit Product',
      es: 'Editar Producto',
      it: 'Modifica Prodotto',
      el: 'Επεξεργασία Προϊόντος'
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
      en: 'Name (English) *',
      es: 'Nombre (Inglés) *',
      it: 'Nome (Inglese) *',
      el: 'Όνομα (Αγγλικά) *'
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
      en: 'Price (€) *',
      es: 'Precio (€) *',
      it: 'Prezzo (€) *',
      el: 'Τιμή (€) *'
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
      en: 'Save Changes',
      es: 'Guardar Cambios',
      it: 'Salva Modifiche',
      el: 'Αποθήκευση Αλλαγών'
    },
    saving: {
      en: 'Saving...',
      es: 'Guardando...',
      it: 'Salvataggio...',
      el: 'Αποθήκευση...'
    },
    loading: {
      en: 'Loading...',
      es: 'Cargando...',
      it: 'Caricamento...',
      el: 'Φόρτωση...'
    }
  }

  if (loading) {
    return (
      <div className="ml-64 flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">{texts.loading[language]}</p>
        </div>
      </div>
    )
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
          <h1 className="text-xl font-bold text-foreground">{texts.editProduct[language]}</h1>
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
                  {texts.nameEn[language]}
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
                  {texts.price[language]}
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
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/products"
              className="rounded-lg border border-input bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </Link>
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

export default function EditProductPage() {
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
      <EditProductForm />
    </>
  )
}