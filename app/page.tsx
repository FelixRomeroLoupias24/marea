import { Search, SlidersHorizontal, Star } from 'lucide-react'
import { Header, ServiceCard } from '@/components/marketplace'

const services = [
  { image: '/services/web-development.png', title: 'Desarrollo de landing page de alta conversión', provider: 'Nexo Studio', price: '$750' },
  { image: '/services/brand-design.png', title: 'Identidad visual completa para tu marca', provider: 'Línea Norte', price: 'A cotizar', quote: true },
  { image: '/services/marketing-strategy.png', title: 'Estrategia de contenidos y redes', provider: 'Estudio Pulso', price: '$280' },
]

export default function Home() {
  return <main><Header /><div className="home-container"><section className="home-hero"><span className="eyebrow">EL MARKETPLACE DE SERVICIOS DIGITALES</span><h1>Encontrá a la persona indicada<br />para hacer realidad tu idea</h1><p>Servicios seleccionados, profesionales confiables y precios claros.</p><div className="home-search"><Search /><input placeholder="¿Qué necesitás resolver?" aria-label="Buscar servicios" /><button className="primary-button">Buscar</button></div></section><section className="results-section"><div className="results-heading"><div><span className="eyebrow">EXPLORÁ SERVICIOS</span><h2>Servicios destacados</h2><p>Una selección de profesionales listos para ayudarte.</p></div><button className="filter-button"><SlidersHorizontal /> Filtrar</button></div><div className="category-row"><button className="category active">Todos</button><button className="category">Desarrollo web</button><button className="category">Diseño</button><button className="category">Marketing</button><button className="category">Contenido</button></div><div className="services-grid">{services.map(service => <ServiceCard key={service.title} {...service} />)}</div></section><section className="trust-banner"><div><Star fill="currentColor" /><strong>Profesionales verificados</strong><span>Trabajá con confianza en cada proyecto.</span></div><div><strong>4.9/5</strong><span>promedio de satisfacción</span></div></section></div></main>
}

export const metadata = { title: 'marea — Servicios digitales' }
