"use client"
import { useState } from 'react'

type User = {
  id: string; name: string; email: string; status: string
  referral_code: string; created_at: string; last_sign_in: string | null
  email_confirmed: boolean; children: any[]; referred_by: string | null
}

const badge = (status: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending:  { bg: 'rgba(239,68,68,.12)',   color: '#ef4444', label: '⏳ Pending' },
    active:   { bg: 'rgba(16,185,129,.12)',  color: '#10b981', label: '✅ Active' },
    archived: { bg: 'rgba(122,122,154,.12)', color: '#7a7a9a', label: '📦 Archived' },
  }
  const s = map[status] || map.pending
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
}

function fmt(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminUsersClient({ users }: { users: User[] }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'archived'>('all')
  const [loading, setLoading] = useState<string>('')
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')

  const filtered = users.filter(u => {
    const matchFilter = filter === 'all' || u.status === filter
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  async function action(type: 'approve' | 'archive' | 'send-reset', userId: string, email: string) {
    setLoading(userId + type); setMsg('')
    const res = await fetch(`/api/admin/${type}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email })
    })
    const data = await res.json()
    setLoading('')
    if (data.error) { setMsg('Error: ' + data.error); return }
    setMsg(data.message || 'Done')
    setTimeout(() => window.location.reload(), 1200)
  }

  const counts = {
    all: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    active: users.filter(u => u.status === 'active').length,
    archived: users.filter(u => u.status === 'archived').length,
  }

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
    fontFamily: "'DM Sans',sans-serif",
    background: filter === t ? 'rgba(245,166,35,.15)' : 'var(--surf2)',
    color: filter === t ? 'var(--acc)' : 'var(--mut)',
  })

  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Users</h1>
      <p style={{ color: 'var(--mut)', fontSize: 13, marginBottom: 20 }}>Approve new signups, archive accounts, send password resets.</p>

      {msg && (
        <div style={{ background: msg.startsWith('Error') ? 'rgba(239,68,68,.1)' : 'rgba(16,185,129,.1)', border: `1px solid ${msg.startsWith('Error') ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`, borderRadius: 9, padding: '10px 14px', fontSize: 12, color: msg.startsWith('Error') ? '#ef4444' : '#10b981', marginBottom: 16 }}>{msg}</div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', 'pending', 'active', 'archived'] as const).map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
          style={{ marginLeft: 'auto', background: 'var(--surf2)', border: '1px solid var(--bdr)', borderRadius: 9, color: 'var(--txt)', fontFamily: "'DM Sans',sans-serif", fontSize: 12, padding: '6px 12px', outline: 'none', width: 220 }} />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--surf2)' }}>
              {['Name / Email', 'Status', 'Child(ren)', 'Joined', 'Last Sign In', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--mut)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid var(--bdr)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--mut)' }}>No users found.</td></tr>
            )}
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--txt)', marginBottom: 2 }}>{u.name}</div>
                  <div style={{ color: 'var(--mut)', fontSize: 11 }}>{u.email}</div>
                  {u.referral_code && <div style={{ color: 'var(--mut)', fontSize: 10, marginTop: 2 }}>Code: <span style={{ color: 'var(--acc)' }}>{u.referral_code}</span></div>}
                  {!u.email_confirmed && <div style={{ color: '#ef4444', fontSize: 10, marginTop: 2 }}>⚠ Email not confirmed</div>}
                </td>
                <td style={{ padding: '12px 14px' }}>{badge(u.status)}</td>
                <td style={{ padding: '12px 14px' }}>
                  {(u.children || []).length === 0
                    ? <span style={{ color: 'var(--mut)' }}>—</span>
                    : (u.children || []).map((c: any) => (
                      <div key={c.id} style={{ fontSize: 12, color: 'var(--txt)' }}>{c.name}{c.age ? `, ${c.age}` : ''}{c.grade ? ` · ${c.grade}` : ''}</div>
                    ))
                  }
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--mut)', whiteSpace: 'nowrap' }}>{fmt(u.created_at)}</td>
                <td style={{ padding: '12px 14px', color: 'var(--mut)', whiteSpace: 'nowrap' }}>{fmt(u.last_sign_in)}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {u.status === 'pending' && (
                      <button onClick={() => action('approve', u.id, u.email)} disabled={loading === u.id + 'approve'}
                        style={{ padding: '5px 12px', background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', borderRadius: 7, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 11, cursor: 'pointer', opacity: loading === u.id + 'approve' ? .6 : 1 }}>
                        {loading === u.id + 'approve' ? '...' : '✅ Approve'}
                      </button>
                    )}
                    {u.status === 'active' && (
                      <button onClick={() => action('archive', u.id, u.email)} disabled={loading === u.id + 'archive'}
                        style={{ padding: '5px 12px', background: 'var(--surf2)', border: '1px solid var(--bdr)', borderRadius: 7, color: 'var(--mut)', fontFamily: "'DM Sans',sans-serif", fontSize: 11, cursor: 'pointer', opacity: loading === u.id + 'archive' ? .6 : 1 }}>
                        {loading === u.id + 'archive' ? '...' : '📦 Archive'}
                      </button>
                    )}
                    {u.status === 'archived' && (
                      <button onClick={() => action('approve', u.id, u.email)} disabled={loading === u.id + 'approve'}
                        style={{ padding: '5px 12px', background: 'var(--surf2)', border: '1px solid var(--bdr)', borderRadius: 7, color: 'var(--mut)', fontFamily: "'DM Sans',sans-serif", fontSize: 11, cursor: 'pointer' }}>
                        ↩ Restore
                      </button>
                    )}
                    <button onClick={() => action('send-reset', u.id, u.email)} disabled={loading === u.id + 'send-reset'}
                      style={{ padding: '5px 12px', background: 'var(--surf2)', border: '1px solid var(--bdr)', borderRadius: 7, color: 'var(--mut)', fontFamily: "'DM Sans',sans-serif", fontSize: 11, cursor: 'pointer', opacity: loading === u.id + 'send-reset' ? .6 : 1 }}>
                      {loading === u.id + 'send-reset' ? '...' : '🔑 Send Reset'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
