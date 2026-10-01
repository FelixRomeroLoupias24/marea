import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Star } from 'lucide-react'
import { Header, BackLink, OfferBadge, OfferPanel, ServiceDetails } from '@/components/marketplace'
import { getProvider, getService } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await getService(id)
  const provider = service && await getProvider(service.providerId)
  if (!service || !provider) notFound()

  return <main className="detail-shell"><Header /><div className="detail-container"><BackLink /><div className="detail-grid"><div className="detail-main"><section className="service-hero"><div className="hero-image"><img src={service.image} alt={service.title} /><OfferBadge tipo={service.tipo_oferta} /></div><p className="detail-category">{service.category}</p><h1>{service.title}</h1><div className="provider-detail"><span className={`large-avatar avatar-${provider.avatarColor}`}>{provider.initials}</span><div><strong>{provider.name}</strong><Link href={`/perfil/${provider.id}`}>Ver perfil</Link></div><span className="detail-rating">{provider.rating !== null ? <><Star fill="currentColor" /> {provider.rating.toFixed(1)} <small>· {provider.reviewCount} {provider.reviewCount === 1 ? 'reseña' : 'reseñas'}</small></> : <small>Sin reseñas todavía</small>}</span></div></section><ServiceDetails service={service} provider={provider} /></div><aside className="desktop-offer"><OfferPanel service={service} /></aside></div></div><div className="mobile-offer"><OfferPanel service={service} mobile /></div></main>
}
