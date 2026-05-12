import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'

const ADMIN_EMAILS = ['your@email.com']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const sb = createAdminClient()
  // Archive the parent — data is preserved, they just can't access the app
  const { error } = await sb.from('parents').update({ status: 'archived' }).eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also ban them in auth so they can't sign in
  await sb.auth.admin.updateUserById(userId, { ban_duration: '876600h' }) // 100 years

  return NextResponse.json({ message: '📦 User archived. Data preserved.' })
}
