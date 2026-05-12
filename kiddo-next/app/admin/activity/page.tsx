import { createAdminClient } from '@/lib/supabase-admin'

export default async function AdminActivityPage() {
  const sb = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const [plans, journals, books, study, streaks] = await Promise.all([
    sb.from('daily_plans').select('plan_date, child_id, children(name, parents(name))').gte('plan_date', weekAgo).order('plan_date', { ascending: false }).limit(50),
    sb.from('journal_child').select('journal_date, mood, energy, child_id, children(name, parents(name))').gte('journal_date', weekAgo).order('journal_date', { ascending: false }).limit(50),
    sb.from('books').select('title, status, created_at, children(name, parents(name))').gte('created_at', weekAgo + 'T00:00:00').order('created_at', { ascending: false }).limit(20),
    sb.from('study_log').select('log_date, subject, minutes, children(name, parents(name))').gte('log_date', weekAgo).order('log_date', { ascending: false }).limit(30),
    sb.from('streaks').select('current_streak, total_points, last_active, children(name, parents(name))').order('total_points', { ascending: false }).limit(20),
  ])

  const moodEmoji: Record<string, string> = { Sleepy: '😴', Neutral: '😐', OK: '🙂', Happy: '😊', Excited: '🤩' }

  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Platform Activity</h1>
      <p style={{ color: 'var(--mut)', fontSize: 13, marginBottom: 24 }}>Last 7 days activity across all users.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Leaderboard */}
        <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 14, padding: 18 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>🏆 Top Streaks (All Time)</h3>
          {(streaks.data || []).map((s: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < (streaks.data || []).length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 900, minWidth: 24, color: i === 0 ? '#f5a623' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--mut)' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{s.children?.name || '?'}</div>
                <div style={{ fontSize: 10, color: 'var(--mut)' }}>via {s.children?.parents?.name || '?'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--acc)' }}>{s.total_points} pts</div>
                <div style={{ fontSize: 10, color: 'var(--mut)' }}>🔥 {s.current_streak} days</div>
              </div>
            </div>
          ))}
          {!(streaks.data || []).length && <div style={{ color: 'var(--mut)', fontSize: 12 }}>No data yet.</div>}
        </div>

        {/* Recent plans */}
        <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 14, padding: 18 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>📅 Recent Day Plans</h3>
          {(plans.data || []).slice(0, 10).map((p: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 12 }}>
              <div>
                <span style={{ fontWeight: 600 }}>{p.children?.name || '?'}</span>
                <span style={{ color: 'var(--mut)', fontSize: 11 }}> · {p.children?.parents?.name || '?'}</span>
              </div>
              <span style={{ color: 'var(--mut)', fontSize: 11 }}>{p.plan_date}</span>
            </div>
          ))}
          {!(plans.data || []).length && <div style={{ color: 'var(--mut)', fontSize: 12 }}>No plans this week.</div>}
        </div>

        {/* Recent journals with mood */}
        <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 14, padding: 18 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>📓 Recent Journal Entries</h3>
          {(journals.data || []).slice(0, 10).map((j: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 12 }}>
              <div>
                <span style={{ fontSize: 16 }}>{moodEmoji[j.mood] || '😐'}</span>
                <span style={{ fontWeight: 600, marginLeft: 6 }}>{j.children?.name || '?'}</span>
                <span style={{ color: 'var(--mut)', fontSize: 11 }}> · {j.children?.parents?.name || '?'}</span>
                {j.energy && <span style={{ color: 'var(--acc)', fontSize: 11, marginLeft: 6 }}>Energy: {j.energy}/5</span>}
              </div>
              <span style={{ color: 'var(--mut)', fontSize: 11 }}>{j.journal_date}</span>
            </div>
          ))}
          {!(journals.data || []).length && <div style={{ color: 'var(--mut)', fontSize: 12 }}>No journals this week.</div>}
        </div>

        {/* Study log */}
        <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 14, padding: 18 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>📝 Recent Study Entries</h3>
          {(study.data || []).slice(0, 10).map((s: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 12 }}>
              <div>
                <span style={{ fontWeight: 600 }}>{s.subject}</span>
                <span style={{ color: 'var(--mut)', fontSize: 11 }}> · {s.children?.name || '?'}{s.minutes ? ` · ${s.minutes}m` : ''}</span>
              </div>
              <span style={{ color: 'var(--mut)', fontSize: 11 }}>{s.log_date}</span>
            </div>
          ))}
          {!(study.data || []).length && <div style={{ color: 'var(--mut)', fontSize: 12 }}>No study entries this week.</div>}
        </div>
      </div>
    </div>
  )
}
