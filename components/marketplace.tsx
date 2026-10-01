'use client'

import { ArrowLeft, Check, ChevronRight, CircleAlert, Clock3, LockKeyhole, MessageCircle, ReceiptText, ShieldCheck, Star, UserRound, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth'
import { UserMenu } from '@/components/user-menu'
import { formatPrice, getCheapestPackage, type Provider, type Service, type TipoOferta } from '@/lib/services'

// `note`: etiqueta opcional junto a las acciones de sesión, por ejemplo "Checkout seguro" en /comprar.
export function Header({ note }: { note?: React.ReactNode } = {}) {
  const { user, ready, flash, setFlash } = useAuth()
  const onOrders = usePathname() === '/ordenes'

  // El aviso se cierra solo: las confirmaciones a los 5 s y los errores a los 10 s, para que dé tiempo a leerlos.
  React.useEffect(() => { if (!flash) return; const timer = window.setTimeout(() => setFlash(null), flash.tone === 'error' ? 10000 : 5000); return () => window.clearTimeout(timer) }, [flash, setFlash])

  const actions = !ready ? <span className="header-actions-placeholder" aria-hidden /> : user
    ? <><Link className={`header-link ${onOrders ? 'active' : ''}`} href="/ordenes" aria-label="Mis órdenes" aria-current={onOrders ? 'page' : undefined}><ReceiptText /><span>Mis órdenes</span></Link><UserMenu user={user} /></>
    : <><Link className="login-button" href="/login">Ingresar</Link><Link className="mobile-icon" href="/login" aria-label="Ingresar"><UserRound /></Link></>

  return <><header className="site-header"><div className="header-content"><Link className="brand" href="/"><span className="brand-mark">m</span><span>marea</span></Link><div className="header-actions">{note}{actions}</div></div></header>{flash && <div className={`flash-banner ${flash.tone === 'error' ? 'flash-error' : ''}`} role={flash.tone === 'error' ? 'alert' : 'status'}>{flash.tone === 'error' ? <CircleAlert /> : <Check />}<span>{flash.text}</span><button aria-label="Cerrar aviso" onClick={() => setFlash(null)}><X /></button></div>}</>
}

export function BackLink({ children = 'Volver a servicios' }: { children?: React.ReactNode }) { return <Link className="back-link" href="/"><ArrowLeft /> {children}</Link> }
export function FixedBadge() { return <span className="fixed-badge">Precio fijo</span> }
export function OfferBadge({ tipo }: { tipo: TipoOferta }) { return tipo === 'a_cotizar' ? <span className="quote-badge">A cotizar</span> : <FixedBadge /> }

// Sin rating (proveedor sin reseñas) se muestra "Sin reseñas todavía", nunca "0.0" (sistema de diseño §4.4).
export function ServiceCard({ href, image, title, provider, price, tipo_oferta, rating }: { href: string; image: string; title: string; provider: string; price: string; tipo_oferta: TipoOferta; rating?: number }) {
  return <Link className="service-card" href={href}><div className="service-card-image"><img src={image} alt="" /><OfferBadge tipo={tipo_oferta} /></div><strong>{title}</strong><span>{provider}</span><div className="service-card-meta"><b>{price}</b>{rating ? <><Star fill="currentColor" /><small>{rating.toFixed(1)}</small></> : <small>Sin reseñas todavía</small>}</div></Link>
}

export function OfferPanel({ service, mobile = false }: { service: Service; mobile?: boolean }) {
  return service.tipo_oferta === 'a_cotizar' ? <QuoteOfferPanel serviceId={service.id} mobile={mobile} /> : <PackageOfferPanel service={service} mobile={mobile} />
}

function QuoteOfferPanel({ serviceId, mobile }: { serviceId: string; mobile: boolean }) {
  const href = `/servicios/${serviceId}/cotizar`
  if (mobile) return <div className="mobile-cta"><div><span>Precio</span><strong className="quote-price">A medida</strong></div><Link className="primary-button" href={href}>Solicitar cotización</Link></div>
  return <div className="offer-panel card-surface"><div className="offer-heading"><div><span className="eyebrow quote-eyebrow">A COTIZAR</span><h2>Cotización personalizada</h2></div><span className="secure-note"><LockKeyhole /> Sin compromiso</span></div><p className="quote-offer-copy">Contale al proveedor qué necesitás, tu presupuesto y tu plazo. Te responde con una propuesta de precio, alcance y tiempos en hasta 48 hs.</p><Link className="primary-button wide-button" href={href}>Solicitar cotización <ChevronRight /></Link><div className="trust-row"><span><ShieldCheck /> Pago seguro</span><span><MessageCircle /> Soporte post-entrega</span></div></div>
}

function PackageOfferPanel({ service, mobile }: { service: Service; mobile: boolean }) {
  const { packages } = service
  // Preselecciona el paquete del medio (Estándar), igual que el fallback de getPackage en el checkout.
  const [selected, setSelected] = React.useState(Math.floor(packages.length / 2))
  const [open, setOpen] = React.useState(false)
  const chosen = packages[selected]
  const serviceId = service.id
  if (mobile && !open) return <div className="mobile-cta"><div><span>Desde</span><strong>{formatPrice(getCheapestPackage(service)?.price ?? chosen.price)}</strong></div><button className="primary-button" onClick={() => setOpen(true)}>Ver opciones</button></div>
  const content = <div className="offer-panel card-surface"><div className="offer-heading"><div><span className="eyebrow">PRECIO FIJO</span><h2>Elegí tu paquete</h2></div><span className="secure-note"><LockKeyhole /> Pago seguro</span></div><div className="package-list">{packages.map((item, index) => <button key={item.name} className={`package-option ${selected === index ? 'selected' : ''}`} onClick={() => setSelected(index)}><span className="package-radio">{selected === index && <span />}</span><span className="package-copy"><strong>{item.name}</strong><small>{item.description}</small><em>{item.items.slice(0, 2).join(' · ')}</em></span><span className="package-price">{formatPrice(item.price)}<small>{item.time}</small></span></button>)}</div><div className="selected-summary"><span>Total del paquete</span><strong>{formatPrice(chosen.price)}</strong></div><Link className="primary-button wide-button" href={`/servicios/${serviceId}/comprar?paquete=${chosen.id}`}>Comprar paquete <ChevronRight /></Link><div className="trust-row"><span><ShieldCheck /> Pago seguro</span><span><MessageCircle /> Soporte post-entrega</span></div></div>
  if (!mobile) return content
  return <div className="sheet-backdrop" onClick={() => setOpen(false)}><div className="options-sheet" onClick={event => event.stopPropagation()}><button className="sheet-close" aria-label="Cerrar opciones" onClick={() => setOpen(false)}>×</button>{content}</div></div>
}

// Estrellas llenas en ámbar y vacías en gris claro, redondeando el rating (sistema de diseño §4.4).
export function RatingStars({ rating }: { rating: number }) { const filled = Math.round(rating); return <span className="stars" role="img" aria-label={`${rating.toFixed(1)} de 5 estrellas`}>{'★'.repeat(filled)}<span className="stars-empty">{'★'.repeat(5 - filled)}</span></span> }

const reviewAvatarColors = ['indigo', 'emerald', 'rose']

export function ReviewsSection({ provider }: { provider: Provider }) { return <section className="reviews-section detail-section"><div className="reviews-heading"><div><span className="eyebrow">RESEÑAS</span><h2>Lo que dicen los clientes</h2></div>{provider.rating !== null && <div className="rating-overview"><strong>{provider.rating.toFixed(1)}</strong><span><RatingStars rating={provider.rating} /><small>{provider.reviewCount} {provider.reviewCount === 1 ? 'reseña' : 'reseñas'}</small></span></div>}</div>{provider.reviews.length === 0 && <p className="reviews-empty">Sin reseñas todavía.</p>}<div className="review-list">{provider.reviews.map((review, index) => <article className="review" key={review.id}><span className={`large-avatar avatar-${reviewAvatarColors[index % reviewAvatarColors.length]}`}>{review.author.split(' ').map(part => part[0]).join('')}</span><div><div className="review-meta"><strong>{review.author}</strong><small>{review.date}</small></div><RatingStars rating={review.rating} /><p>{review.comment}</p></div></article>)}</div></section> }

export function ServiceDetails({ service, provider }: { service: Service; provider: Provider }) { return <><section className="detail-section"><h2>Descripción del servicio</h2><p>{service.description}</p><h3>Qué incluye</h3><ul className="deliverables">{service.includes.map(item => <li key={item}><Check /> {item}</li>)}</ul><div className="delivery-time"><Clock3 /><span><strong>Tiempo de entrega estimado</strong><small>{service.deliveryTime}</small></span></div></section><ReviewsSection provider={provider} /></> }

import * as React from 'react'
export { ChevronRight, LockKeyhole, MessageCircle, ShieldCheck }
