import { createAdminClient } from '@/lib/supabase-admin'

export default async function AdminPage() {
  const sb = createAdminClient()

  const [parents, children, plans, journals, books, study] = await Promise.all([
    sb.from('parents').select('id, status, created_at'),
    sb.from('children').select('id'),
    sb.from('daily_plans').select('id, created_at'),
    sb.from('journal_child').select('id, created_at'),
    sb.from('books').select('id'),
    sb.from('study_log').select('id'),
  ])

  const allParents = parents.data || []
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const stats = [
    { label: 'Total Users', value: allParents.length, icon: '👥', color: '#f5a623' },
    { label: 'Pending Approval', value: allParents.filter(p => p.status === 'pending').length, icon: '⏳', color: '#ef4444' },
    { label: 'Active Users', value: allParents.filter(p => p.status === 'active').length, icon: '✅', color: '#10b981' },
    { label: 'Archived', value: allParents.filter(p => p.status === 'archived').length, icon: '📦', color: '#7a7a9a' },
    { label: 'Total Children', value: (children.data || []).length, icon: '👧', color: '#a855f7' },
    { label: 'Day Plans Logged', value: (plans.data || []).length, icon: '📅', color: '#06b6d4' },
    { label: 'Journal Entries', value: (journals.data || []).length, icon: '📓', color: '#f5a623' },
    { label: 'Books Tracked', value: (books.data || []).length, icon: '📚', color: '#10b981' },
  ]

  // Users joined this week
  const newThisWeek = allParents.filter(p => p.created_at >= weekAgo).length

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--mut)', fontSize: 13 }}>{newThisWeek} new users this week · Today is {today}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderTop: `3px solid ${s.color}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--mut)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {allParents.filter(p => p.status === 'pending').length > 0 && (
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: 8, fontSize: 13 }}>⚠️ {allParents.filter(p => p.status === 'pending').length} user(s) waiting for approval</div>
          <a href="/admin/users" style={{ color: 'var(--acc)', fontSize: 12, textDecoration: 'none' }}>Go to Users → Approve them</a>
        </div>
      )}
    </div>
  )
}
