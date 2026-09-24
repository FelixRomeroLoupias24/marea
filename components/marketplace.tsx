'use client'

import { ArrowLeft, Check, ChevronRight, Clock3, LockKeyhole, Menu, MessageCircle, Search, ShieldCheck, Star } from 'lucide-react'
import Link from 'next/link'

export const packages = [
  { name: 'Básico', price: '$450', time: '5 días', description: 'Una landing page lista para publicar', items: ['1 página responsive', 'Diseño a medida', 'Formulario de contacto'] },
  { name: 'Estándar', price: '$750', time: '7 días', description: 'La opción más elegida para lanzar', items: ['Hasta 3 páginas', 'Diseño a medida', 'SEO básico', '2 rondas de cambios'] },
  { name: 'Premium', price: '$1.200', time: '10 días', description: 'Una experiencia completa y optimizada', items: ['Hasta 5 páginas', 'Animaciones y microinteracciones', 'SEO avanzado', '3 rondas de cambios'] },
]

export function Header() {
  return <header className="site-header"><div className="header-content"><Link className="brand" href="/"><span className="brand-mark">m</span><span>marea</span></Link><div className="search-wrap"><Search /><input placeholder="Buscar servicios..." aria-label="Buscar servicios" /><kbd>⌘ K</kbd></div><div className="header-actions"><button className="mobile-icon" aria-label="Buscar"><Search /></button><button className="login-button">Iniciar sesión</button><button className="mobile-icon" aria-label="Menú"><Menu /></button></div></div></header>
}

export function BackLink({ children = 'Volver a servicios' }: { children?: React.ReactNode }) { return <Link className="back-link" href="/"><ArrowLeft /> {children}</Link> }
export function FixedBadge() { return <span className="fixed-badge">Precio fijo</span> }

export function ServiceCard({ image, title, provider, price, quote = false }: { image: string; title: string; provider: string; price: string; quote?: boolean }) {
  return <Link className="service-card" href="/servicios/landing-page"><div className="service-card-image"><img src={image} alt="" /><span className={quote ? 'quote-badge' : 'fixed-badge'}>{quote ? 'A cotizar' : 'Precio fijo'}</span></div><strong>{title}</strong><span>{provider}</span><div><b>{price}</b><Star fill="currentColor" /><small>4.8</small></div></Link>
}

export function OfferPanel({ mobile = false }: { mobile?: boolean }) {
  const [selected, setSelected] = React.useState(1)
  const [open, setOpen] = React.useState(false)
  const chosen = packages[selected]
  if (mobile && !open) return <div className="mobile-cta"><div><span>Desde</span><strong>{chosen.price}</strong></div><button className="primary-button" onClick={() => setOpen(true)}>Ver opciones</button></div>
  const content = <div className="offer-panel card-surface"><div className="offer-heading"><div><span className="eyebrow">PRECIO FIJO</span><h2>Elegí tu paquete</h2></div><span className="secure-note"><LockKeyhole /> Pago seguro</span></div><div className="package-list">{packages.map((item, index) => <button key={item.name} className={`package-option ${selected === index ? 'selected' : ''}`} onClick={() => setSelected(index)}><span className="package-radio">{selected === index && <span />}</span><span className="package-copy"><strong>{item.name}</strong><small>{item.description}</small><em>{item.items.slice(0, 2).join(' · ')}</em></span><span className="package-price">{item.price}<small>{item.time}</small></span></button>)}</div><div className="selected-summary"><span>Total del paquete</span><strong>{chosen.price}</strong></div><Link className="primary-button wide-button" href="/servicios/landing-page/comprar">Comprar paquete <ChevronRight /></Link><div className="trust-row"><span><ShieldCheck /> Pago seguro</span><span><MessageCircle /> Soporte post-entrega</span></div></div>
  if (!mobile) return content
  return <div className="sheet-backdrop" onClick={() => setOpen(false)}><div className="options-sheet" onClick={event => event.stopPropagation()}><button className="sheet-close" aria-label="Cerrar opciones" onClick={() => setOpen(false)}>×</button>{content}</div></div>
}

export function ServiceDetails() { return <><section className="detail-section"><h2>Descripción del servicio</h2><p>Convertimos tu idea en una landing page clara, atractiva y enfocada en generar resultados. Diseñamos cada sección pensando en tu audiencia y en el objetivo de tu negocio, para que más personas den el siguiente paso.</p><h3>Qué incluye</h3><ul className="deliverables">{['Diseño visual a medida alineado a tu marca','Desarrollo responsive para todos los dispositivos','Integración de formulario de contacto','Optimización de velocidad y SEO básico'].map(item => <li key={item}><Check /> {item}</li>)}</ul><div className="delivery-time"><Clock3 /><span><strong>Tiempo de entrega estimado</strong><small>5 a 10 días hábiles según el paquete elegido</small></span></div></section><section className="reviews-section detail-section"><div className="reviews-heading"><div><span className="eyebrow">RESEÑAS</span><h2>Lo que dicen los clientes</h2></div><div className="rating-overview"><strong>4.9</strong><span><span className="stars">★★★★★</span><small>83 reseñas</small></span></div></div><div className="review-list">{['Sofía Martínez','Tomás Bianchi','Valentina Ríos'].map((name, index) => <article className="review" key={name}><span className={`large-avatar avatar-${['indigo','emerald','rose'][index]}`}>{name.split(' ').map(part => part[0]).join('')}</span><div><div className="review-meta"><strong>{name}</strong><small>Hace {index + 1} meses</small></div><span className="stars">★★★★★</span><p>{['Trabajar con Nexo fue muy fácil. Entendieron la idea desde el primer día y la landing superó nuestras expectativas.','Muy profesionales y atentos a cada detalle. La comunicación fue excelente durante todo el proceso.','El resultado quedó impecable y entregaron antes de lo previsto.'][index]}</p></div></article>)}</div></section></> }

import * as React from 'react'
export { ChevronRight, LockKeyhole, MessageCircle, ShieldCheck }
