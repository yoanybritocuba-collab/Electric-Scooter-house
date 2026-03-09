'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { X, Upload, Loader2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface AdminImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function AdminImageUpload({ images, onChange, maxImages = 5 }: AdminImageUploadProps) {
  const { language, t } = useLanguage()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      const errorMessages = {
        en: `You can only upload up to ${maxImages} images`,
        es: `Solo puedes subir hasta ${maxImages} imágenes`,
        it: `Puoi caricare solo fino a ${maxImages} immagini`,
        el: `Μπορείτε να ανεβάσετε έως ${maxImages} εικόνες`
      }
      setError(errorMessages[language])
      return
    }

    setUploading(true)
    setError('')

    try {
      const storage = getStorage()
      const uploadPromises = Array.from(files).map(async (file) => {
        // Crear nombre único para la imagen
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2)
        const extension = file.name.split('.').pop()
        const filename = `products/${timestamp}-${random}.${extension}`
        
        const storageRef = ref(storage, filename)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        return url
      })

      const newUrls = await Promise.all(uploadPromises)
      onChange([...images, ...newUrls])
    } catch (err) {
      console.error('Error uploading images:', err)
      const errorMessages = {
        en: 'Error uploading images. Please try again.',
        es: 'Error al subir imágenes. Intenta de nuevo.',
        it: 'Errore durante il caricamento. Riprova.',
        el: 'Σφάλμα κατά το ανέβασμα εικόνων. Δοκιμάστε ξανά.'
      }
      setError(errorMessages[language])
    } finally {
      setUploading(false)
    }
  }, [images, onChange, maxImages, language])

  const handleRemove = useCallback(async (index: number) => {
    const imageUrl = images[index]
    
    try {
      // Intentar eliminar del storage (opcional)
      const storage = getStorage()
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef).catch(() => {
        // Ignorar errores de eliminación (la imagen puede no existir)
      })
    } catch {
      // Ignorar errores
    }

    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }, [images, onChange])

  // Textos según idioma
  const texts = {
    upload: {
      en: 'Upload Images',
      es: 'Subir Imágenes',
      it: 'Carica Immagini',
      el: 'Ανέβασμα Εικόνων'
    },
    dragDrop: {
      en: 'or drag and drop',
      es: 'o arrastra y suelta',
      it: 'o trascina e rilascia',
      el: 'ή σύρετε και αφήστε'
    },
    maxImages: {
      en: `Max ${maxImages} images`,
      es: `Máximo ${maxImages} imágenes`,
      it: `Max ${maxImages} immagini`,
      el: `Μέγιστο ${maxImages} εικόνες`
    },
    remove: {
      en: 'Remove',
      es: 'Eliminar',
      it: 'Rimuovi',
      el: 'Αφαίρεση'
    }
  }

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <Image
                src={image}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                title={texts.remove[language]}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
          <div className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            uploading ? 'border-muted bg-muted/50' : 'border-border hover:border-primary hover:bg-muted/50'
          }`}>
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Subiendo...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  {texts.upload[language]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {texts.dragDrop[language]} • {texts.maxImages[language]}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}