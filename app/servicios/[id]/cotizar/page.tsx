import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronRight, FileText, MessageCircle, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/marketplace'
import { QuoteRequestForm } from '@/components/quote-request-form'
import { RequireAuth } from '@/components/require-auth'
import { getService } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

const steps = [
  { icon: FileText, title: 'Enviás tu brief', text: 'Descripción, presupuesto y plazo.' },
  { icon: MessageCircle, title: 'El proveedor responde', text: 'Recibís una propuesta en hasta 48 hs.' },
  { icon: ShieldCheck, title: 'Vos decidís', text: 'Aceptás, rechazás o negociás.' },
]

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await getService(id)
  if (!service) notFound()
  // Regla de negocio: /cotizar solo existe para servicios a cotizar; los de precio fijo se compran desde la ficha.
  if (service.tipo_oferta !== 'a_cotizar') redirect(`/servicios/${id}`)

  return <main className="checkout-page quote-page"><Header /><RequireAuth reason="cotizar"><div className="checkout-container"><Link className="back-link" href={`/servicios/${id}`}>← Volver a la ficha de servicio</Link><div className="checkout-breadcrumb"><span>Ficha de servicio</span><ChevronRight /><strong>Solicitar cotización</strong></div><div className="checkout-grid"><div className="checkout-main"><div className="checkout-heading"><span className="eyebrow">SOLICITUD DE COTIZACIÓN</span><h1>Contanos sobre tu proyecto</h1><p>Con estos datos {service.provider} va a armarte una propuesta a medida.</p></div><div className="quote-service card-surface"><div className="summary-service"><img src={service.image} alt={service.title} /><div><span className="quote-badge">A cotizar</span><strong>{service.title}</strong><span>{service.provider} · {service.category}</span></div></div></div><QuoteRequestForm serviceId={service.id} providerId={service.providerId} provider={service.provider} /></div><aside className="quote-aside card-surface"><h2>Cómo sigue</h2><ol className="quote-steps">{steps.map(({ icon: Icon, title, text }) => <li key={title}><Icon /><span><strong>{title}</strong><small>{text}</small></span></li>)}</ol></aside></div></div></RequireAuth></main>
}
