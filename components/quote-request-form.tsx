'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, Clock3, LoaderCircle } from 'lucide-react'
import { useAuth } from '@/components/auth'
import { createQuoteRequest } from '@/lib/orders'

const deadlines = ['Urgente', '1-2 semanas', '1 mes', 'Flexible']

export function QuoteRequestForm({ serviceId, providerId, provider }: { serviceId: string; providerId: string; provider: string }) {
  const { user } = useAuth()
  const [description, setDescription] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const descriptionEmpty = description.trim() === ''
  const budgetError = budgetMin !== '' && budgetMax !== '' && Number(budgetMax) < Number(budgetMin) ? 'El máximo tiene que ser mayor o igual al mínimo.' : ''

  if (submitted) return <section className="success-state quote-success"><span className="success-icon"><Check /></span><span className="status-badge status-pending"><Clock3 /> Pendiente de respuesta</span><h1>Tu solicitud fue enviada</h1><p>{provider} te va a responder con una propuesta a la brevedad. Podés seguir el estado desde <Link href="/ordenes">Mis órdenes</Link>.</p><Link className="primary-button wide-button" href="/">Volver al inicio <ChevronRight /></Link><Link className="secondary-button" href={`/perfil/${providerId}`}>Ver perfil de {provider}</Link></section>

  return <form className="payment-form" onSubmit={async event => {
    event.preventDefault(); if (descriptionEmpty || budgetError || !user) return
    setError(''); setLoading(true)
    const result = await createQuoteRequest({ serviceId, clientId: user.id, description: description.trim(), budgetMin: budgetMin === '' ? null : Number(budgetMin), budgetMax: budgetMax === '' ? null : Number(budgetMax), deadline: deadline || null })
    setLoading(false)
    if (result.ok) setSubmitted(true); else setError(result.error)
  }}>
    {error && <div className="payment-error" role="alert"><strong>{error}</strong></div>}
    <section className="form-section"><div className="section-kicker">1</div><div className="form-section-body"><h2>Describí tu proyecto</h2><p>Contale al proveedor qué necesitás, para quién es y qué resultado esperás.</p><div className="form-fields"><label className="field-full">Descripción del proyecto<textarea required rows={6} value={description} onChange={event => setDescription(event.target.value)} placeholder="Ej.: Necesitamos una identidad visual para una cafetería de especialidad que abre en marzo: logo, paleta, tipografías y aplicaciones para redes y packaging." /></label></div></div></section>
    <section className="form-section"><div className="section-kicker">2</div><div className="form-section-body"><h2>Presupuesto estimado <span className="optional-tag">Opcional</span></h2><p>Un rango orientativo en USD ayuda al proveedor a ajustar el alcance de su propuesta.</p><div className="form-fields"><label>Mínimo (USD)<input type="number" min={0} step={50} inputMode="numeric" value={budgetMin} onChange={event => setBudgetMin(event.target.value)} placeholder="300" /></label><label>Máximo (USD)<input type="number" min={0} step={50} inputMode="numeric" value={budgetMax} onChange={event => setBudgetMax(event.target.value)} placeholder="800" aria-invalid={budgetError ? true : undefined} /></label>{budgetError && <small className="field-error field-full">{budgetError}</small>}</div></div></section>
    <section className="form-section"><div className="section-kicker">3</div><div className="form-section-body"><h2>Plazo deseado <span className="optional-tag">Opcional</span></h2><p>¿Para cuándo necesitarías tener el trabajo terminado?</p><div className="form-fields"><label className="field-full">Plazo<select value={deadline} onChange={event => setDeadline(event.target.value)}><option value="">Sin preferencia</option>{deadlines.map(option => <option key={option} value={option}>{option}</option>)}</select></label></div></div></section>
    <button className="primary-button wide-button payment-submit" disabled={loading || descriptionEmpty || Boolean(budgetError)}>{loading ? <><LoaderCircle className="spinner" /> Enviando solicitud...</> : <>Enviar solicitud <ChevronRight /></>}</button>
    {descriptionEmpty && <p className="payment-note">Completá la descripción del proyecto para enviar la solicitud.</p>}
  </form>
}
