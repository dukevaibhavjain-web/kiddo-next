"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useKiddo } from '@/components/AppShell'
import Link from 'next/link'

function StatCard({ title, value, sub, color, href }: any) {
  return (
    <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderTop: `3px solid ${color}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--mut)', lineHeight: 1.7, marginBottom: 10, minHeight: 48 }}>{value}</div>
      <Link href={href} style={{ display: 'block', padding: '7px 0', background: 'linear-gradient(135deg,#f5a623,#e8488a)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 11, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>{sub} →</Link>
    </div>
  )
}

export default function HomePage() {
  const { currentChild, parent } = useKiddo()
  const [streak, setStreak] = useState<any>(null)
  const [todayPlan, setTodayPlan] = useState<any>(null)
  const [currentBook, setCurrentBook] = useState<any>(null)
  const [recentJournal, setRecentJournal] = useState<any>(null)
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!currentChild) return
    loadDashboard()
  }, [currentChild])

  async function loadDashboard() {
    if (!currentChild) return
    setLoading(true)
    const sb = createClient()
    const cid = currentChild.id

    const [s, pl, bk, jr, bd] = await Promise.all([
      sb.from('streaks').select('*').eq('child_id', cid).single(),
      sb.from('daily_plans').select('*').eq('child_id', cid).eq('plan_date', today).single(),
      sb.from('books').select('*').eq('child_id', cid).eq('status', 'reading').order('created_at', { ascending: false }).limit(1).single(),
      sb.from('journal_child').select('*').eq('child_id', cid).order('journal_date', { ascending: false }).limit(1).single(),
      sb.from('badges_earned').select('badge_id').eq('child_id', cid)
    ])

    setStreak(s.data)
    setTodayPlan(pl.data)
    setCurrentBook(bk.data)
    setRecentJournal(jr.data)
    setEarnedBadges((bd.data || []).map((b: any) => b.badge_id))
    setLoading(false)
  }

  const badgeIcons: Record<string, string> = {
    first_day: '🌟', streak3: '🔥', streak7: '⚡', streak14: '🌟', streak30: '🏆',
    bookworm: '📚', studious: '🧠', journalist: '📝', pts100: '⭐', pts500: '👑'
  }

  const streakCount = streak?.current_streak || 0
  const points = streak?.total_points || 0

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 18, alignItems: 'start', padding: '14px 0 24px' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--acc)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>✦ Daily Companion</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
            Hello, {parent?.name.split(' ')[0]}! 👋<br />
            <span style={{ background: 'linear-gradient(135deg,#f5a623,#e8488a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {currentChild ? `Tracking ${currentChild.name}` : 'Ready for today?'}
            </span>
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/plan" style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#f5a623,#e8488a)', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 12, textDecoration: 'none' }}>Plan Today →</Link>
            <Link href="/journal" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--bdr)', borderRadius: 9, color: 'var(--txt)', fontSize: 12, textDecoration: 'none' }}>Journal</Link>
            <Link href="/books" style={{ padding: '8px 16px', background: 'var(--surf2)', border: '1px solid var(--bdr)', borderRadius: 9, color: 'var(--txt)', fontSize: 12, textDecoration: 'none' }}>📚 Books</Link>
          </div>
        </div>
        {/* Streak card */}
        <div style={{ background: 'linear-gradient(135deg,rgba(245,166,35,.15),rgba(232,72,138,.1))', border: '1px solid rgba(245,166,35,.4)', borderRadius: 14, padding: 16, textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontSize: 10, color: 'var(--mut)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Streak</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 900, background: 'linear-gradient(135deg,#f5a623,#e8488a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{streakCount}</div>
          <div style={{ fontSize: 11, marginTop: 3 }}>🔥 days</div>
          <div style={{ fontSize: 10, color: 'var(--mut)', marginTop: 5 }}>
            {streakCount === 0 ? 'Start today!' : streakCount < 7 ? `Keep going!` : 'Amazing! 🌟'}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--mut)', fontSize: 13 }}>Loading dashboard...</div>
      ) : (
        <>
          {/* 3 stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
            <StatCard
              title="Today's Plan"
              color="var(--acc)"
              href="/plan"
              sub="Plan Today"
              value={todayPlan
                ? <><strong>{todayPlan.day_type}</strong> · {todayPlan.total_h}h planned<br />{(todayPlan.activities || []).slice(0, 3).join(', ')}{(todayPlan.activities || []).length > 3 ? ' +more' : ''}</>
                : 'No plan saved for today yet.'}
            />
            <StatCard
              title="Currently Reading"
              color="var(--rd)"
              href="/books"
              sub="Book Tracker"
              value={currentBook
                ? <><strong>{currentBook.title}</strong><br /><span style={{ color: 'var(--mut)', fontSize: 11 }}>{currentBook.author || ''}</span>{currentBook.pages_so_far ? <><br /><span style={{ color: 'var(--rd)' }}>Page {currentBook.pages_so_far}{currentBook.pages_total ? '/' + currentBook.pages_total : ''}</span></> : ''}</>
                : 'No book added yet.'}
            />
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderTop: '3px solid var(--gr)', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Points & Badges</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: 'var(--acc)', lineHeight: 1 }}>{points}</div>
              <div style={{ fontSize: 10, color: 'var(--mut)', marginBottom: 8 }}>total points earned</div>
              <div style={{ fontSize: 18, marginBottom: 10 }}>
                {earnedBadges.length > 0
                  ? earnedBadges.slice(0, 5).map(id => <span key={id} title={id}>{badgeIcons[id] || '🏅'}</span>)
                  : <span style={{ fontSize: 11, color: 'var(--mut)' }}>No badges yet — start logging!</span>}
              </div>
              <Link href="/rewards" style={{ display: 'block', padding: '7px 0', background: 'linear-gradient(135deg,#a855f7,#e8488a)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 11, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>🏆 Rewards →</Link>
            </div>
          </div>

          {/* Recent journal */}
          {recentJournal && (
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Latest Journal Entry</div>
                <span style={{ fontSize: 11, color: 'var(--mut)' }}>{recentJournal.journal_date}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {recentJournal.exciting && <div style={{ background: 'var(--surf2)', borderRadius: 9, padding: 12 }}><div style={{ fontSize: 10, color: 'var(--acc)', fontWeight: 600, marginBottom: 4 }}>⚡ EXCITED ABOUT</div><div style={{ fontSize: 12, lineHeight: 1.5 }}>{recentJournal.exciting}</div></div>}
                {recentJournal.discovery && <div style={{ background: 'var(--surf2)', borderRadius: 9, padding: 12 }}><div style={{ fontSize: 10, color: 'var(--rd)', fontWeight: 600, marginBottom: 4 }}>💡 DISCOVERED</div><div style={{ fontSize: 12, lineHeight: 1.5 }}>{recentJournal.discovery}</div></div>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
