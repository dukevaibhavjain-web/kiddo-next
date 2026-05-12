"use client"
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
  background: 'var(--surf2)', border: '1px solid var(--bdr)', borderRadius: 9,
  color: 'var(--txt)', fontFamily: "'DM Sans',sans-serif", fontSize: 13,
  padding: '9px 13px', width: '100%', outline: 'none'
}
const btnStyle: React.CSSProperties = {
  width: '100%', padding: '11px 0', background: 'linear-gradient(135deg,#f5a623,#e8488a)',
  border: 'none', borderRadius: 9, color: '#fff', fontFamily: "'DM Sans',sans-serif",
  fontWeight: 600, fontSize: 13, cursor: 'pointer'
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) { setError(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message); return }
    router.push(searchParams.get('next') || '/home')
    router.refresh()
  }

  async function handleForgotPassword() {
    if (!email.trim()) { setError('Enter your email above first.'); return }
    setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setResetSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 20, padding: 36, maxWidth: 420, width: '100%' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, background: 'linear-gradient(135deg,#f5a623,#e8488a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>🎁 Kiddo</div>
        <div style={{ fontSize: 11, color: 'var(--mut)', marginBottom: 28 }}>From what kids do, to what kids can do</div>

        {(urlError) && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 9, padding: '9px 12px', color: 'var(--wt)', fontSize: 12, marginBottom: 14 }}>{urlError}</div>}

        {resetSent ? (
          <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 10, padding: 16, color: '#10b981', fontSize: 13 }}>
            ✓ Password reset email sent to <strong>{email}</strong>. Check your inbox and click the link to set a new password.
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 20 }}>Sign In</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--mut)', marginBottom: 4 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--mut)', marginBottom: 4 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required style={inputStyle} />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <button type="button" onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: 'var(--acc)', fontSize: 11, cursor: 'pointer' }}>Forgot password?</button>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 9, padding: '9px 12px', color: 'var(--wt)', fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? .7 : 1 }}>{loading ? 'Signing in...' : 'Sign In →'}</button>
            <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--mut)' }}>
              No account? <Link href="/auth/signup" style={{ color: 'var(--acc)', textDecoration: 'none' }}>Sign up</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
