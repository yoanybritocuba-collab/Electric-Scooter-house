'use client'

import { useState } from 'react'
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useLanguage } from '@/lib/language-context'
import { useRouter } from 'next/navigation'

export function AdminLogin() {
  const { t } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/admin')
      router.refresh()
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Mensajes de error en español
      if (error.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos')
      } else if (error.code === 'auth/user-not-found') {
        setError('Usuario no encontrado')
      } else if (error.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta')
      } else if (error.code === 'auth/invalid-email') {
        setError('Correo electrónico inválido')
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde')
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-card p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-card-foreground">
              {t.admin?.dashboard || 'Admin Panel'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Electric Scooter House
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-card-foreground"
              >
                {t.admin?.email || 'Email'}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="admin@electricscooterhouse.gr"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-card-foreground"
              >
                {t.admin?.password || 'Password'}
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : (t.admin?.login || 'Login')}
            </button>
          </form>

          {/* Instrucción (sin credenciales visibles) */}
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
            <p className="text-center text-muted-foreground">
              Usa tu correo y contraseña de Firebase Authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}