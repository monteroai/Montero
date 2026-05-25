// Admin notification helpers — pings ai@montero.cool via Resend when
// platform events happen. Best-effort: never block the route, just log on
// failure. The DB / Vault is always the source of truth.

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'Montero <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'ai@montero.cool'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://montero.cool'

interface SendArgs {
  subject: string
  html: string
  replyTo?: string
}

async function sendAdminEmail({ subject, html, replyTo }: SendArgs): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('[notifications] RESEND_API_KEY not set — skipping admin email')
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [ADMIN_EMAIL],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => 'unknown')
      console.error('[notifications] Resend failed:', res.status, body)
      return false
    }
    return true
  } catch (e) {
    console.error('[notifications] Resend network error:', (e as Error).message)
    return false
  }
}

// Sent when a client verifies a credential (n8n, VAPI, Twilio, etc).
// Lets Emilio know it's time to build their automations.
export async function notifyAdminOfCredentialVerified(args: {
  clientName: string
  clientEmail: string | null
  service: string
  serviceLabel?: string
  businessName?: string | null
}): Promise<boolean> {
  const esc = (s: string) => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

  const label = args.serviceLabel || args.service
  const subject = `[Montero] ${esc(args.clientName)} just connected ${label}`
  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1B2B5E; font-size: 20px; margin: 0 0 14px;">${esc(args.clientName)} just connected ${esc(label)}</h2>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 110px;">Client</td><td style="padding: 6px 0; font-size: 14px; color: #1e293b;"><strong>${esc(args.clientName)}</strong> ${args.clientEmail ? `&lt;${esc(args.clientEmail)}&gt;` : ''}</td></tr>
        ${args.businessName ? `<tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Business</td><td style="padding: 6px 0; font-size: 14px; color: #1e293b;">${esc(args.businessName)}</td></tr>` : ''}
        <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Service</td><td style="padding: 6px 0; font-size: 14px; color: #1e293b;">${esc(label)}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Time</td><td style="padding: 6px 0; font-size: 14px; color: #1e293b;">${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td></tr>
      </table>

      <p style="font-size: 13px; color: #1e293b; line-height: 1.6;">
        Key is encrypted in Vault. Log in as admin, switch to their business in the header, and deploy the workflows they need.
      </p>

      <div style="margin-top: 18px;">
        <a href="${SITE_URL}/portal/automations" style="display: inline-block; background: linear-gradient(135deg, #1B2B5E, #2563eb); color: #fff; padding: 11px 22px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Open admin dashboard →
        </a>
      </div>

      <p style="font-size: 11px; color: #94a3b8; margin-top: 24px;">
        You're getting this because Flagged Issues (Settings → Notifications) is on for the admin account.
      </p>
    </div>
  `

  return sendAdminEmail({
    subject,
    html,
    replyTo: args.clientEmail || undefined,
  })
}
