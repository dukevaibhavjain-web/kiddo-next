"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function ResetPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  const inputStyle: React.CSSProperties = {
    background: 'var(--surf2)', border: '1px solid var(--bdr)', borderRadius: 9,
    color: 'var(--txt)', fontFamily: "'DM Sans',sans-serif", fontSize: 13,
    padding: '9px 13px', width: '100%', outline: 'none'
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => router.push('/home'), 2500)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 20, padding: 36, maxWidth: 420, width: '100%' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg,#f5a623,#e8488a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 28 }}>🎁 Kiddo</div>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", marginBottom: 8, fontSize: 22 }}>Password Updated!</h2>
            <p style={{ fontSize: 13, color: 'var(--mut)' }}>Taking you to the app...</p>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 8 }}>Set New Password</h2>
            <p style={{ fontSize: 13, color: 'var(--mut)', marginBottom: 24 }}>Choose a new secure password for your account.</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--mut)', marginBottom: 4 }}>New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--mut)', marginBottom: 4 }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Same password again" required style={inputStyle} />
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 9, padding: '9px 12px', color: 'var(--wt)', fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '11px 0', background: 'linear-gradient(135deg,#f5a623,#e8488a)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
              {loading ? 'Updating password...' : 'Set Password →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
