'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronRight, LogOut, Mail, ReceiptText } from 'lucide-react'
import { useAuth } from '@/components/auth'
import { RequireAuth } from '@/components/require-auth'
import { useMyOrders } from '@/components/use-my-orders'
import { formatDate, initialsOf, type EstadoCotizacion, type EstadoOrden } from '@/lib/services'

// Órdenes "en curso": todavía esperan algo del proveedor o del cliente.
const activeStates: (EstadoOrden | EstadoCotizacion)[] = ['pendiente_pago', 'pagado', 'en_progreso', 'pendiente', 'propuesta_enviada']

function AccountDetails() {
  const router = useRouter()
  const { user, logout, setFlash } = useAuth()
  const orders = useMyOrders()
  if (!user) return null

  // Mientras cargan (o si fallan) se muestra un guion en lugar de un 0 engañoso.
  const total = orders.status === 'ready' ? String(orders.purchases.length) : '—'
  const active = orders.status === 'ready' ? String(orders.purchases.filter(order => activeStates.includes(order.estado)).length) : '—'
  const initials = initialsOf(user.name)

  return <>
    <section className="profile-header card-surface"><span className="profile-avatar avatar-indigo">{initials}</span><div className="profile-info"><div className="profile-name-row"><h1>{user.name}</h1><span className="profile-type">Cliente</span></div><div className="profile-meta account-meta"><span><Mail /> {user.email}</span>{user.memberSince && <span><CalendarDays /> Miembro desde el {formatDate(user.memberSince)}</span>}</div></div></section>
    <section className="detail-section"><span className="eyebrow">ACTIVIDAD</span><h2>Tus órdenes</h2>
      <div className="account-stats"><div className="card-surface"><strong>{total}</strong><span>órdenes en total</span></div><div className="card-surface"><strong>{active}</strong><span>en curso</span></div></div>
      <div className="account-actions"><Link className="primary-button" href="/ordenes"><ReceiptText /> Ver mis órdenes <ChevronRight /></Link><button type="button" className="outline-button account-logout" onClick={async () => { await logout(); setFlash('Cerraste sesión.'); router.push('/') }}><LogOut /> Cerrar sesión</button></div>
    </section>
  </>
}

export function AccountView() {
  return <RequireAuth reason="cuenta"><AccountDetails /></RequireAuth>
}
