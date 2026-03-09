'use client'

import { AdminAuthProvider } from '@/lib/admin-auth'
import { LanguageProvider } from '@/lib/language-context'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </LanguageProvider>
  )
}