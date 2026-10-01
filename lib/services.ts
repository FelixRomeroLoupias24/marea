// Tipos de la UI y funciones puras de presentación. Los datos vienen de Supabase (lib/catalog.ts y lib/orders.ts),
// que traducen las filas de la base a estos tipos.

export type TipoOferta = 'precio_fijo' | 'a_cotizar'

// Categorías con botón de filtro en la home. 'Otros' existe en la base pero no tiene botón: se ve en "Todos".
export const categories = ['Desarrollo web', 'Diseño', 'Marketing', 'Contenido'] as const
export type Category = (typeof categories)[number] | 'Otros'

// Precios en USD como número; se formatean solo al mostrarlos (formatPrice).
export type Package = { id: string; name: string; price: number; time: string; description: string; items: string[] }

export type Service = {
  id: string
  title: string
  providerId: string
  provider: string
  // Rating del proveedor (null = sin reseñas todavía: nunca se muestra "0.0", regla de negocio §3.6).
  providerRating: number | null
  // Rating y cantidad de reseñas del servicio en sí (los mantiene el trigger de la base).
  rating: number | null
  reviewCount: number
  category: Category
  image: string
  tipo_oferta: TipoOferta
  description: string
  includes: string[]
  deliveryTime: string
  // Solo los servicios de precio fijo tienen paquetes (regla de negocio del backend); los a cotizar, [].
  packages: Package[]
}

export type ProviderReview = { id: string; author: string; rating: number; date: string; comment: string }

export type Provider = {
  id: string
  name: string
  initials: string
  type: 'Freelancer' | 'Agencia'
  avatarColor: 'indigo' | 'emerald' | 'rose'
  verified: boolean
  memberSince: string
  rating: number | null
  reviewCount: number
  bio: string
  reviews: ProviderReview[]
  services: Service[]
}

// Estados tal cual los enums de la base (Orden.estado y SolicitudCotizacion.estado); la UI solo los traduce.
export type EstadoOrden = 'pendiente_pago' | 'pagado' | 'en_progreso' | 'completado' | 'cancelado'
export type EstadoCotizacion = 'pendiente' | 'propuesta_enviada' | 'aceptada' | 'rechazada'
export type StatusTone = 'green' | 'amber' | 'indigo' | 'gray'

export const orderStatus: Record<EstadoOrden | EstadoCotizacion, { label: string; tone: StatusTone }> = {
  pendiente_pago: { label: 'Pendiente de pago', tone: 'amber' },
  pagado: { label: 'Pagado', tone: 'green' },
  en_progreso: { label: 'En progreso', tone: 'indigo' },
  completado: { label: 'Completado', tone: 'green' },
  cancelado: { label: 'Cancelado', tone: 'gray' },
  pendiente: { label: 'Pendiente de respuesta', tone: 'amber' },
  propuesta_enviada: { label: 'Propuesta recibida', tone: 'amber' },
  aceptada: { label: 'Aceptada', tone: 'green' },
  rechazada: { label: 'Rechazada', tone: 'gray' },
}

export type EstadoPropuesta = 'enviada' | 'aceptada' | 'rechazada'

// Propuesta de un proveedor a una solicitud de cotización.
export type Proposal = { id: string; price: number; scope: string; days: number | null; message: string; estado: EstadoPropuesta; date: string }

// Fila de "Mis órdenes": una orden (de paquete o nacida de una propuesta aceptada) o una solicitud de cotización.
type ClientOrderBase = {
  id: string
  // Primeros caracteres del id para mostrar (#3F2A91C0); el id completo es un uuid.
  shortId: string
  date: string
  // Sin precio = cotización todavía sin propuesta ("A definir").
  price?: number
  service: { id: string; title: string; image: string; provider: string } | null
}
export type ClientOrder =
  // counterpart: nombre del cliente cuando la ve el proveedor ("Órdenes recibidas").
  | (ClientOrderBase & { kind: 'orden'; estado: EstadoOrden; origin: 'paquete' | 'propuesta'; packageName: string | null; counterpart?: string })
  | (ClientOrderBase & { kind: 'cotizacion'; estado: EstadoCotizacion; proposals: Proposal[] })

