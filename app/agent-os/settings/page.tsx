import { createClient } from '@/lib/supabase/server'
import DnaEditor from './DnaEditor'

export default async function SettingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dna: any = null
  let userId: string | null = null

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null

      if (userId) {
        const { data } = await supabase
          .from('agent_dna')
          .select('*')
          .eq('agent_id', userId)
          .single()
        dna = data
      }

      // Fallback: try org_slug lookup for legacy data
      if (!dna) {
        const { data } = await supabase
          .from('agent_dna')
          .select('*')
          .eq('org_slug', 'magyar')
          .single()
        dna = data
      }
    } catch {
      // Supabase not available
    }
  }

  return <DnaEditor initialDna={dna} />
}
