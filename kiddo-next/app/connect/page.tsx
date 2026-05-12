"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useKiddo } from '@/components/AppShell'

export default function ConnectPage() {
  const { parent, currentChild } = useKiddo()
  const [refStats, setRefStats] = useState<any>(null)
  const [pending, setPending] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [friendEmail, setFriendEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window?.location?.origin || ''
  const refLink = `${siteUrl}/invite/${parent?.referral_code}`

  useEffect(() => { if (parent) loadConnect() }, [parent, currentChild])

  async function loadConnect() {
    if (!parent) return
    const sb = createClient()

    const [refs, pend, conns] = await Promise.all([
      sb.from('referrals').select('*').eq('referrer_id', parent.id),
      sb.from('connections').select('*, requester:requester_id(name, email)').eq('receiver_id', parent.id).eq('status', 'pending'),
      sb.from('connections').select('requester_id, receiver_id').or(`requester_id.eq.${parent.id},receiver_id.eq.${parent.id}`).eq('status', 'accepted'),
    ])

    setRefStats(refs.data || [])
    setPending(pend.data || [])

    const connectedParentIds = (conns.data || []).map((c: any) => c.requester_id === parent.id ? c.receiver_id : c.requester_id)
    connectedParentIds.push(parent.id)

    const { data: connChildren } = await sb.from('children').select('id, name, avatar_emoji, parent_id, parents!inner(name)').in('parent_id', connectedParentIds).eq('is_active', true)
    const childIds = (connChildren || []).map((c: any) => c.id)
    const { data: lbStreaks } = childIds.length ? await sb.from('streaks').select('*').in('child_id', childIds) : { data: [] }

    const lbd = (lbStreaks || []).map((s: any) => {
      const c = (connChildren || []).find((x: any) => x.id === s.child_id)
      return { childId: s.child_id, childName: c?.name || '?', avatar: c?.avatar_emoji || '👧', parentName: (c?.parents as any)?.name || '?', parentId: c?.parent_id, streak: s.current_streak || 0, pts: s.total_points || 0 }
    }).sort((a: any, b: any) => b.pts - a.pts)

    setLeaderboard(lbd)
  }

  async function copyRefLink() {
    await navigator.clipboard.writeText(refLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  async function sendFriendRequest() {
    if (!friendEmail.trim()) { setMsg('Enter an email address.'); return }
    setLoading(true); setMsg('')
    const sb = createClient()
    const { data: found } = await sb.from('parents').select('id, name').eq('email', friendEmail.trim()).single()
    if (!found) { setMsg('No user found with that email. They may not have signed up yet.'); setLoading(false); return }
    if (found.id === parent?.id) { setMsg("That's your own email!"); setLoading(false); return }
    const { error } = await sb.from('connections').insert({ requester_id: parent?.id, receiver_id: found.id })
    setLoading(false)
    if (error?.code === '23505') { setMsg('Request already sent to ' + found.name); return }
    if (error) { setMsg('Error: ' + error.message); return }
    setMsg(`✅ Request sent to ${found.name}!`)
    setFriendEmail('')
  }

  async function acceptRequest(connId: string) {
    const sb = createClient()
    await sb.from('connections').update({ status: 'accepted' }).eq('id', connId)
    setMsg('Connected! ✅')
    loadConnect()
  }

  const rankIcon = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`

  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 6 }}>👥 Connect</h1>
      <p style={{ color: 'var(--mut)', fontSize: 13, marginBottom: 24 }}>Share your referral link, connect with other parents, see the leaderboard. Only streaks and points are ever visible — journals are always private.</p>

      {msg && <div style={{ background: msg.startsWith('Error') ? 'rgba(239,68,68,.1)' : 'rgba(16,185,129,.1)', border: `1px solid ${msg.startsWith('Error') ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`, borderRadius: 9, padding: '10px 14px', fontSize: 12, color: msg.startsWith('Error') ? '#ef4444' : '#10b981', marginBottom: 16 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Referral */}
        <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Your Referral Link</h3>
          <p style={{ fontSize: 12, color: 'var(--mut)', marginBottom: 12, lineHeight: 1.6 }}>Share this link with other parents. When they join via your link, you both appear in each other&apos;s leaderboard automatically.</p>
          <div onClick={copyRefLink} style={{ background: 'var(--surf2)', border: '1px solid var(--acc)', borderRadius: 10, padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--acc)', marginBottom: 10, cursor: 'pointer' }}>
            {refLink}
          </div>
          <button onClick={copyRefLink} style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#f5a623,#e8488a)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            {copied ? '✅ Copied!' : '📋 Copy Link'}
          </button>
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--surf2)', borderRadius: 9 }}>
            <div style={{ fontSize: 11, color: 'var(--mut)' }}>People joined via your link: <strong style={{ color: 'var(--acc)' }}>{(refStats || []).length}</strong></div>
          </div>
        </div>

        {/* Add friend */}
        <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Add Friend by Email</h3>
          <p style={{ fontSize: 12, color: 'var(--mut)', marginBottom: 12, lineHeight: 1.6 }}>Know someone already on Kiddo? Enter their email to send a connection request.</p>
          <div style={{ marginBottom: 10 }}>
            <input type="email" value={friendEmail} onChange={e => setFriendEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendFriendRequest()} placeholder="friend@email.com"
              style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)', borderRadius: 9, color: 'var(--txt)', fontFamily: "'DM Sans',sans-serif", fontSize: 13, padding: '9px 13px', width: '100%', outline: 'none' }} />
          </div>
          <button onClick={sendFriendRequest} disabled={loading}
            style={{ width: '100%', padding: '9px 0', background: 'linear-gradient(135deg,#f5a623,#e8488a)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, cursor: 'pointer', opacity: loading ? .7 : 1 }}>
            {loading ? 'Sending...' : 'Send Request →'}
          </button>

          {pending.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Pending Requests</div>
              {pending.map((req: any) => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surf2)', borderRadius: 9, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{req.requester?.name || '?'}</div>
                    <div style={{ fontSize: 11, color: 'var(--mut)' }}>{req.requester?.email}</div>
                  </div>
                  <button onClick={() => acceptRequest(req.id)}
                    style={{ padding: '5px 12px', background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', borderRadius: 7, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>🏆 Network Leaderboard</h3>
        <p style={{ fontSize: 11, color: 'var(--mut)', marginBottom: 16 }}>🔒 Only streak and points are visible. Journal entries and notes are always private.</p>
        {leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mut)', fontSize: 13 }}>No connections yet. Share your referral link to build your network!</div>
        ) : (
          leaderboard.map((d, i) => {
            const isMe = currentChild && d.childId === currentChild.id
            return (
              <div key={d.childId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: isMe ? 'rgba(245,166,35,.06)' : 'var(--surf2)', border: `1px solid ${isMe ? 'var(--acc)' : 'var(--bdr)'}`, borderRadius: 10, marginBottom: 6 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, minWidth: 28, textAlign: 'center', color: i === 0 ? '#f5a623' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--mut)' }}>{rankIcon(i)}</div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{d.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.childName}{isMe && <span style={{ fontSize: 10, color: 'var(--acc)', marginLeft: 6 }}>(you)</span>}</div>
                  <div style={{ fontSize: 11, color: 'var(--mut)' }}>via {d.parentName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--acc)' }}>{d.pts} pts</div>
                  <div style={{ fontSize: 11, color: 'var(--mut)' }}>🔥 {d.streak} days</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
