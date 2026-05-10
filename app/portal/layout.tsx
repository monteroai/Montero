import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalShell } from './PortalShell'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  let clientName = 'Client'

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) redirect('/login')

      const { data: client } = await supabase
        .from('portal_clients')
        .select('owner_name')
        .eq('user_id', user.id)
        .single()

      if (client?.owner_name) {
        clientName = client.owner_name
      } else {
        const fullName = user.user_metadata?.full_name as string | undefined
        clientName = fullName ? fullName.split(' ')[0] : user.email?.split('@')[0] || 'Client'
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'digest' in e) throw e
      redirect('/login')
    }
  } else {
    redirect('/login')
  }

  return (
    <PortalShell clientName={clientName} businessName="">
      {children}
    </PortalShell>
  )
}
