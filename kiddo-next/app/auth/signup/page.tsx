"use client"
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
  background: 'var(--surf2)', border: '1px solid var(--bdr)', borderRadius: 9,
  color: 'var(--txt)', fontFamily: "'DM Sans',sans-serif", fontSize: 13,
  padding: '9px 13px', width: '100%', outline: 'none'
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ marginBottom: 11 }}>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--mut)', marginBottom: 4 }}>{label}</label>
      <input {...props} style={inputStyle} />
    </div>
  )
}

function SignupForm() {
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    parentName: '', email: '', password: '', childName: '',
    age: '', grade: '', referralCode: searchParams.get('ref') || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.parentName || !form.email || !form.password || !form.childName) {
      setError('Please fill in all required fields.'); return
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const sb = createClient()

    // 1. Create auth user
    const { data, error: err1 } = await sb.auth.signUp({ email: form.email.trim(), password: form.password })
    if (err1) { setError(err1.message); setLoading(false); return }
    if (!data.user) { setError('Signup failed. Please try again.'); setLoading(false); return }

    // 2. Sign in immediately so session is live for RLS
    const { data: loginData, error: err2 } = await sb.auth.signInWithPassword({
      email: form.email.trim(), password: form.password
    })
    if (err2) { setError('Account created but could not sign in: ' + err2.message); setLoading(false); return }
    const user = loginData.user

    // 3. Find referrer
    let referredBy = null
    if (form.referralCode) {
      const { data: rp } = await sb.from('parents').select('id').eq('referral_code', form.referralCode.toUpperCase()).single()
      if (rp) referredBy = rp.id
    }

    // 4. Create parent profile — status: pending (needs admin approval)
    const { error: parentErr } = await sb.from('parents').insert({
      id: user.id, email: form.email.trim(), name: form.parentName.trim(),
      referred_by: referredBy, status: 'pending'
    })
    if (parentErr) { setError('Profile error: ' + parentErr.message); setLoading(false); return }

    // 5. Create first child
    const { data: child } = await sb.from('children').insert({
      parent_id: user.id, name: form.childName.trim(),
      age: parseInt(form.age) || null, grade: form.grade.trim()
    }).select().single()
    if (child) await sb.from('streaks').insert({ child_id: child.id })

    // 6. Auto-connect with referrer
    if (referredBy && form.referralCode) {
      await sb.from('connections').insert({ requester_id: referredBy, receiver_id: user.id, status: 'accepted' })
      await sb.from('referrals').insert({ referrer_id: referredBy, referred_id: user.id, referral_code: form.referralCode, status: 'joined' })
    }

    // 7. Sign out — user must wait for admin approval
    await sb.auth.signOut()
    setLoading(false)
    setDone(true)
  }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 20, padding: 40, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", marginBottom: 12, fontSize: 22 }}>Account Created!</h2>
        <p style={{ fontSize: 13, color: 'var(--mut)', lineHeight: 1.7, marginBottom: 24 }}>
          Your account is <strong style={{ color: 'var(--acc)' }}>pending approval</strong>. The Kiddo admin will review and approve your account. You&apos;ll be able to sign in once approved.
        </p>
        <Link href="/auth/login" style={{ display: 'inline-block', padding: '10px 28px', background: 'linear-gradient(135deg,#f5a623,#e8488a)', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>Back to Sign In</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 20, padding: 36, maxWidth: 440, width: '100%', margin: '20px auto' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg,#f5a623,#e8488a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>🎁 Kiddo</div>
        <div style={{ fontSize: 11, color: 'var(--mut)', marginBottom: 24 }}>From what kids do, to what kids can do</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 20 }}>Create Account</h2>
        <form onSubmit={handleSignup}>
          <Field label="Your Name (Parent) *" type="text" value={form.parentName} onChange={set('parentName')} placeholder="Your name" required />
          <Field label="Email *" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" required />
          <Field label="Password * (min 6 characters)" type="password" value={form.password} onChange={set('password')} placeholder="Choose a password" required />
          <div style={{ height: 1, background: 'var(--bdr)', margin: '16px 0' }} />
          <Field label="Child's Name *" type="text" value={form.childName} onChange={set('childName')} placeholder="Your child's name" required />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><Field label="Age" type="number" value={form.age} onChange={set('age')} placeholder="12" /></div>
            <div style={{ flex: 1 }}><Field label="Grade" type="text" value={form.grade} onChange={set('grade')} placeholder="Grade 7" /></div>
          </div>
          <Field label="Referral Code (optional)" type="text" value={form.referralCode} onChange={set('referralCode')} placeholder="ABC12345" />
          {error && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 9, padding: '9px 12px', color: 'var(--wt)', fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '11px 0', background: 'linear-gradient(135deg,#f5a623,#e8488a)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, marginBottom: 12 }}>
            {loading ? 'Creating account...' : 'Create Account 🎉'}
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--mut)' }}>
            Already have an account? <Link href="/auth/login" style={{ color: 'var(--acc)', textDecoration: 'none' }}>Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>
}
