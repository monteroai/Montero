// Resend email helper. Skips cleanly if RESEND_API_KEY is unset so the route
// that uses it doesn't fail when email is intentionally off.

type SendArgs = {
  to: string
  subject: string
  text: string
  html?: string
  from?: string  // defaults to RESEND_FROM_EMAIL, then to onboarding@resend.dev
  replyTo?: string
}

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; error?: string; id?: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, error: 'RESEND_API_KEY not set' }

  const from = args.from
    || process.env.RESEND_FROM_EMAIL
    || 'Montero <onboarding@resend.dev>'

  const body = {
    from,
    to: [args.to],
    subject: args.subject,
    text: args.text,
    ...(args.html ? { html: args.html } : {}),
    ...(args.replyTo ? { reply_to: args.replyTo } : {}),
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      const text = await r.text()
      return { ok: false, error: `Resend ${r.status}: ${text.slice(0, 200)}` }
    }
    const data = await r.json().catch(() => ({} as { id?: string }))
    return { ok: true, id: data.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' }
  }
}
