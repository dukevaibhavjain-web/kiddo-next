import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'

const ADMIN_EMAILS = ['your@email.com'] // same as admin layout

export async function POST(req: NextRequest) {
  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const sb = createAdminClient()
  const { error } = await sb.from('parents').update({ status: 'active' }).eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: '✅ User approved and can now sign in.' })
}