// Estado que se muestra de una solicitud. La base no lo mantiene al día solo: cuando el proveedor envía una
// propuesta la solicitud sigue en 'pendiente', y rechazar todas las propuestas no la pasa a 'rechazada'.
// Por eso se deriva de sus propuestas.
export function quoteDisplayState(stored: EstadoCotizacion, proposals: Pick<Proposal, 'estado'>[]): EstadoCotizacion {
  if (stored === 'aceptada' || proposals.some(item => item.estado === 'aceptada')) return 'aceptada'
  if (proposals.some(item => item.estado === 'enviada')) return 'propuesta_enviada'
  if (proposals.length > 0) return 'rechazada'
  return stored === 'rechazada' ? 'rechazada' : 'pendiente'
}

// Acciones disponibles sobre una orden según quién la mira (mismas reglas que las funciones de la base).
export function orderActions(estado: EstadoOrden, role: 'cliente' | 'proveedor') {
  return {
    start: role === 'proveedor' && estado === 'pagado',
    complete: role === 'proveedor' && estado === 'en_progreso',
    cancel: estado === 'pendiente_pago' || estado === 'pagado',
  }
}

// 1200 → "$1.200" (separador de miles con punto, como en el resto del sitio).
export function formatPrice(amount: number) {
  return `$${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

// Promedio de satisfacción del sitio: promedio de TODAS las reseñas (cada una pesa lo mismo), reconstruido con el
// rating de cada servicio ponderado por su cantidad de reseñas. null si todavía no hay reseñas (nunca "0.0").
// Como el rating de cada servicio ya viene redondeado a 1 decimal, puede diferir en centésimas del promedio exacto.
export function getSatisfaction(services: Service[]) {
  const rated = services.filter(service => service.rating !== null && service.reviewCount > 0)
  const reviews = rated.reduce((sum, service) => sum + service.reviewCount, 0)
  if (reviews === 0) return null
  const average = rated.reduce((sum, service) => sum + (service.rating as number) * service.reviewCount, 0) / reviews
  return { average, reviews }
}

// Paquete más económico: es el que define el "Desde $X" de la tarjeta y de la ficha.
export function getCheapestPackage(service: Service) {
  return service.packages.reduce<Package | undefined>((cheapest, item) => !cheapest || item.price < cheapest.price ? item : cheapest, undefined)
}

// Precio de la ServiceCard: se deriva de los paquetes para que nunca se desincronice de la ficha.
export function getCardPrice(service: Service) {
  const cheapest = getCheapestPackage(service)
  return service.tipo_oferta === 'a_cotizar' || !cheapest ? 'A cotizar' : `Desde ${formatPrice(cheapest.price)}`
}

// Paquete elegido en el checkout; si el id no existe, el del medio (Estándar), que es el que la ficha preselecciona.
export function getPackage(service: Service, id: string | undefined) {
  return service.packages.find(item => item.id === id) ?? service.packages[Math.floor(service.packages.length / 2)]
}

const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

// Fecha local (yyyy-mm-dd) de un timestamp ISO de la base.
export function toLocalISODate(timestamp: string) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// "2026-09-12" → "12 de septiembre, 2026". Se parsea a mano para no depender de la zona horaria del navegador.
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${day} de ${months[month - 1]}, ${year}`
}

// Timestamp → "Hace 3 semanas", como en las reseñas del diseño.
export function relativeDate(timestamp: string, now = new Date()) {
  const days = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 86_400_000)
  if (days < 1) return 'Hoy'
  if (days < 7) return days === 1 ? 'Hace 1 día' : `Hace ${days} días`
  if (days < 30) { const weeks = Math.floor(days / 7); return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas` }
  if (days < 365) { const monthsAgo = Math.floor(days / 30); return monthsAgo === 1 ? 'Hace 1 mes' : `Hace ${monthsAgo} meses` }
  const years = Math.floor(days / 365)
  return years === 1 ? 'Hace 1 año' : `Hace ${years} años`
}

export const initialsOf = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('')
