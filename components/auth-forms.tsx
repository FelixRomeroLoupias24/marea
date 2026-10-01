'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, LoaderCircle, MailCheck } from 'lucide-react'
import { useAuth } from '@/components/auth'
import { loginReasons, safeNext, type LoginReason } from '@/components/require-auth'

// Supabase exige 6 caracteres como mínimo por defecto; se valida antes para dar el error en castellano.
const MIN_PASSWORD = 6
const firstName = (name: string) => name.trim().split(' ')[0]

// Lee ?next= y ?motivo= (los arma RequireAuth). Se lee en un efecto, sin useSearchParams, para que /login siga siendo estática.
// `query` se reenvía entre /login y /registro para no perder a dónde volver.
function useReturnTo() {
  const [state, setState] = useState<{ next: string; notice: string | null; query: string }>({ next: '/', notice: null, query: '' })
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const next = safeNext(params.get('next'))
    const reason = params.get('motivo')
    const notice = reason && reason in loginReasons ? loginReasons[reason as LoginReason] : null
    setState({ next, notice, query: next === '/' ? '' : `?${new URLSearchParams({ next, ...(notice ? { motivo: reason! } : {}) })}` })
  }, [])
  return state
}

function AlreadyLoggedIn({ name, next }: { name: string; next: string }) {
  return <div className="auth-card card-surface"><h1>Ya iniciaste sesión</h1><p className="auth-subtitle">Estás conectado como {name}.</p><Link className="primary-button wide-button" href={next}>{next === '/' ? 'Ir al inicio' : 'Continuar'} <ChevronRight /></Link></div>
}

function AuthNotice({ text }: { text: string | null }) {
  return text ? <div className="auth-notice" role="status">{text}</div> : null
}

export function LoginForm() {
  const router = useRouter()
  const { user, ready, login, setFlash } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { next, notice, query } = useReturnTo()

  if (ready && user && !loading) return <AlreadyLoggedIn name={user.name} next={next} />

  return <div className="auth-card card-surface"><span className="eyebrow">BIENVENIDO DE NUEVO</span><h1>Iniciá sesión</h1><p className="auth-subtitle">Ingresá para contratar servicios y seguir tus cotizaciones.</p><AuthNotice text={notice} />
    <form className="auth-form" noValidate onSubmit={async event => {
      event.preventDefault(); setError('')
      if (!email.trim() || !password) { setError('Completá tu email y tu contraseña.'); return }
      setLoading(true)
      const result = await login(email, password)
      if (result.ok) { setFlash(`Hola, ${firstName(result.user.name)}. Iniciaste sesión.`); router.push(next) }
      else { setLoading(false); setError(result.error) }
    }}>
      {error && <div className="payment-error" role="alert"><strong>{error}</strong></div>}
      <div className="form-fields auth-fields"><label>Email<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="nombre@email.com" /></label><label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Tu contraseña" /></label></div>
      <button className="primary-button wide-button" disabled={loading}>{loading ? <><LoaderCircle className="spinner" /> Ingresando...</> : 'Iniciar sesión'}</button>
    </form>
    <p className="auth-switch">¿No tenés cuenta? <Link href={`/registro${query}`}>Registrarme</Link></p>
  </div>
}

export function RegisterForm() {
  const router = useRouter()
  const { user, ready, register, setFlash } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null)
  const { next, notice, query } = useReturnTo()

  if (confirmationSentTo) return <div className="auth-card card-surface auth-confirm"><span className="auth-confirm-icon"><MailCheck /></span><h1>Revisá tu email</h1><p className="auth-subtitle">Te enviamos un link de confirmación a <strong>{confirmationSentTo}</strong>. Abrilo para activar tu cuenta y después iniciá sesión.</p><Link className="primary-button wide-button" href={`/login${query}`}>Ir a iniciar sesión <ChevronRight /></Link></div>
  if (ready && user && !loading) return <AlreadyLoggedIn name={user.name} next={next} />

  function validate() {
    const found: string[] = []
    if (!name.trim() || !email.trim() || !password || !confirm) found.push('Completá todos los campos.')
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) found.push('Ingresá un email válido.')
    if (password && password.length < MIN_PASSWORD) found.push(`La contraseña tiene que tener al menos ${MIN_PASSWORD} caracteres.`)
    if (password && confirm && password !== confirm) found.push('Las contraseñas no coinciden.')
    return found
  }

  return <div className="auth-card card-surface"><span className="eyebrow">CREÁ TU CUENTA</span><h1>Registrate en marea</h1><p className="auth-subtitle">Es gratis y te lleva menos de un minuto.</p><AuthNotice text={notice} />
    <form className="auth-form" noValidate onSubmit={async event => {
      event.preventDefault()
      const found = validate(); setErrors(found); if (found.length) return
      setLoading(true)
      const result = await register(name, email, password)
      if (!result.ok) { setLoading(false); setErrors([result.error]); return }
      if (result.needsConfirmation) { setLoading(false); setConfirmationSentTo(email.trim()); return }
      setFlash(`¡Cuenta creada! Te damos la bienvenida, ${firstName(name)}.`); router.push(next)
    }}>
      {errors.length > 0 && <div className="payment-error" role="alert">{errors.map(item => <strong key={item}>{item}</strong>)}</div>}
      <div className="form-fields auth-fields"><label>Nombre<input autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Tu nombre y apellido" /></label><label>Email<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="nombre@email.com" /></label><label>Contraseña<input type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Creá una contraseña" /></label><label>Confirmar contraseña<input type="password" autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="Repetí la contraseña" aria-invalid={password && confirm && password !== confirm ? true : undefined} /></label></div>
      <button className="primary-button wide-button" disabled={loading}>{loading ? <><LoaderCircle className="spinner" /> Creando cuenta...</> : 'Crear cuenta'}</button>
    </form>
    <p className="auth-switch">¿Ya tenés cuenta? <Link href={`/login${query}`}>Iniciar sesión</Link></p>
  </div>
}
