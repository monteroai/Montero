import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are a brand designer analyzing a logo image to extract a usable color palette for a customer-facing dashboard.

Look at the logo and identify:
1. The PRIMARY color (the dominant brand color)
2. A SECONDARY color (a complement to the primary that pairs well)
3. An ACCENT color (used sparingly for CTAs/highlights)
4. A BACKGROUND tone (a neutral that works behind text)
5. A TEXT color (readable on the background)

Rules:
- Return EXACTLY one palette
- Use ALL hex colors in #RRGGBB format
- The primary should match the logo's dominant brand color closely
- Secondary should be visually harmonious with primary
- Background should be light (typically off-white) unless the brand is explicitly dark/luxury
- Text should have at least 7:1 contrast against background
- If logo has gold/luxury feel, accent can be gold-toned; otherwise pick a vibrant complement to primary
- Prefer accessible, professional colors. No clown palettes.

Return ONLY a JSON object with this exact shape, no prose:
{
  "primary": "#RRGGBB",
  "secondary": "#RRGGBB",
  "accent": "#RRGGBB",
  "background": "#RRGGBB",
  "text": "#RRGGBB",
  "notes": "1 short sentence on the brand feel you read from the logo"
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { business_id, image_url } = body as { business_id?: string; image_url: string }
    if (!image_url) return NextResponse.json({ error: 'image_url is required' }, { status: 400 })

    // Fetch the image and base64 it
    const imgRes = await fetch(image_url)
    if (!imgRes.ok) {
      return NextResponse.json({ error: `Failed to fetch image (${imgRes.status})` }, { status: 400 })
    }
    const arrayBuf = await imgRes.arrayBuffer()
    const base64 = Buffer.from(arrayBuf).toString('base64')
    const mime = imgRes.headers.get('content-type') || 'image/png'
    const supportedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const usedMime = supportedMimes.includes(mime) ? mime : 'image/png'

    const anthropic = new Anthropic()
    const reply = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: usedMime as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: base64 },
          },
          { type: 'text', text: 'Extract the brand palette as JSON.' },
        ],
      }],
    })

    const text = reply.content[0]?.type === 'text' ? reply.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Claude did not return valid JSON', raw: text }, { status: 502 })
    }
    const palette = JSON.parse(jsonMatch[0])

    // If a business_id was provided, persist the palette to that business
    if (business_id) {
      const { error } = await supabase
        .from('portal_businesses')
        .update({
          brand_colors: {
            primary: palette.primary,
            secondary: palette.secondary,
            accent: palette.accent,
            background: palette.background,
            text: palette.text,
          },
          brand_extracted: palette,
          updated_at: new Date().toISOString(),
        })
        .eq('id', business_id)
      if (error) {
        console.error('persist palette error', error.message)
      }
    }

    return NextResponse.json({ palette })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Brand extraction failed'
    console.error('[extract-brand]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
