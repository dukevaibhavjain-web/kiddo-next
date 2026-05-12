import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

const ADMIN_EMAILS = ['your@email.com'] // Add your email here

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')
  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🚫</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: 'var(--txt)', marginBottom: 8 }}>Access Denied</h2>
          <p style={{ color: 'var(--mut)', fontSize: 13, marginBottom: 20 }}>You don&apos;t have admin access.</p>
          <Link href="/home" style={{ color: 'var(--acc)', textDecoration: 'none', fontSize: 13 }}>← Back to App</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderBottom: '1px solid var(--bdr)', background: 'rgba(13,13,20,.97)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, background: 'linear-gradient(135deg,#f5a623,#e8488a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🎁 Kiddo Admin</div>
        <div style={{ height: 20, width: 1, background: 'var(--bdr)' }} />
        {[
          { href: '/admin', label: '📊 Overview' },
          { href: '/admin/users', label: '👥 Users' },
          { href: '/admin/activity', label: '📈 Activity' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ fontSize: 12, color: 'var(--mut)', textDecoration: 'none', padding: '5px 10px', borderRadius: 7 }}>{item.label}</Link>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <Link href="/home" style={{ fontSize: 12, color: 'var(--mut)', textDecoration: 'none' }}>← Back to App</Link>
        </div>
      </nav>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>{children}</main>
    </div>
  )
}
