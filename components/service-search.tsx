'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ServiceCard } from '@/components/marketplace'
import { categories, getCardPrice, getCheapestPackage, type Category, type Service, type TipoOferta } from '@/lib/services'

// Minúsculas y sin tildes (quita las marcas diacríticas tras NFD), para que "diseno" encuentre "Diseño".
const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim()

// Rangos sobre el precio "desde" (paquete más económico). Los servicios a cotizar no tienen precio publicado,
// así que con un rango elegido quedan fuera.
const priceRanges = {
  todos: { label: 'Cualquier precio', min: 0, max: Infinity },
  'hasta-300': { label: 'Hasta $300', min: 0, max: 300 },
  '300-600': { label: '$300 a $600', min: 300, max: 600 },
  'mas-600': { label: 'Más de $600', min: 600, max: Infinity },
} as const
type PriceRange = keyof typeof priceRanges

const ratingOptions = { todos: 'Cualquier rating', '4.5': '4.5 o más', '4.8': '4.8 o más' } as const
type RatingOption = keyof typeof ratingOptions

type Filters = { offer: TipoOferta | 'todos'; price: PriceRange; rating: RatingOption }
const defaultFilters: Filters = { offer: 'todos', price: 'todos', rating: 'todos' }

export function ServiceSearch({ services, children }: { services: Service[]; children: React.ReactNode }) {
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [category, setCategory] = useState<Category | 'Todos'>('Todos')
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [panelOpen, setPanelOpen] = useState(false)

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters(current => ({ ...current, [key]: value }))
  const activeFilters = (Object.keys(defaultFilters) as (keyof Filters)[]).filter(key => filters[key] !== defaultFilters[key]).length
  const clearAll = () => { setQuery(''); setAppliedQuery(''); setCategory('Todos'); setFilters(defaultFilters) }

  // Todos los filtros se combinan: texto Y categoría Y tipo de oferta Y precio Y rating.
  const term = normalize(appliedQuery)
  const range = priceRanges[filters.price]
  const results = services.filter(service => {
    const cheapest = getCheapestPackage(service)?.price
    const rating = service.providerRating ?? 0
    return (category === 'Todos' || service.category === category) &&
      (!term || normalize(service.title).includes(term) || normalize(service.provider).includes(term)) &&
      (filters.offer === 'todos' || service.tipo_oferta === filters.offer) &&
      (filters.price === 'todos' || (cheapest !== undefined && cheapest >= range.min && cheapest <= range.max)) &&
      (filters.rating === 'todos' || rating >= Number(filters.rating))
  })

  const filterPanel = <div className="filter-panel card-surface" id="filtros">
    <label>Tipo de oferta<select value={filters.offer} onChange={event => { const offer = event.target.value as Filters['offer']; setFilters(current => ({ ...current, offer, price: offer === 'a_cotizar' ? 'todos' : current.price })) }}><option value="todos">Precio fijo y a cotizar</option><option value="precio_fijo">Solo precio fijo</option><option value="a_cotizar">Solo a cotizar</option></select></label>
    <label>Rango de precio<select value={filters.price} disabled={filters.offer === 'a_cotizar'} onChange={event => setFilter('price', event.target.value as PriceRange)}>{(Object.keys(priceRanges) as PriceRange[]).map(key => <option key={key} value={key}>{priceRanges[key].label}</option>)}</select><small>{filters.offer === 'a_cotizar' ? 'Los servicios a cotizar no tienen precio publicado.' : 'Según el paquete más económico.'}</small></label>
    <label>Rating mínimo<select value={filters.rating} onChange={event => setFilter('rating', event.target.value as RatingOption)}>{(Object.keys(ratingOptions) as RatingOption[]).map(key => <option key={key} value={key}>{ratingOptions[key]}</option>)}</select></label>
    <button type="button" className="filter-clear" disabled={activeFilters === 0} onClick={() => setFilters(defaultFilters)}><X /> Quitar filtros</button>
  </div>

  return <><section className="home-hero">{children}<form className="home-search" role="search" onSubmit={event => { event.preventDefault(); setAppliedQuery(query) }}><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="¿Qué necesitás resolver?" aria-label="Buscar servicios" /><button type="submit" className="primary-button">Buscar</button></form></section>
    <section className="results-section"><div className="results-heading"><div><span className="eyebrow">EXPLORÁ SERVICIOS</span><h2>Servicios destacados</h2><p>Una selección de profesionales listos para ayudarte.</p></div><button type="button" className={`filter-button ${panelOpen || activeFilters ? 'active' : ''}`} aria-expanded={panelOpen} aria-controls="filtros" onClick={() => setPanelOpen(open => !open)}><SlidersHorizontal /> Filtrar{activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}</button></div>
      {panelOpen && filterPanel}
      <div className="category-row">{(['Todos', ...categories] as const).map(item => <button key={item} type="button" className={`category ${category === item ? 'active' : ''}`} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {services.length === 0 ? <div className="search-empty" role="status"><p>Todavía no hay servicios publicados. Volvé pronto.</p></div>
        : results.length > 0 ? <div className="services-grid">{results.map(service => <ServiceCard key={service.id} href={`/servicios/${service.id}`} image={service.image} title={service.title} provider={service.provider} price={getCardPrice(service)} tipo_oferta={service.tipo_oferta} rating={service.providerRating ?? undefined} />)}</div>
        : <div className="search-empty search-empty-actions" role="status"><p>No encontramos servicios que coincidan con tu búsqueda.</p><button type="button" className="outline-button" onClick={clearAll}>Limpiar búsqueda y filtros</button></div>}
    </section></>
}
