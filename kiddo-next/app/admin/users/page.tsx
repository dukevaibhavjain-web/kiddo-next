import { createAdminClient } from '@/lib/supabase-admin'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  const sb = createAdminClient()

  const { data: parents } = await sb
    .from('parents')
    .select(`
      id, name, email, status, referral_code, referred_by, created_at,
      children(id, name, age, grade),
      streaks:children(streaks(current_streak, total_points, last_active))
    `)
    .order('created_at', { ascending: false })

  // Get auth users list for last sign in info
  const { data: { users: authUsers } } = await sb.auth.admin.listUsers()
  const authMap: Record<string, any> = {}
  authUsers?.forEach(u => { authMap[u.id] = u })

  const enriched = (parents || []).map(p => ({
    ...p,
    last_sign_in: authMap[p.id]?.last_sign_in_at || null,
    email_confirmed: authMap[p.id]?.email_confirmed_at ? true : false,
  }))

  return <AdminUsersClient users={enriched} />
}
