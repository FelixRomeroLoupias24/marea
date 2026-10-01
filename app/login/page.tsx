import { Header } from '@/components/marketplace'
import { LoginForm } from '@/components/auth-forms'

export const metadata = { title: 'Iniciar sesión — marea' }

export default function LoginPage() {
  return <main><Header /><div className="auth-container"><LoginForm /></div></main>
}
