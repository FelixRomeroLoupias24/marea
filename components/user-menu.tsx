'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, ReceiptText, UserRound } from 'lucide-react'
import { useAuth, type User } from '@/components/auth'
import { initialsOf } from '@/lib/services'

// Avatar + nombre del usuario que abre un menú con sus accesos. Se cierra al elegir una opción,
// al hacer clic afuera o con Escape.
export function UserMenu({ user }: { user: User }) {
  const router = useRouter()
  const { logout, setFlash } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent | TouchEvent) => { if (!containerRef.current?.contains(event.target as Node)) setOpen(false) }
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus() } }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('mousedown', onPointerDown); document.removeEventListener('touchstart', onPointerDown); document.removeEventListener('keydown', onKeyDown) }
  }, [open])

  const close = () => setOpen(false)
  const signOut = async () => { close(); await logout(); setFlash('Cerraste sesión.'); router.push('/') }

  return <div className="user-menu" ref={containerRef}>
    <button ref={triggerRef} type="button" className="user-chip" aria-haspopup="menu" aria-expanded={open} aria-controls="user-menu-list" onClick={() => setOpen(value => !value)}>
      <span className="user-avatar">{initialsOf(user.name)}</span><span className="user-name">{user.name.split(' ')[0]}</span><ChevronDown className={`user-chevron ${open ? 'rotated' : ''}`} />
    </button>
    {open && <div className="user-dropdown" id="user-menu-list" role="menu">
      <div className="user-dropdown-header"><strong>{user.name}</strong><span>{user.email}</span></div>
      <Link role="menuitem" href="/ordenes" onClick={close}><ReceiptText /> Mis órdenes</Link>
      <Link role="menuitem" href="/cuenta" onClick={close}><UserRound /> Mi perfil</Link>
      <button role="menuitem" type="button" className="user-dropdown-logout" onClick={signOut}><LogOut /> Cerrar sesión</button>
    </div>}
  </div>
}
