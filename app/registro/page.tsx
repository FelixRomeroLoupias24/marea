import { Header } from '@/components/marketplace'
import { RegisterForm } from '@/components/auth-forms'

export const metadata = { title: 'Crear cuenta — Marea Digital' }

export default function RegisterPage() {
  return <main><Header /><div className="auth-container"><RegisterForm /></div></main>
}
