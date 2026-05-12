"use client"
import { useKiddo } from '@/components/AppShell'

export default function DataPage() {
  const { currentChild } = useKiddo()

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
          📊 Data Log
        </h1>
        <p style={{ color: 'var(--mut)', fontSize: 13, lineHeight: 1.7 }}>
          All entries. Export to Excel and drop into Google Drive.
          {currentChild && <><br /><strong style={{ color: 'var(--acc)' }}>Tracking: {currentChild.name}</strong></>}
        </p>
      </div>
      <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", marginBottom: 12, fontSize: 20 }}>Full Feature Coming Soon</h2>
        <p style={{ color: 'var(--mut)', fontSize: 13, lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
          This page is being upgraded. All your data from the current Kiddo app is safe in Supabase and will appear here once the Next.js migration is complete.
        </p>
      </div>
    </div>
  )
}
