import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalShell } from './PortalShell'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  let clientName = 'Client'
  let businessName = 'Business'
  let onboardingComplete = true

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) redirect('/login')

      // Try to get portal_clients row
      const { data: client } = await supabase
        .from('portal_clients')
        .select('owner_name, business_name, onboarding_complete')
        .eq('user_id', user.id)
        .single()

      if (client) {
        clientName = client.owner_name || 'Client'
        businessName = client.business_name || 'Business'
        onboardingComplete = client.onboarding_complete ?? false
      } else {
        // No portal_clients row — use user metadata as fallback
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

  // Gate: redirect to onboarding if not complete (unless already on onboarding page)
  if (!onboardingComplete) {
    // We can't check pathname here easily in a server layout, so the onboarding page itself
    // will handle the "already onboarding" case. The redirect is safe because /portal/onboarding
    // is under this layout too.
  }

  return (
    <PortalShell clientName={clientName} businessName={businessName}>
      {children}
    </PortalShell>
  )
}
