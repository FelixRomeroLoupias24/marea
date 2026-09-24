'use client'

import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Filter,
  Menu,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react'

const services = [
  { image: '/services/web-development.png', type: 'fixed', title: 'Desarrollo de landing page de alta conversión', category: 'Desarrollo web', provider: 'Nexo Studio', initials: 'NS', rating: '4.9', reviews: '83', price: '$450', accent: 'indigo' },
  { image: '/services/brand-design.png', type: 'quote', title: 'Identidad visual completa para tu marca', category: 'Diseño y branding', provider: 'Línea Norte', initials: 'LN', rating: '4.8', reviews: '127', price: 'Cotización personalizada', accent: 'rose' },
  { image: '/services/marketing-strategy.png', type: 'fixed', title: 'Estrategia de contenidos y redes sociales', category: 'Marketing digital', provider: 'Estudio Pulso', initials: 'EP', rating: '5.0', reviews: '41', price: '$280', accent: 'emerald' },
  { image: '/services/web-development.png', type: 'quote', title: 'Aplicación web a medida para tu negocio', category: 'Desarrollo web', provider: 'Marea Tech', initials: 'MT', rating: '4.7', reviews: '19', price: 'Cotización personalizada', accent: 'indigo' },
  { image: '/services/brand-design.png', type: 'fixed', title: 'Diseño de piezas para redes sociales', category: 'Diseño gráfico', provider: 'Atelier 8', initials: 'A8', rating: '4.9', reviews: '65', price: '$160', accent: 'rose' },
  { image: '/services/marketing-strategy.png', type: 'fixed', title: 'Campaña de anuncios para ecommerce', category: 'Publicidad online', provider: 'Faro Agency', initials: 'FA', rating: '4.6', reviews: '28', price: '$320', accent: 'emerald' },
]

const categories = ['Desarrollo', 'Diseño', 'Marketing', 'Otros']

function ServiceCard({ service }: { service: typeof services[number] }) {
  const isFixed = service.type === 'fixed'
  return (
    <article className="service-card">
      <div className="service-image-wrap">
        <img src={service.image} alt="" className="service-image" />
        <span className={`offer-badge ${isFixed ? 'fixed-badge' : 'quote-badge'}`}>
          {isFixed ? 'Precio fijo' : 'A cotizar'}
        </span>
      </div>
      <div className="service-content">
        <div className="provider-row">
          <span className={`provider-avatar avatar-${service.accent}`}>{service.initials}</span>
          <span className="provider-name">{service.provider}</span>
          <span className="rating"><Star size={13} fill="currentColor" /> {service.rating} <span className="review-count">({service.reviews})</span></span>
        </div>
        <h2>{service.title}</h2>
        <p className="category">{service.category}</p>
        <div className="card-footer">
          <div>
            <span className="price-label">{isFixed ? 'Desde' : ''}</span>
            <strong className={isFixed ? '' : 'quote-price'}>{service.price}</strong>
          </div>
          <button className="secondary-button">Ver más</button>
        </div>
      </div>
    </article>
  )
}

