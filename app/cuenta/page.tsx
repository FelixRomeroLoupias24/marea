import { Header, BackLink } from '@/components/marketplace'
import { AccountView } from '@/components/account-view'

export const metadata = { title: 'Mi cuenta — Marea Digital' }

export default function AccountPage() {
  return <main><Header /><div className="detail-container account-container"><BackLink /><AccountView /></div></main>
}
