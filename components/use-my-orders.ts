'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/auth'
import { getMyProviderId, getMyPurchases, getReceivedOrders } from '@/lib/orders'
import type { ClientOrder } from '@/lib/services'

// received: órdenes recibidas como proveedor; null si el usuario no es proveedor.
type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; purchases: ClientOrder[]; received: ClientOrder[] | null }

// Órdenes del usuario con sesión. Se vuelven a pedir si cambia el usuario (login/logout en otra pestaña)
// o al llamar a reload() después de una acción.
export function useMyOrders() {
  const { user } = useAuth()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [version, setVersion] = useState(0)
  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    let active = true
    // En una recarga se mantiene la lista visible (sin esqueleto) hasta que llegan los datos nuevos.
    setState(current => current.status === 'ready' ? current : { status: 'loading' })
    Promise.all([getMyPurchases(userId), getMyProviderId(userId)])
      .then(async ([purchases, providerId]) => {
        const received = providerId ? await getReceivedOrders(providerId) : null
        if (active) setState({ status: 'ready', purchases, received })
      })
      .catch((error: Error) => { if (active) setState({ status: 'error', message: error.message }) })
    return () => { active = false }
  }, [userId, version])

  const reload = useCallback(() => setVersion(value => value + 1), [])
  return { ...state, reload }
}
