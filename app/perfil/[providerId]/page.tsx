import { notFound } from 'next/navigation'
import { BadgeCheck, CalendarDays } from 'lucide-react'
import { Header, BackLink, ServiceCard, RatingStars, ReviewsSection } from '@/components/marketplace'
import { getProvider } from '@/lib/catalog'
import { getCardPrice } from '@/lib/services'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params
  const provider = await getProvider(providerId)
  return { title: provider ? `${provider.name} — Marea Digital` : 'Proveedor no encontrado — Marea Digital' }
}

export default async function ProviderProfilePage({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params
  const provider = await getProvider(providerId)

  // Responde 404 y muestra el mensaje de ./not-found.tsx.
  if (!provider) notFound()

  const providerServices = provider.services

  return <main><Header /><div className="detail-container"><BackLink />
    <section className="profile-header card-surface"><span className={`profile-avatar avatar-${provider.avatarColor}`}>{provider.initials}</span><div className="profile-info"><div className="profile-name-row"><h1>{provider.name}</h1><span className="profile-type">{provider.type}</span></div><div className="profile-rating">{provider.rating !== null ? <><RatingStars rating={provider.rating} /><strong>{provider.rating.toFixed(1)}</strong><small>({provider.reviewCount} {provider.reviewCount === 1 ? 'reseña' : 'reseñas'})</small></> : <small>Sin reseñas todavía</small>}</div><p className="profile-bio">{provider.bio}</p><div className="profile-meta">{provider.verified && <span className="profile-verified"><BadgeCheck /> Verificado</span>}<span><CalendarDays /> Miembro desde {provider.memberSince}</span></div></div></section>
    <section className="detail-section"><span className="eyebrow">SERVICIOS</span><h2>Servicios de este proveedor</h2>{providerServices.length > 0 ? <div className="services-grid profile-services">{providerServices.map(service => <ServiceCard key={service.id} href={`/servicios/${service.id}`} image={service.image} title={service.title} provider={service.provider} price={getCardPrice(service)} tipo_oferta={service.tipo_oferta} rating={provider.rating ?? undefined} />)}</div> : <p className="search-empty profile-services">Este proveedor todavía no publicó servicios.</p>}</section>
    <ReviewsSection provider={provider} />
  </div></main>
}
