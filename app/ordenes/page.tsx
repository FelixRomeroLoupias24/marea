import { Header, BackLink } from '@/components/marketplace'
import { OrdersList } from '@/components/orders-list'

export const metadata = { title: 'Mis órdenes — Marea Digital' }

export default function OrdersPage() {
  return <main><Header /><div className="detail-container orders-container"><BackLink /><div className="orders-heading"><span className="eyebrow">HISTORIAL</span><h1>Mis órdenes</h1><p>Seguí el estado de tus compras y solicitudes de cotización.</p></div><OrdersList /></div></main>
}
