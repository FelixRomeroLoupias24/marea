import { notFound, redirect } from 'next/navigation'
import { CheckoutView } from '@/components/checkout-view'
import { getService } from '@/lib/catalog'
import { getPackage } from '@/lib/services'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ paquete?: string }> }) {
  const { id } = await params
  const { paquete } = await searchParams
  const service = await getService(id)
  if (!service) notFound()
  // Regla de negocio: /comprar solo existe para servicios de precio fijo; los a cotizar se piden desde /cotizar.
  if (service.tipo_oferta !== 'precio_fijo') redirect(`/servicios/${id}/cotizar`)

  const pkg = getPackage(service, paquete)
  if (!pkg) notFound()

  return <CheckoutView service={service} pkg={pkg} />
}
