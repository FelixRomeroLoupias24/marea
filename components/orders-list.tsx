'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ban, CalendarDays, Check, ChevronRight, CircleCheck, CirclePlay, FileText, LoaderCircle, LockKeyhole, Package as PackageIcon, ReceiptText, X } from 'lucide-react'
import { useAuth } from '@/components/auth'
import { useMyOrders } from '@/components/use-my-orders'
import { acceptProposal, cancelOrder, completeOrder, orderDate, rejectProposal, startOrder, type ActionResult } from '@/lib/orders'
import { formatDate, formatPrice, orderActions, orderStatus, type ClientOrder, type Proposal } from '@/lib/services'

type Role = 'cliente' | 'proveedor'
// Ejecuta una acción sobre la tarjeta `key`: confirma, la corre y avisa el resultado.
type RunAction = (key: string, action: () => Promise<ActionResult>, confirmText: string, successText: string) => void

function ProposalItem({ proposal, busy, run }: { proposal: Proposal; busy: boolean; run: (action: () => Promise<ActionResult>, confirmText: string, successText: string) => void }) {
  return <div className="proposal-card">
    <div className="proposal-head"><strong>{formatPrice(proposal.price)}</strong>{proposal.days && <span>{proposal.days} días de entrega</span>}</div>
    {proposal.scope && <p className="proposal-scope">{proposal.scope}</p>}
    {proposal.message && <p className="proposal-message">“{proposal.message}”</p>}
    <div className="order-actions">
      <button type="button" className="primary-button" disabled={busy} onClick={() => run(() => acceptProposal(proposal.id), `¿Aceptar la propuesta de ${formatPrice(proposal.price)}? Se crea la orden y se rechazan las demás propuestas de esta solicitud.`, 'Aceptaste la propuesta. La orden quedó creada.')}><Check /> Aceptar</button>
      <button type="button" className="danger-button" disabled={busy} onClick={() => run(() => rejectProposal(proposal.id), '¿Rechazar esta propuesta?', 'Rechazaste la propuesta.')}><X /> Rechazar</button>
    </div>
  </div>
}

function OrderCard({ order, role, busy, run }: { order: ClientOrder; role: Role; busy: boolean; run: RunAction }) {
  const status = orderStatus[order.estado]
  const runHere = (action: () => Promise<ActionResult>, confirmText: string, successText: string) => run(order.id, action, confirmText, successText)
  // El servicio puede no venir si ya no está activo (las políticas solo muestran servicios activos): sin link.
  const service = order.service ?? { id: '', title: 'Servicio no disponible', image: '/services/web-development.png', provider: '' }
  const serviceLink = (className: string, children: React.ReactNode) => order.service
    ? <Link className={className} href={`/servicios/${service.id}`}>{children}</Link>
    : <span className={className}>{children}</span>

  const isOrder = order.kind === 'orden'
  const fromProposal = isOrder && order.origin === 'propuesta'
  const detail = !isOrder ? 'Cotización personalizada' : fromProposal ? 'Cotización aceptada' : order.packageName ? `Paquete ${order.packageName}` : 'Paquete'
  // Quién es la otra parte: el proveedor para el cliente, el cliente para el proveedor.
  const counterpart = role === 'proveedor' ? (isOrder && order.counterpart ? `Cliente: ${order.counterpart}` : 'Cliente') : service.provider
  const actions = isOrder ? orderActions(order.estado, role) : null
  const pendingProposals = order.kind === 'cotizacion' ? order.proposals.filter(item => item.estado === 'enviada') : []
  const rejectedCount = order.kind === 'cotizacion' ? order.proposals.filter(item => item.estado === 'rechazada').length : 0

  return <article className="order-card card-surface" aria-busy={busy}>
    {serviceLink('order-image', <img src={service.image} alt={service.title} />)}
    <div className="order-info">
      <div className="order-tags"><span className={`order-status tone-${status.tone}`}>{status.label}</span><span className="order-type">{isOrder && !fromProposal ? <><PackageIcon /> Paquete fijo</> : <><FileText /> Cotización</>}</span></div>
      {serviceLink('order-title', service.title)}
      <span className="order-provider">{counterpart ? `${counterpart} · ` : ''}{detail}</span>
      <span className="order-date"><CalendarDays /> {formatDate(orderDate(order))} <span className="order-id">· {isOrder ? 'Orden' : 'Solicitud'} #{order.shortId}</span></span>
    </div>
    <div className="order-price"><span>{isOrder ? 'Total' : 'Propuesta'}</span><strong className={order.price !== undefined ? '' : 'price-pending'}>{order.price !== undefined ? formatPrice(order.price) : 'A definir'}</strong></div>

    {order.kind === 'cotizacion' && <div className="order-extra">
      {pendingProposals.length > 0
        ? <div className="proposal-list"><span className="order-extra-title">{pendingProposals.length === 1 ? 'Propuesta recibida' : `${pendingProposals.length} propuestas recibidas`}</span>{pendingProposals.map(proposal => <ProposalItem key={proposal.id} proposal={proposal} busy={busy} run={runHere} />)}</div>
        : order.estado === 'pendiente' && <p className="order-note">Esperando la propuesta del proveedor.</p>}
      {rejectedCount > 0 && <p className="order-note">{rejectedCount === 1 ? '1 propuesta rechazada' : `${rejectedCount} propuestas rechazadas`}.</p>}
    </div>}

    {actions && (actions.start || actions.complete || actions.cancel) && <div className="order-extra">
      {role === 'cliente' && order.estado === 'pendiente_pago' && <p className="order-note">El pago de las órdenes nacidas de una cotización todavía no está disponible.</p>}
      <div className="order-actions">
        {actions.start && <button type="button" className="primary-button" disabled={busy} onClick={() => runHere(() => startOrder(order.id), '¿Marcar que empezaste a trabajar en esta orden?', 'La orden pasó a "En progreso".')}><CirclePlay /> Iniciar trabajo</button>}
        {actions.complete && <button type="button" className="primary-button" disabled={busy} onClick={() => runHere(() => completeOrder(order.id), '¿Marcar la orden como completada? El cliente va a poder dejar una reseña.', 'Marcaste la orden como completada.')}><CircleCheck /> Marcar como completada</button>}
        {actions.cancel && <button type="button" className="danger-button" disabled={busy} onClick={() => runHere(() => cancelOrder(order.id), '¿Cancelar esta orden? No se puede deshacer.', 'Cancelaste la orden.')}><Ban /> Cancelar orden</button>}
      </div>
    </div>}

    {busy && <p className="order-busy"><LoaderCircle className="spinner" /> Procesando…</p>}
  </article>
}

