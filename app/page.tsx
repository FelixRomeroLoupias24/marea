'use client'

import { useState } from 'react'
import { ArrowLeft, Check, ChevronDown, ChevronRight, CreditCard, LockKeyhole, MessageCircle, ShieldCheck, LoaderCircle } from 'lucide-react'

const includes = ['Hasta 3 páginas responsive', 'Diseño visual a medida', 'SEO básico', '2 rondas de cambios']

function OrderSummary({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return <aside className={`checkout-summary ${expanded ? 'summary-expanded' : ''}`}>
    <div className="summary-mobile-toggle" onClick={onToggle} role="button" tabIndex={0}>
      <span>Resumen de tu orden</span><strong>$750</strong><ChevronDown className={expanded ? 'rotated' : ''} />
    </div>
    <div className="summary-content">
      <div className="summary-service"><img src="/services/web-development.png" alt="Diseño de landing page" /><div><strong>Desarrollo de landing page de alta conversión</strong><span>Nexo Studio</span></div></div>
      <div className="summary-package"><div><span>Paquete elegido</span><strong>Estándar</strong></div><span className="summary-time">7 días de entrega</span></div>
      <ul className="summary-includes">{includes.map(item => <li key={item}><Check /> {item}</li>)}</ul>
      <div className="price-breakdown"><div><span>Subtotal</span><strong>$750</strong></div><div><span>Cargo de servicio</span><strong>$0</strong></div><div className="total-row"><span>Total</span><strong>$750</strong></div></div>
      <div className="trust-list"><span><LockKeyhole /> Pago seguro</span><span><MessageCircle /> Soporte post-entrega</span></div>
    </div>
  </aside>
}

function CheckoutForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)
  const handleSubmit = (event: React.FormEvent) => { event.preventDefault(); setLoading(true); setError(false); window.setTimeout(() => { setLoading(false); setSubmitted(true) }, 900) }
  if (submitted) return <section className="success-state"><span className="success-icon"><Check /></span><h1>¡Pago confirmado!</h1><p>Tu orden fue creada, el proveedor la verá en breve.</p><button className="primary-button wide-button">Ver mi orden <ChevronRight /></button><button className="secondary-button">Volver al inicio</button></section>
  return <form className="payment-form" onSubmit={handleSubmit}>
    {error && <div className="payment-error" role="alert"><strong>No pudimos procesar el pago.</strong><span>Revisá los datos de tu tarjeta e intentá nuevamente.</span><button type="button" onClick={() => setError(false)}>Reintentar</button></div>}
    <section className="form-section"><div className="section-kicker">1</div><div className="form-section-body"><h2>Datos de contacto</h2><p>Te enviaremos la confirmación de tu orden a estos datos.</p><div className="form-fields"><label>Nombre completo<input required placeholder="Tu nombre" /></label><label>Email<input required type="email" placeholder="nombre@email.com" /></label></div></div></section>
    <section className="form-section"><div className="section-kicker">2</div><div className="form-section-body"><h2>Método de pago</h2><p>Ingresá los datos de tu tarjeta para completar la compra.</p><div className="payment-method"><CreditCard /><strong>Tarjeta de crédito o débito</strong><span>Visa · Mastercard</span></div><div className="form-fields"><label className="field-full">Número de tarjeta<input required inputMode="numeric" placeholder="0000 0000 0000 0000" /></label><label>Vencimiento<input required placeholder="MM / AA" /></label><label>CVV<input required inputMode="numeric" placeholder="123" /></label></div></div></section>
    <label className="terms-check"><input required type="checkbox" /> <span>Acepto los <a href="#">términos y condiciones</a> de la compra.</span></label>
    <button className="primary-button wide-button payment-submit" disabled={loading}>{loading ? <><LoaderCircle className="spinner" /> Procesando pago...</> : <>Confirmar y pagar <ChevronRight /></>}</button>
    <p className="payment-note"><LockKeyhole /> Tu información está protegida y se procesa de forma segura.</p>
  </form>
}

export default function Page() {
  const [summaryOpen, setSummaryOpen] = useState(false)
  return <main className="checkout-page"><header className="site-header"><div className="checkout-header"><a className="brand" href="#"><span className="brand-mark">m</span><span>marea</span></a><span className="checkout-secure"><LockKeyhole /> Checkout seguro</span></div></header><div className="checkout-container"><a className="back-link" href="#"><ArrowLeft /> Volver a la ficha de servicio</a><div className="checkout-breadcrumb"><span>Ficha de servicio</span><ChevronRight /><strong>Checkout</strong></div><div className="checkout-grid"><div className="checkout-main"><div className="checkout-heading"><span className="eyebrow">RESUMEN Y PAGO</span><h1>Finalizá tu compra</h1><p>Estás a un paso de empezar tu proyecto con Nexo Studio.</p></div><CheckoutForm /></div><OrderSummary expanded={summaryOpen} onToggle={() => setSummaryOpen(value => !value)} /></div></div></main>
}
