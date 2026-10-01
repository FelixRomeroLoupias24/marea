import { supabase } from '@/lib/supabase'
import { quoteDisplayState, toLocalISODate, type ClientOrder, type EstadoCotizacion, type EstadoOrden, type EstadoPropuesta, type Proposal } from '@/lib/services'

// Órdenes, solicitudes y propuestas del usuario con sesión. Se usa desde el cliente: la sesión de supabase-js viaja
// en cada consulta. Ojo: las políticas RLS devuelven las órdenes donde el usuario es cliente O proveedor, así que
// cada consulta filtra explícitamente por el rol que corresponde.

type ServiceEmbed = { id: string; titulo: string; imagen_url: string | null; proveedor: { perfil: { nombre: string } | null } | null } | null
type OrderRow = {
  id: string; estado: EstadoOrden; monto: number | string; created_at: string; paquete_id: string | null
  servicio: ServiceEmbed; paquete: { nombre: string } | null; cliente?: { nombre: string } | null
}
type ProposalRow = { id: string; precio: number | string; alcance: string | null; tiempo_entrega_dias: number | null; mensaje: string | null; estado: EstadoPropuesta; created_at: string }
type QuoteRow = { id: string; estado: EstadoCotizacion; created_at: string; servicio: ServiceEmbed; propuestas: ProposalRow[] | null }

const SERVICE_EMBED = 'servicio:servicios ( id, titulo, imagen_url, proveedor:proveedores ( perfil:perfiles ( nombre ) ) )'
const ORDER_COLUMNS = `id, estado, monto, created_at, paquete_id, ${SERVICE_EMBED}, paquete:paquetes ( nombre )`

const shortIdOf = (id: string) => id.slice(0, 8).toUpperCase()
const toService = (row: ServiceEmbed) => row && { id: row.id, title: row.titulo, image: row.imagen_url || '/services/web-development.png', provider: row.proveedor?.perfil?.nombre ?? 'Proveedor' }
const byNewest = (a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date)

function toOrder(row: OrderRow): ClientOrder {
  return {
    kind: 'orden', id: row.id, shortId: shortIdOf(row.id), estado: row.estado, date: row.created_at, price: Number(row.monto),
    service: toService(row.servicio), origin: row.paquete_id ? 'paquete' : 'propuesta', packageName: row.paquete?.nombre ?? null,
    counterpart: row.cliente?.nombre,
  }
}

function toProposal(row: ProposalRow): Proposal {
  return { id: row.id, price: Number(row.precio), scope: row.alcance ?? '', days: row.tiempo_entrega_dias, message: row.mensaje ?? '', estado: row.estado, date: row.created_at }
}

// Compras del usuario: sus órdenes (de paquete o de propuesta aceptada) y sus solicitudes de cotización abiertas.
export async function getMyPurchases(userId: string): Promise<ClientOrder[]> {
  const [orders, quotes] = await Promise.all([
    supabase.from('ordenes').select(ORDER_COLUMNS).eq('cliente_id', userId).order('created_at', { ascending: false }),
    supabase.from('solicitudes_cotizacion')
      .select(`id, estado, created_at, ${SERVICE_EMBED}, propuestas:propuestas_cotizacion ( id, precio, alcance, tiempo_entrega_dias, mensaje, estado, created_at )`)
      .eq('cliente_id', userId).order('created_at', { ascending: false }),
  ])
  if (orders.error) throw new Error(`No se pudieron cargar tus órdenes: ${orders.error.message}`)
  if (quotes.error) throw new Error(`No se pudieron cargar tus cotizaciones: ${quotes.error.message}`)

  const quoteRows = (quotes.data as unknown as QuoteRow[]).map((row): ClientOrder => {
    const proposals = (row.propuestas ?? []).map(toProposal).sort(byNewest)
    const estado = quoteDisplayState(row.estado, proposals)
    // Precio a mostrar: la propuesta pendiente de respuesta más nueva o, si no hay, la última recibida.
    const shown = proposals.find(item => item.estado === 'enviada') ?? proposals[0]
    return { kind: 'cotizacion', id: row.id, shortId: shortIdOf(row.id), estado, date: row.created_at, price: shown?.price, service: toService(row.servicio), proposals }
  })
    // Una solicitud aceptada ya tiene su orden en la lista: no se muestra dos veces.
    .filter(item => item.estado !== 'aceptada')

  return [...(orders.data as unknown as OrderRow[]).map(toOrder), ...quoteRows].sort(byNewest)
}

