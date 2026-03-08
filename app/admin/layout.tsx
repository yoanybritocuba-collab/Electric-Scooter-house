'use client'

import { AdminAuthProvider } from '@/lib/admin-auth'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>
}