function Filters({ onClose, onClear }: { onClose?: () => void; onClear: () => void }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Desarrollo', 'Diseño', 'Marketing'])
  const [offer, setOffer] = useState('Todos')
  const [rating, setRating] = useState('Cualquiera')
  return (
    <div className="filters-inner">
      <div className="filter-heading"><span>Filtros</span>{onClose && <button onClick={onClose} aria-label="Cerrar filtros"><X /></button>}</div>
      <div className="filter-section">
        <p className="filter-label">Categoría</p>
        <div className="check-list">
          {categories.map((category) => <label key={category}><input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => setSelectedCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])} /><span className="checkmark" />{category}</label>)}
        </div>
      </div>
      <div className="filter-section">
        <div className="filter-label-row"><p className="filter-label">Rango de precio</p><span>$0 — $2.000+</span></div>
        <input className="price-range" type="range" min="0" max="2000" defaultValue="1200" />
        <div className="range-values"><span>$0</span><span>$2.000+</span></div>
      </div>
      <div className="filter-section">
        <p className="filter-label">Tipo de oferta</p>
        <div className="offer-options">{['Todos', 'Precio fijo', 'A cotizar'].map((item) => <label key={item}><input type="radio" name="offer" checked={offer === item || (item === 'Todos' && offer === 'Todos')} onChange={() => setOffer(item)} /><span className="radio-mark" />{item}</label>)}</div>
      </div>
      <div className="filter-section">
        <p className="filter-label">Rating mínimo</p>
        <select value={rating} onChange={(event) => setRating(event.target.value)} aria-label="Rating mínimo"><option>Cualquiera</option><option>4.5 o más</option><option>4.0 o más</option><option>3.0 o más</option></select>
      </div>
      <button className="clear-button" onClick={onClear}>Limpiar filtros</button>
    </div>
  )
}

export default function Page() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('Más relevantes')
  const [mobileFilters, setMobileFilters] = useState(false)
  const [page, setPage] = useState(1)
  const filteredServices = useMemo(() => services.filter((service) => service.title.toLowerCase().includes(query.toLowerCase()) || service.category.toLowerCase().includes(query.toLowerCase())), [query])
  const clearFilters = () => { setQuery(''); setPage(1); setMobileFilters(false) }

  return (
    <main className="marketplace-shell">
      <header className="site-header">
        <div className="header-content">
          <a className="brand" href="#"><span className="brand-mark">m</span><span>marea</span></a>
          <div className="search-wrap"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar servicios..." aria-label="Buscar servicios" /><kbd>⌘ K</kbd></div>
          <div className="header-actions"><button className="mobile-icon" aria-label="Buscar"><Search /></button><button className="login-button"><CircleUserRound size={18} /> Iniciar sesión</button><button className="mobile-icon" aria-label="Menú"><Menu /></button></div>
        </div>
      </header>
      <div className="mobile-filter-bar"><button className="filter-trigger" onClick={() => setMobileFilters(true)}><SlidersHorizontal size={17} /> Filtros</button><span>{filteredServices.length || 124} servicios</span><button className="sort-mobile" onClick={() => setSort(sort === 'Más relevantes' ? 'Mejor calificados' : 'Más relevantes')}>{sort}<ChevronDown size={16} /></button></div>
      <div className="page-layout">
        <aside className="desktop-filters"><Filters onClear={clearFilters} /></aside>
        <section className="results-area">
          <div className="results-toolbar"><p><strong>{filteredServices.length ? 124 : 0}</strong> servicios encontrados</p><label className="sort-control"><span>Ordenar por</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Más relevantes</option><option>Precio: menor a mayor</option><option>Mejor calificados</option></select><ChevronDown size={16} /></label></div>
          {filteredServices.length ? <div className="service-grid">{filteredServices.map((service) => <ServiceCard key={service.title} service={service} />)}</div> : <div className="empty-state"><div className="empty-icon"><Search /></div><h2>No encontramos servicios con esos filtros</h2><p>Probá ajustando tu búsqueda o limpiando los filtros.</p><button className="primary-button" onClick={clearFilters}>Limpiar filtros</button></div>}
          <div className="pagination"><button aria-label="Página anterior" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}><ChevronLeft /></button>{[1, 2, 3, 4].map((number) => <button key={number} className={page === number ? 'active' : ''} onClick={() => setPage(number)}>{number}</button>)}<span>...</span><button>12</button><button aria-label="Página siguiente" onClick={() => setPage(Math.min(12, page + 1))}><ChevronRight /></button></div>
        </section>
      </div>
      {mobileFilters && <div className="drawer-backdrop" onClick={() => setMobileFilters(false)}><aside className="mobile-drawer" onClick={(event) => event.stopPropagation()}><Filters onClose={() => setMobileFilters(false)} onClear={clearFilters} /></aside></div>}
    </main>
  )
}

