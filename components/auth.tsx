'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Sesión real con Supabase Auth. La sesión la guarda y la renueva supabase-js; acá solo se expone a la UI.
export type User = { id: string; name: string; email: string; memberSince?: string }

// Mismo criterio que el trigger handle_new_user de la base: el nombre sale de user_metadata.nombre
// y, si falta, de la parte del email antes de la @. Así coincide con perfiles.nombre sin otra consulta.
function toUser(user: SupabaseUser): User {
  const email = user.email ?? ''
  const created = new Date(user.created_at)
  const memberSince = Number.isNaN(created.getTime()) ? undefined : `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`
  return { id: user.id, name: (user.user_metadata?.nombre as string | undefined)?.trim() || email.split('@')[0], email, memberSince }
}

// Mensajes en castellano para los códigos de error de Supabase Auth que puede ver un usuario.
function authErrorMessage(error: AuthError) {
  switch (error.code) {
    case 'invalid_credentials': return 'Email o contraseña incorrectos'
    case 'email_not_confirmed': return 'Tenés que confirmar tu email antes de iniciar sesión. Revisá tu bandeja de entrada.'
    case 'user_already_exists':
    case 'email_exists': return 'Ya existe una cuenta con ese email.'
    case 'weak_password': return 'La contraseña es muy débil. Usá al menos 6 caracteres.'
    case 'email_address_invalid': return 'Ingresá un email válido.'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit': return 'Demasiados intentos. Esperá unos minutos y probá de nuevo.'
    case 'signup_disabled': return 'El registro de cuentas nuevas está deshabilitado.'
    default: return 'No pudimos completar la operación. Probá de nuevo en unos minutos.'
  }
}

export type Flash = { text: string; tone: 'success' | 'error' }

export type LoginResult = { ok: true; user: User } | { ok: false; error: string }
// needsConfirmation: Supabase creó la cuenta pero exige confirmar el email antes de iniciar sesión.
export type RegisterResult = { ok: true; needsConfirmation: boolean } | { ok: false; error: string }

type AuthContextValue = {
  user: User | null
  // false hasta conocer la sesión inicial: evita mostrar "Ingresar" un instante a alguien que ya tiene sesión.
  ready: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  register: (name: string, email: string, password: string) => Promise<RegisterResult>
  logout: () => Promise<void>
  // true después de un logout explícito: RequireAuth no manda al login, porque quien cerró sesión ya está navegando a otro lado.
  signedOut: boolean
  // Aviso que muestra el Header: confirmaciones (verde) y errores (rojo).
  flash: Flash | null
  setFlash: (message: string | null, tone?: Flash['tone']) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [flash, setFlashState] = useState<Flash | null>(null)
  const setFlash = useCallback((message: string | null, tone: Flash['tone'] = 'success') => setFlashState(message ? { text: message, tone } : null), [])
  const [signedOut, setSignedOut] = useState(false)

  useEffect(() => {
    // Restos del login mock anterior: 'marea-users' guardaba contraseñas en texto plano. Ya no se usan.
    try { localStorage.removeItem('marea-users'); localStorage.removeItem('marea-session') } catch { /* sin storage */ }

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session ? toUser(data.session.user) : null)
      setReady(true)
    })
    // Mantiene la UI al día con login, logout, renovación de token y cambios hechos en otra pestaña.
    // El callback no hace llamadas a Supabase: la documentación lo desaconseja porque puede trabarse.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? toUser(session.user) : null)
      setReady(true)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error || !data.user) return { ok: false, error: error ? authErrorMessage(error) : 'Email o contraseña incorrectos' }
    const next = toUser(data.user)
    setUser(next); setSignedOut(false)
    return { ok: true, user: next }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string): Promise<RegisterResult> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // `nombre` es la clave que lee el trigger handle_new_user para crear la fila en perfiles.
      options: { data: { nombre: name.trim() }, emailRedirectTo: window.location.origin },
    })
    if (error) return { ok: false, error: authErrorMessage(error) }
    // Con confirmación de email activa, Supabase no devuelve error si el email ya existe (para no revelar
    // qué cuentas hay): devuelve un usuario sin identidades.
    if (data.user && data.user.identities?.length === 0) return { ok: false, error: 'Ya existe una cuenta con ese email.' }
    if (data.session) { setUser(toUser(data.session.user)); setSignedOut(false) }
    return { ok: true, needsConfirmation: !data.session }
  }, [])

  const logout = useCallback(async () => {
    setSignedOut(true)
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, ready, login, register, logout, signedOut, flash, setFlash }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth tiene que usarse dentro de <AuthProvider>')
  return context
}
