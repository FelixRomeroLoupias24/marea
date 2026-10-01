import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import { initialsOf, relativeDate, type Category, type Package, type Provider, type ProviderReview, type Service } from '@/lib/services'

// Lectura del catálogo público (servicios, paquetes, proveedores, reseñas) desde Supabase.
// Solo lecturas públicas: las políticas RLS dejan ver servicios activos, proveedores, paquetes y reseñas a cualquiera.
// De perfiles se piden SOLO columnas públicas (nombre): email y rol no son legibles y un select('*') fallaría.

// Filas tal como las devuelve PostgREST con estas consultas (sin tipos generados todavía).
type PackageRow = { id: string; nombre: string; precio: number | string; entregables: string[] | null; tiempo_entrega_dias: number | null; revisiones_incluidas: number | null }
type ServiceRow = {
  id: string; titulo: string; descripcion: string | null; categoria: string; tipo_oferta: Service['tipo_oferta']; imagen_url: string | null
  entregables: string[] | null; tiempo_entrega_estimado_dias: number | null
  rating_promedio: number | string | null; cantidad_resenas: number
  proveedor: { id: string; rating_promedio: number | string | null; perfil: { nombre: string } | null } | null
  paquetes: PackageRow[] | null
}
type ProviderRow = {
  id: string; tipo: 'freelancer' | 'agencia'; bio: string | null; verificado: boolean; miembro_desde: string
  rating_promedio: number | string | null; cantidad_resenas: number; perfil: { nombre: string } | null
}
type ReviewRow = { id: string; calificacion: number; comentario: string | null; created_at: string; autor: { nombre: string } | null }

const SERVICE_COLUMNS = `
  id, titulo, descripcion, categoria, tipo_oferta, imagen_url, entregables, tiempo_entrega_estimado_dias, rating_promedio, cantidad_resenas,
  proveedor:proveedores ( id, rating_promedio, perfil:perfiles ( nombre ) ),
  paquetes ( id, nombre, precio, entregables, tiempo_entrega_dias, revisiones_incluidas )`

const categoryLabels: Record<string, Category> = { desarrollo: 'Desarrollo web', 'diseño': 'Diseño', marketing: 'Marketing', contenido: 'Contenido', otros: 'Otros' }
const avatarColors: Provider['avatarColor'][] = ['indigo', 'emerald', 'rose']
const FALLBACK_IMAGE = '/services/web-development.png'

// Los ids de la base son uuid: uno inválido en la URL es "no encontrado", no un error de la consulta.
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
// numeric de Postgres puede llegar como string; null se respeta (sin reseñas todavía).
const toNumber = (value: number | string | null) => value === null ? null : Number(value)

function toPackage(row: PackageRow): Package {
  const revisions = row.revisiones_incluidas
  return {
    id: row.id,
    name: row.nombre,
    price: Number(row.precio),
    time: row.tiempo_entrega_dias ? `${row.tiempo_entrega_dias} días` : 'A convenir',
    description: revisions ? `${revisions} ${revisions === 1 ? 'ronda' : 'rondas'} de cambios` : 'Sin rondas de cambios',
    items: row.entregables ?? [],
  }
}

function deliveryTimeOf(row: ServiceRow, packages: Package[]) {
  const days = (row.paquetes ?? []).map(item => item.tiempo_entrega_dias).filter((value): value is number => value !== null)
  if (days.length) {
    const min = Math.min(...days), max = Math.max(...days)
    return min === max ? `${min} días hábiles` : `${min} a ${max} días hábiles según el paquete elegido`
  }
  if (row.tiempo_entrega_estimado_dias) return `${row.tiempo_entrega_estimado_dias} días hábiles`
  return packages.length ? 'A convenir' : 'Se define en la propuesta según el alcance'
}

function toService(row: ServiceRow): Service {
  const packages = (row.paquetes ?? []).map(toPackage).sort((a, b) => a.price - b.price)
  return {
    id: row.id,
    title: row.titulo,
    providerId: row.proveedor?.id ?? '',
    provider: row.proveedor?.perfil?.nombre ?? 'Proveedor',
    providerRating: toNumber(row.proveedor?.rating_promedio ?? null),
    rating: toNumber(row.rating_promedio),
    reviewCount: row.cantidad_resenas,
    category: categoryLabels[row.categoria] ?? 'Otros',
    image: row.imagen_url || FALLBACK_IMAGE,
    tipo_oferta: row.tipo_oferta,
    description: row.descripcion ?? '',
    includes: row.entregables ?? [],
    deliveryTime: deliveryTimeOf(row, packages),
    packages: row.tipo_oferta === 'precio_fijo' ? packages : [],
  }
}

function toReview(row: ReviewRow): ProviderReview {
  return { id: row.id, author: row.autor?.nombre ?? 'Cliente', rating: row.calificacion, date: relativeDate(row.created_at), comment: row.comentario ?? '' }
}

// Color estable por proveedor (no cambia entre visitas) a partir de su id.
const colorFor = (id: string) => avatarColors[[...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length]

function fail(context: string, error: { message: string }): never {
  throw new Error(`No se pudo cargar ${context} desde Supabase: ${error.message}`)
}

// cache() evita repetir la misma consulta dentro de un render (por ejemplo generateMetadata + la página).
export const getServices = cache(async (): Promise<Service[]> => {
  const { data, error } = await supabase.from('servicios').select(SERVICE_COLUMNS).eq('estado', 'activo').order('created_at')
  if (error) fail('los servicios', error)
  return (data as unknown as ServiceRow[]).map(toService)
})

export const getService = cache(async (id: string): Promise<Service | null> => {
  if (!isUuid(id)) return null
  const { data, error } = await supabase.from('servicios').select(SERVICE_COLUMNS).eq('id', id).maybeSingle()
  if (error) fail('el servicio', error)
  return data ? toService(data as unknown as ServiceRow) : null
})

export const getProvider = cache(async (id: string): Promise<Provider | null> => {
  if (!isUuid(id)) return null
  const [providerResult, servicesResult, reviewsResult] = await Promise.all([
    supabase.from('proveedores').select('id, tipo, bio, verificado, miembro_desde, rating_promedio, cantidad_resenas, perfil:perfiles ( nombre )').eq('id', id).maybeSingle(),
    supabase.from('servicios').select(SERVICE_COLUMNS).eq('proveedor_id', id).eq('estado', 'activo').order('created_at'),
    supabase.from('resenas').select('id, calificacion, comentario, created_at, autor:perfiles ( nombre )').eq('proveedor_id', id).order('created_at', { ascending: false }),
  ])
  if (providerResult.error) fail('el proveedor', providerResult.error)
  if (servicesResult.error) fail('los servicios del proveedor', servicesResult.error)
  if (reviewsResult.error) fail('las reseñas', reviewsResult.error)
  const row = providerResult.data as unknown as ProviderRow | null
  if (!row) return null

  const name = row.perfil?.nombre ?? 'Proveedor'
  return {
    id: row.id,
    name,
    initials: initialsOf(name),
    type: row.tipo === 'agencia' ? 'Agencia' : 'Freelancer',
    avatarColor: colorFor(row.id),
    verified: row.verificado,
    memberSince: row.miembro_desde.slice(0, 4),
    rating: toNumber(row.rating_promedio),
    reviewCount: row.cantidad_resenas,
    bio: row.bio ?? '',
    reviews: (reviewsResult.data as unknown as ReviewRow[]).map(toReview),
    services: (servicesResult.data as unknown as ServiceRow[]).map(toService),
  }
})
