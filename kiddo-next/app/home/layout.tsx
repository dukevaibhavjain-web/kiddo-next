import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AppShell from '@/components/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Check parent profile and approval status
  const { data: parent } = await supabase
    .from('parents')
    .select('*, children(id, name, age, grade, avatar_emoji, is_active)')
    .eq('id', user.id)
    .single()

  if (!parent) redirect('/auth/login')

  // Pending approval screen
  if (parent.status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
        <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 20, padding: 40, maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 12 }}>Pending Approval</h2>
          <p style={{ fontSize: 13, color: 'var(--mut)', lineHeight: 1.7, marginBottom: 24 }}>
            Your account is waiting for admin approval. You&apos;ll receive an email when you&apos;re approved. This usually happens within 24 hours.
          </p>
          <p style={{ fontSize: 12, color: 'var(--mut)' }}>Signed in as <strong style={{ color: 'var(--txt)' }}>{user.email}</strong></p>
          <form action="/api/signout" method="POST" style={{ marginTop: 20 }}>
            <button type="submit" style={{ background: 'transparent', border: '1px solid var(--bdr)', borderRadius: 9, color: 'var(--mut)', padding: '8px 20px', cursor: 'pointer', fontSize: 12 }}>Sign Out</button>
          </form>
        </div>
      </div>
    )
  }

  if (parent.status === 'archived') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
        <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 20, padding: 40, maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🚫</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 12 }}>Account Archived</h2>
          <p style={{ fontSize: 13, color: 'var(--mut)', lineHeight: 1.7 }}>This account has been archived. Please contact the admin if you think this is a mistake.</p>
        </div>
      </div>
    )
  }

  const activeChildren = (parent.children || []).filter((c: any) => c.is_active)

  return <AppShell parent={parent} children_={activeChildren}>{children}</AppShell>
}
