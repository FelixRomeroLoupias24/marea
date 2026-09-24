'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  LockKeyhole,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react'

const packages = [
  { name: 'Básico', price: '$450', time: '5 días', description: 'Una landing page lista para publicar', items: ['1 página responsive', 'Diseño a medida', 'Formulario de contacto'] },
  { name: 'Estándar', price: '$750', time: '7 días', description: 'La opción más elegida para lanzar', items: ['Hasta 3 páginas', 'Diseño a medida', 'SEO básico', '2 rondas de cambios'] },
  { name: 'Premium', price: '$1.200', time: '10 días', description: 'Una experiencia completa y optimizada', items: ['Hasta 5 páginas', 'Animaciones y microinteracciones', 'SEO avanzado', '3 rondas de cambios'] },
]

const reviews = [
  { name: 'Sofía Martínez', initials: 'SM', date: 'Hace 2 semanas', text: 'Trabajar con Nexo fue muy fácil. Entendieron la idea desde el primer día y la landing superó nuestras expectativas.', accent: 'avatar-indigo' },
  { name: 'Tomás Bianchi', initials: 'TB', date: 'Hace 1 mes', text: 'Muy profesionales y atentos a cada detalle. La comunicación fue excelente durante todo el proceso.', accent: 'avatar-emerald' },
  { name: 'Valentina Ríos', initials: 'VR', date: 'Hace 2 meses', text: 'El resultado quedó impecable y entregaron antes de lo previsto. Sin dudas volvería a trabajar con ellos.', accent: 'avatar-rose' },
]

const related = [
  { image: '/services/brand-design.png', title: 'Identidad visual completa para tu marca', provider: 'Línea Norte', price: 'A cotizar', type: 'quote' },
  { image: '/services/marketing-strategy.png', title: 'Estrategia de contenidos y redes', provider: 'Estudio Pulso', price: '$280', type: 'fixed' },
  { image: '/services/web-development.png', title: 'Aplicación web a medida', provider: 'Marea Tech', price: 'A cotizar', type: 'quote' },
  { image: '/services/brand-design.png', title: 'Diseño de piezas para redes', provider: 'Atelier 8', price: '$160', type: 'fixed' },
]

function OfferPanel({ mobile = false }: { mobile?: boolean }) {
  const [selected, setSelected] = useState(1)
  const [open, setOpen] = useState(false)
  const chosen = packages[selected]

  if (mobile && !open) return <div className="mobile-cta"><div><span>Desde</span><strong>{chosen.price}</strong></div><button className="primary-button" onClick={() => setOpen(true)}>Ver opciones</button></div>

  return <>
    {mobile && <div className="sheet-backdrop" onClick={() => setOpen(false)}><div className="options-sheet" onClick={(event) => event.stopPropagation()}><button className="sheet-close" aria-label="Cerrar opciones" onClick={() => setOpen(false)}><X /></button><OfferPanelContent selected={selected} setSelected={setSelected} chosen={chosen} /></div></div>}
    {!mobile && <OfferPanelContent selected={selected} setSelected={setSelected} chosen={chosen} />}
  </>
}

function OfferPanelContent({ selected, setSelected, chosen }: { selected: number; setSelected: (value: number) => void; chosen: typeof packages[number] }) {
  return <div className="offer-panel card-surface">
    <div className="offer-heading"><div><span className="eyebrow">PRECIO FIJO</span><h2>Elegí tu paquete</h2></div><span className="secure-note"><LockKeyhole /> Pago seguro</span></div>
    <div className="package-list">{packages.map((item, index) => <button key={item.name} className={`package-option ${selected === index ? 'selected' : ''}`} onClick={() => setSelected(index)}><span className="package-radio">{selected === index && <span />}</span><span className="package-copy"><strong>{item.name}</strong><small>{item.description}</small><em>{item.items.slice(0, 2).join(' · ')}</em></span><span className="package-price">{item.price}<small>{item.time}</small></span></button>)}</div>
    <div className="selected-summary"><span>Total del paquete</span><strong>{chosen.price}</strong></div>
    <button className="primary-button wide-button">Comprar paquete <ChevronRight /></button>
    <div className="trust-row"><span><ShieldCheck /> Pago seguro</span><span><MessageCircle /> Soporte post-entrega</span></div>
  </div>
}