const skeleton = <div className="order-list" aria-busy="true">{[0, 1, 2].map(item => <div key={item} className="skeleton order-skeleton" />)}</div>

function OrderSection({ title, orders, role, empty, busyKey, run }: { title?: string; orders: ClientOrder[]; role: Role; empty: React.ReactNode; busyKey: string | null; run: RunAction }) {
  return <section className="orders-section">
    {title && <h2 className="orders-section-title">{title}</h2>}
    {orders.length === 0 ? empty : <div className="order-list">{orders.map(order => <OrderCard key={`${order.kind}-${order.id}`} order={order} role={role} busy={busyKey === order.id} run={run} />)}</div>}
  </section>
}

export function OrdersList() {
  const { user, ready, setFlash } = useAuth()
  const orders = useMyOrders()
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const run: RunAction = async (key, action, confirmText, successText) => {
    if (busyKey || !window.confirm(confirmText)) return
    setBusyKey(key)
    const result = await action()
    setBusyKey(null)
    // Errores de la base ("Esta propuesta ya fue respondida", "No podés modificar esta orden"…) tal cual vienen.
    if (result.ok) setFlash(successText); else setFlash(result.error, 'error')
    orders.reload()
  }

  // Mientras se conoce la sesión, esqueleto en lugar de un "Iniciá sesión" que parpadea.
  if (!ready) return skeleton

  if (!user) return <section className="search-empty orders-empty"><LockKeyhole /><h2>Iniciá sesión para ver tus órdenes</h2><p>Tus compras y solicitudes de cotización aparecen acá.</p><Link className="primary-button" href="/login?next=%2Fordenes&motivo=ordenes">Iniciar sesión <ChevronRight /></Link></section>

  if (orders.status === 'loading') return skeleton

  if (orders.status === 'error') return <section className="search-empty orders-empty" role="alert"><ReceiptText /><h2>No pudimos cargar tus órdenes</h2><p>Revisá tu conexión y probá de nuevo.</p><button type="button" className="primary-button" onClick={orders.reload}>Reintentar</button></section>

  const purchasesEmpty = <section className="search-empty orders-empty"><ReceiptText /><h2>Todavía no tenés órdenes</h2><p>Explorá los servicios disponibles y contratá el primero.</p><Link className="primary-button" href="/">Explorar servicios <ChevronRight /></Link></section>

  // Proveedor: dos secciones. Cliente: solo sus compras, sin título extra.
  if (orders.received === null) return <OrderSection orders={orders.purchases} role="cliente" empty={purchasesEmpty} busyKey={busyKey} run={run} />

  return <>
    <OrderSection title="Órdenes recibidas" orders={orders.received} role="proveedor" empty={<p className="search-empty">Todavía no recibiste órdenes.</p>} busyKey={busyKey} run={run} />
    <OrderSection title="Mis compras" orders={orders.purchases} role="cliente" empty={<p className="search-empty">No hiciste compras ni pediste cotizaciones.</p>} busyKey={busyKey} run={run} />
  </>
}
