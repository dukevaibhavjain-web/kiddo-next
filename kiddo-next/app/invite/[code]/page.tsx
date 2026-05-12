import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-admin'

export default async function InvitePage({ params }: { params: { code: string } }) {
  const sb = createAdminClient()
  const { data: referrer } = await sb.from('parents').select('name').eq('referral_code', params.code.toUpperCase()).single()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 20, padding: 40, maxWidth: 460, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎁</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg,#f5a623,#e8488a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>Kiddo</div>
        <div style={{ fontSize: 12, color: 'var(--mut)', marginBottom: 24 }}>From what kids do, to what kids can do</div>

        {referrer ? (
          <p style={{ fontSize: 14, color: 'var(--txt)', lineHeight: 1.7, marginBottom: 28 }}>
            <strong style={{ color: 'var(--acc)' }}>{referrer.name}</strong> has invited you to Kiddo — a daily companion to discover your child&apos;s strengths, track activities, and find their Ikigai.
          </p>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--txt)', lineHeight: 1.7, marginBottom: 28 }}>
            You&apos;ve been invited to Kiddo — a daily companion to discover your child&apos;s strengths, track activities, and find their Ikigai.
          </p>
        )}

        <div style={{ background: 'var(--surf2)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--mut)', lineHeight: 1.7 }}>
            ✅ Day planner with life blocks &nbsp;·&nbsp; 📓 Daily journal<br />
            📚 Book tracker &nbsp;·&nbsp; 📝 Study log &nbsp;·&nbsp; 🏆 Streak &amp; badges<br />
            👥 Network leaderboard &nbsp;·&nbsp; 📊 Export to Excel
          </div>
        </div>

        <Link href={`/auth/signup?ref=${params.code.toUpperCase()}`}
          style={{ display: 'block', padding: '13px 0', background: 'linear-gradient(135deg,#f5a623,#e8488a)', borderRadius: 12, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, textDecoration: 'none', marginBottom: 12 }}>
          Join Kiddo 🎉
        </Link>
        <Link href="/auth/login" style={{ fontSize: 12, color: 'var(--mut)', textDecoration: 'none' }}>Already have an account? Sign in</Link>
      </div>
    </div>
  )
}
