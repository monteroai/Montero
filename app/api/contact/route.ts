import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, message } = body
  if (!email || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  try {
    await fetch('https://montero-cool.app.n8n.cloud/webhook/agent-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, source: 'montero.cool contact form' }),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
