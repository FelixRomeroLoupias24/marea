'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth'

// Motivos que /login sabe explicar con un mensaje contextual (estructura-frontend §3.1).
export const loginReasons = {
  cotizar: 'Iniciá sesión para solicitar una cotización.',
  comprar: 'Iniciá sesión para completar tu compra.',
  ordenes: 'Iniciá sesión para ver tus órdenes.',
  cuenta: 'Iniciá sesión para ver tu cuenta.',
} as const
export type LoginReason = keyof typeof loginReasons

// Solo rutas internas: evita que ?next= redirija a otro sitio (open redirect).
export function safeNext(raw: string | null) {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
}

// Guard de sesión MOCK (del lado del cliente): sin sesión, manda a /login y vuelve a esta misma URL al ingresar.
// Con Supabase, esta verificación tiene que pasar al servidor (middleware), que es lo que realmente protege la ruta.
export function RequireAuth({ reason, children }: { reason: LoginReason; children: React.ReactNode }) {
  const router = useRouter()
  const { user, ready, signedOut } = useAuth()

  useEffect(() => {
    if (!ready || user || signedOut) return
    const next = window.location.pathname + window.location.search
    router.replace(`/login?next=${encodeURIComponent(next)}&motivo=${reason}`)
  }, [ready, user, signedOut, reason, router])

  if (!ready || !user) return <div className="auth-guard" aria-busy="true"><div className="skeleton auth-guard-header" /><div className="skeleton auth-guard-body" /></div>
  return <>{children}</>
}
