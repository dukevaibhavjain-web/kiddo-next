"use client"
import { useState, createContext, useContext, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

interface Child { id: string; name: string; age: number | null; grade: string | null; avatar_emoji: string | null }
interface Parent { id: string; name: string; email: string; referral_code: string; status: string }

// Context so any child component can read current child
export const KiddoContext = createContext<{ currentChild: Child | null; setCurrentChild: (c: Child) => void; parent: Parent | null }>({ currentChild: null, setCurrentChild: () => {}, parent: null })
export const useKiddo = () => useContext(KiddoContext)

const navItems = [
  { href: '/home', label: 'Home', icon: '🏠' },
  { href: '/plan', label: 'Day Plan', icon: '📅' },
  { href: '/journal', label: 'Journal', icon: '📓' },
  { href: '/books', label: 'Books', icon: '📚' },
  { href: '/study', label: 'Study', icon: '📝' },
  { href: '/rewards', label: 'Rewards', icon: '🏆' },
  { href: '/connect', label: 'Connect', icon: '👥' },
  { href: '/data', label: 'Data', icon: '📊' },
]

export default function AppShell({ parent, children_, children }: { parent: Parent; children_: Child[]; children: React.ReactNode }) {
  const [currentChild, setCurrentChild] = useState<Child | null>(children_[0] || null)
  const [signingOut, setSigningOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    setSigningOut(true)
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }, [router])

  return (
    <KiddoContext.Provider value={{ currentChild, setCurrentChild, parent }}>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        {/* Child selector bar */}
        {children_.length > 0 && (
          <div style={{ background: 'var(--surf)', borderBottom: '1px solid var(--bdr)', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
            {children_.map(c => (
              <button key={c.id} onClick={() => setCurrentChild(c)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, border: '1px solid', borderColor: currentChild?.id === c.id ? 'var(--acc)' : 'var(--bdr)', background: currentChild?.id === c.id ? 'rgba(245,166,35,.15)' : 'transparent', color: currentChild?.id === c.id ? 'var(--acc)' : 'var(--mut)', fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {c.avatar_emoji || '👧'} {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1px solid var(--bdr)', background: 'rgba(13,13,20,.97)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(14px)', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 900, background: 'linear-gradient(135deg,#f5a623,#e8488a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🎁 Kiddo</div>
            <div style={{ fontSize: 9, color: 'var(--mut)', marginTop: 1 }}>From what kids do, to what kids can do</div>
          </div>
          <div style={{ display: 'flex', gap: 2, background: 'var(--surf)', borderRadius: 10, padding: 3, flexWrap: 'wrap', overflowX: 'auto' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                style={{ padding: '5px 10px', borderRadius: 7, border: pathname === item.href ? '1px solid var(--bdr)' : '1px solid transparent', background: pathname === item.href ? 'var(--surf2)' : 'transparent', color: pathname === item.href ? 'var(--txt)' : 'var(--mut)', fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{item.icon}</span> {item.label}
              </Link>
            ))}
          </div>
          <button onClick={handleSignOut} disabled={signingOut}
            style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--mut)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#f5a623,#e8488a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>👤</div>
            <span style={{ color: 'var(--txt)' }}>{parent.name.split(' ')[0]}</span>
            <span style={{ fontSize: 10 }}>{signingOut ? '...' : '↗'}</span>
          </button>
        </nav>

        {/* Page content */}
        <main style={{ maxWidth: 1280, margin: '0 auto', padding: 18 }}>
          {children}
        </main>
      </div>
    </KiddoContext.Provider>
  )
}
