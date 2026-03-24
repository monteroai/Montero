import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: client } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) return NextResponse.json({ documents: [] })

  const url = new URL(request.url)
  const type = url.searchParams.get('type')

  let query = supabase
    .from('portal_documents')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data: documents, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ documents: documents || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: client } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const title = formData.get('title') as string
  const type = formData.get('type') as string || 'upload'

  if (!file || !title) {
    return NextResponse.json({ error: 'file and title required' }, { status: 400 })
  }

  // Upload to Supabase Storage
  const filePath = `${client.id}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('portal-uploads')
    .upload(filePath, file)

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('portal-uploads')
    .getPublicUrl(filePath)

  // Create document record
  const { data: doc, error } = await supabase
    .from('portal_documents')
    .insert({
      client_id: client.id,
      type,
      title,
      file_url: publicUrl,
      file_size: file.size,
      status: 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ document: doc })
}