// Id de proveedor del usuario, o null si no es proveedor.
export async function getMyProviderId(userId: string): Promise<string | null> {
  const { data, error } = await supabase.from('proveedores').select('id').eq('usuario_id', userId).maybeSingle()
  if (error) throw new Error(`No se pudo verificar si sos proveedor: ${error.message}`)
  return (data as { id: string } | null)?.id ?? null
}

// Órdenes que recibió el proveedor, con el nombre del cliente (columna pública de perfiles).
export async function getReceivedOrders(providerId: string): Promise<ClientOrder[]> {
  const { data, error } = await supabase.from('ordenes').select(`${ORDER_COLUMNS}, cliente:perfiles ( nombre )`).eq('proveedor_id', providerId).order('created_at', { ascending: false })
  if (error) throw new Error(`No se pudieron cargar las órdenes recibidas: ${error.message}`)
  return (data as unknown as OrderRow[]).map(toOrder)
}

// Fecha local para formatDate() a partir del timestamp de la base.
export const orderDate = (order: ClientOrder) => toLocalISODate(order.date)

export type ActionResult = { ok: true } | { ok: false; error: string }

// Cambios de estado: solo pasan por funciones de la base, que validan dueño y estado. Su `message` viene en
// castellano ("Esta propuesta ya fue respondida", "No podés modificar esta orden"…) y se muestra tal cual.
async function runStateChange(fn: string, args: Record<string, string>): Promise<ActionResult> {
  const { error } = await supabase.rpc(fn, args)
  return error ? { ok: false, error: error.message || 'No se pudo completar la acción. Probá de nuevo.' } : { ok: true }
}

export const acceptProposal = (proposalId: string) => runStateChange('aceptar_propuesta', { p_propuesta_id: proposalId })
export const rejectProposal = (proposalId: string) => runStateChange('rechazar_propuesta', { p_propuesta_id: proposalId })
export const startOrder = (orderId: string) => runStateChange('marcar_orden_en_progreso', { p_orden_id: orderId })
export const completeOrder = (orderId: string) => runStateChange('marcar_orden_completada', { p_orden_id: orderId })
export const cancelOrder = (orderId: string) => runStateChange('cancelar_orden', { p_orden_id: orderId })

// Compra de un paquete: la crea la función crear_orden_paquete de la base, que toma el monto del paquete
// (el navegador no puede elegir monto ni estado). Pago simulado: la orden nace 'pagado'.
export async function createPackageOrder(packageId: string): Promise<{ ok: true; shortId: string } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc('crear_orden_paquete', { p_paquete_id: packageId })
  if (error) return { ok: false, error: 'No pudimos procesar el pago. Probá de nuevo en unos minutos.' }
  return { ok: true, shortId: shortIdOf((data as { id: string }).id) }
}

export type QuoteRequestInput = { serviceId: string; clientId: string; description: string; budgetMin: number | null; budgetMax: number | null; deadline: string | null }

// Solicitud de cotización: el estado arranca en 'pendiente' (default de la base).
export async function createQuoteRequest(input: QuoteRequestInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.from('solicitudes_cotizacion').insert({
    servicio_id: input.serviceId,
    cliente_id: input.clientId,
    descripcion_necesidad: input.description,
    presupuesto_min: input.budgetMin,
    presupuesto_max: input.budgetMax,
    plazo_deseado: input.deadline,
  })
  return error ? { ok: false, error: 'No pudimos enviar tu solicitud. Probá de nuevo en unos minutos.' } : { ok: true }
}