function RelatedCard({ service }: { service: typeof related[number] }) {
  return <article className="related-card"><div className="related-image"><img src={service.image} alt="" /><span className={service.type === 'fixed' ? 'fixed-badge' : 'quote-badge'}>{service.type === 'fixed' ? 'Precio fijo' : 'A cotizar'}</span></div><strong>{service.title}</strong><span>{service.provider}</span><div><b>{service.price}</b><Star fill="currentColor" /> <small>4.8</small></div></article>
}

export default function Page() {
  return <main className="detail-shell">
    <header className="site-header"><div className="header-content"><a className="brand" href="#"><span className="brand-mark">m</span><span>marea</span></a><div className="search-wrap"><Search size={19} /><input placeholder="Buscar servicios..." aria-label="Buscar servicios" /><kbd>⌘ K</kbd></div><div className="header-actions"><button className="mobile-icon" aria-label="Buscar"><Search /></button><button className="login-button">Iniciar sesión</button><button className="mobile-icon" aria-label="Menú"><Menu /></button></div></div></header>
    <div className="detail-container"><a className="back-link" href="#"><ArrowLeft /> Volver a servicios</a><div className="detail-grid"><div className="detail-main">
      <section className="service-hero"><div className="hero-image"><img src="/services/web-development.png" alt="Diseño de landing page de alta conversión" /><span className="fixed-badge">Precio fijo</span></div><p className="detail-category">Desarrollo web</p><h1>Desarrollo de landing page de alta conversión</h1><div className="provider-detail"><span className="large-avatar avatar-indigo">NS</span><div><strong>Nexo Studio</strong><a href="#">Ver perfil</a></div><span className="detail-rating"><Star fill="currentColor" /> 4.9 <small>· 83 reseñas</small></span></div></section>
      <section className="detail-section"><h2>Descripción del servicio</h2><p>Convertimos tu idea en una landing page clara, atractiva y enfocada en generar resultados. Diseñamos cada sección pensando en tu audiencia y en el objetivo de tu negocio, para que más personas den el siguiente paso.</p><h3>Qué incluye</h3><ul className="deliverables"><li><Check /> Diseño visual a medida alineado a tu marca</li><li><Check /> Desarrollo responsive para todos los dispositivos</li><li><Check /> Integración de formulario de contacto</li><li><Check /> Optimización de velocidad y SEO básico</li></ul><div className="delivery-time"><Clock3 /><span><strong>Tiempo de entrega estimado</strong><small>5 a 10 días hábiles según el paquete elegido</small></span></div></section>
      <section className="reviews-section detail-section"><div className="reviews-heading"><div><span className="eyebrow">RESEÑAS</span><h2>Lo que dicen los clientes</h2></div><div className="rating-overview"><strong>4.9</strong><span><span className="stars">★★★★★</span><small>83 reseñas</small></span></div></div><div className="distribution">{[[5, 80], [4, 15], [3, 3], [2, 1], [1, 1]].map(([stars, percent]) => <div key={stars}><span>{stars} <Star fill="currentColor" /></span><i><b style={{ width: `${percent}%` }} /></i><small>{percent}%</small></div>)}</div><div className="review-list">{reviews.map((review) => <article className="review" key={review.name}><span className={`large-avatar ${review.accent}`}>{review.initials}</span><div><div className="review-meta"><strong>{review.name}</strong><small>{review.date}</small></div><span className="stars">★★★★★</span><p>{review.text}</p></div></article>)}</div><button className="outline-button">Ver más reseñas</button></section>
      <section className="related-section"><div className="section-title"><h2>También te puede interesar</h2><a href="#">Ver todos <ChevronRight /></a></div><div className="related-scroll">{related.map((service) => <RelatedCard service={service} key={service.title} />)}</div></section>
    </div><aside className="desktop-offer"><OfferPanel /></aside></div></div><div className="mobile-offer"><OfferPanel mobile /></div>
  </main>
}
