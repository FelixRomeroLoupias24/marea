import { Star } from 'lucide-react'
import { Header } from '@/components/marketplace'
import { ServiceSearch } from '@/components/service-search'
import { getServices } from '@/lib/catalog'
import { getSatisfaction } from '@/lib/services'

// El catálogo se lee de Supabase en cada visita; cuando haya volumen conviene pasar a revalidate.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const services = await getServices()
  const satisfaction = getSatisfaction(services)
  return <main><Header /><div className="home-container"><ServiceSearch services={services}><span className="eyebrow">EL MARKETPLACE DE SERVICIOS DIGITALES</span><h1>Encontrá a la persona indicada <br />para hacer realidad tu idea</h1><p>Servicios seleccionados, profesionales confiables y precios claros.</p></ServiceSearch><section className="trust-banner"><div><Star fill="currentColor" /><strong>Profesionales verificados</strong><span>Trabajá con confianza en cada proyecto.</span></div>{satisfaction && <div title={`Basado en ${satisfaction.reviews} ${satisfaction.reviews === 1 ? 'reseña' : 'reseñas'}`}><strong>{satisfaction.average.toFixed(1)}/5</strong><span>promedio de satisfacción</span></div>}</section></div></main>
}

export const metadata = { title: 'Marea Digital — Servicios digitales' }
