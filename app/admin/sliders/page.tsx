'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAdminAuth } from '@/lib/admin-auth'
import { AdminLogin } from '@/components/admin-login'
import { AdminSidebar } from '@/components/admin-sidebar'
import { useLanguage } from '@/lib/language-context'
import { useSliders } from '@/hooks/use-firestore'
import { sliderItems as fallbackSliders } from '@/lib/data'
import { deleteSlider } from '@/lib/firestore-service'
import { Plus, Edit, Trash2, GripVertical, Loader2 } from 'lucide-react'

function SlidersContent() {
  const { language, t } = useLanguage()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const { data: firestoreSliders, isLoading, mutate } = useSliders()
  
  // Use Firestore data if available, otherwise fallback to mock data
  const sliderItems = firestoreSliders && firestoreSliders.length > 0 ? firestoreSliders : fallbackSliders

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to delete this slide?' : 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το slide;')) return
    
    setDeletingId(id)
    const success = await deleteSlider(id)
    if (success) {
      mutate() // Refresh the sliders list
    }
    setDeletingId(null)
  }

  return (
    <div className="ml-64 min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <h1 className="text-xl font-bold text-foreground">{t.admin.sliders}</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
          <Plus className="h-4 w-4" />
          {language === 'en' ? 'Add Slide' : 'Προσθήκη Slide'}
        </button>
      </header>

      <main className="p-6">
        <div className="grid gap-6">
          {sliderItems.map((slide, index) => (
            <div
              key={slide.id}
              className="flex gap-4 rounded-xl bg-card p-4 shadow-sm"
            >
              {/* Drag Handle */}
              <div className="flex items-center">
                <button className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted">
                  <GripVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Image Preview */}
              <div className="relative h-32 w-48 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={slide.image}
                  alt={slide.title[language]}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-primary">
                      {language === 'en' ? 'Slide' : 'Slide'} #{index + 1}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">
                      {slide.title[language]}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {slide.subtitle[language]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      disabled={deletingId === slide.id}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === slide.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    <strong>{language === 'en' ? 'Button:' : 'Κουμπί:'}</strong>{' '}
                    {slide.buttonText[language]}
                  </span>
                  <span className="text-muted-foreground">
                    <strong>{language === 'en' ? 'Link:' : 'Σύνδεσμος:'}</strong>{' '}
                    {slide.buttonLink}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-xl bg-muted p-6">
          <h3 className="font-semibold text-foreground">
            {language === 'en' ? 'Tips' : 'Συμβουλές'}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>
              {language === 'en'
                ? '• Drag and drop slides to reorder them'
                : '• Σύρετε και αποθέστε τα slides για αναδιάταξη'}
            </li>
            <li>
              {language === 'en'
                ? '• Recommended image size: 1920x1080px'
                : '• Προτεινόμενο μέγεθος εικόνας: 1920x1080px'}
            </li>
            <li>
              {language === 'en'
                ? '• Keep headlines short and impactful'
                : '• Κρατήστε τους τίτλους σύντομους και εντυπωσιακούς'}
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default function AdminSlidersPage() {
  const { isAuthenticated } = useAdminAuth()

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <>
      <AdminSidebar />
      <SlidersContent />
    </>
  )
}
