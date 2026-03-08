'use client'

import { useState } from 'react'
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-auth'
import { useLanguage } from '@/lib/language-context'

export function AdminLogin() {
  const { login } = useAdminAuth()
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!login(username, password)) {
      setError('Invalid username or password')
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
              Admin Panel
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
                htmlFor="username"
                className="block text-sm font-medium text-card-foreground"
              >
                {t.admin.username}
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-card-foreground"
              >
                {t.admin.password}
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-accent"
            >
              {t.admin.login}
            </button>
          </form>

          {/* Demo Credentials Hint */}
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium text-foreground">Demo Credentials:</p>
            <p className="mt-1 text-muted-foreground">
              Username: <code className="rounded bg-background px-1">admin</code>
            </p>
            <p className="text-muted-foreground">
              Password: <code className="rounded bg-background px-1">electric2024</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
