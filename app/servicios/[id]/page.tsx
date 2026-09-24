import { Star } from 'lucide-react'
import { Header, BackLink, FixedBadge, OfferPanel, ServiceDetails } from '@/components/marketplace'

export default function ServicePage() {
  return <main className="detail-shell"><Header /><div className="detail-container"><BackLink /><div className="detail-grid"><div className="detail-main"><section className="service-hero"><div className="hero-image"><img src="/services/web-development.png" alt="Diseño de landing page de alta conversión" /><FixedBadge /></div><p className="detail-category">Desarrollo web</p><h1>Desarrollo de landing page de alta conversión</h1><div className="provider-detail"><span className="large-avatar avatar-indigo">NS</span><div><strong>Nexo Studio</strong><a href="#">Ver perfil</a></div><span className="detail-rating"><Star fill="currentColor" /> 4.9 <small>· 83 reseñas</small></span></div></section><ServiceDetails /></div><aside className="desktop-offer"><OfferPanel /></aside></div></div><div className="mobile-offer"><OfferPanel mobile /></div></main>
}
