import Link from 'next/link'
import { Header, BackLink } from '@/components/marketplace'

export default function ProviderNotFound() {
  return <main><Header /><div className="detail-container"><BackLink /><section className="search-empty profile-not-found"><h1>Proveedor no encontrado</h1><p>El perfil que buscás no existe o ya no está disponible.</p><Link className="primary-button" href="/">Explorar servicios</Link></section></div></main>
}
