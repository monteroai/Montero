import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GEMINI_MODEL = 'gemini-2.5-flash-image'
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'

// Room-specific furniture instructions — injected server-side, never editable by user
const ROOM_FURNITURE: Record<string, string> = {
  'Bedroom':        'Place a queen or king bed with headboard against the main wall, two matching nightstands with bedside lamps, a dresser or chest of drawers. Keep furniture away from windows.',
  'Living Room':    'Place a sofa facing the room focal point (fireplace or main wall), a coffee table in front of the sofa, one or two accent chairs, floor lamp, side tables. Keep pathways clear and the fireplace fully visible.',
  'Kitchen':        'Add neatly arranged bar stools at any counter or island. Small potted plant or fruit bowl on counter if space allows. Do not block appliances.',
  'Dining Room':    'Place a rectangular or round dining table centered in the room with chairs evenly spaced around it. A pendant or chandelier above the table if a fixture exists.',
  'Bathroom':       'Add neatly folded towels on the towel bar, a small plant on the vanity, soap dispenser, keep all fixtures fully visible.',
  'Office':         'Place a desk against a wall away from the window, an office chair, small bookshelf or storage unit to the side.',
  'Basement':       'Add a sectional sofa or media seating arrangement, a coffee table, area rug to define the space.',
  'Hallway':        'Add a narrow console table against the wall, a mirror above it, small lamp or plant. Keep the walkway fully clear.',
  'Exterior Front': 'Add potted plants or flower arrangements by the entrance. Keep all architectural features, windows, and the front door fully visible.',
  'Exterior Back':  'Add outdoor patio furniture: table with chairs, umbrella if space allows. Keep all structural features visible.',
  'Backyard':       'Add outdoor seating area: lounge chairs, a fire pit table or dining set on the patio. Keep fences, trees, and all features visible.',
}

const DEFAULT_FURNITURE = 'Add appropriate furniture and decor that fits naturally in this room type.'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_API_KEY is not configured.' }, { status: 500 })
    }

    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const formData = await req.formData()
    const baseImageFile = formData.get('base_image') as File | null
    const roomType = (formData.get('room_type') as string) || ''
    const style = (formData.get('style') as string) || ''

    if (!baseImageFile) {
      return NextResponse.json({ error: 'base_image is required' }, { status: 400 })
    }

    const roomFurniture = ROOM_FURNITURE[roomType] || DEFAULT_FURNITURE
    const roomLabel = roomType || 'room'

    // All structural preservation rules are hard-coded here — not visible or editable by users.
    const prompt = `You are a professional virtual staging assistant for real estate photography.

STRICT PRESERVATION RULES — never violate these:
1. Preserve the room's EXACT geometry, dimensions, camera angle, and perspective. Do not alter the viewpoint. Do not change the room's shape, size, or proportions in any way.
2. Keep ALL walls exactly as-is: same color, same texture, same finish. Do not paint, repaint, add texture, or remove any marks, stains, scuffs, or damage visible on walls.
3. Keep ALL flooring exactly as-is: same material, color, and pattern. Do not hide, repair, or cover up any scratches, stains, wear, or damage on floors.
4. Keep ALL fixed features fully visible and unobstructed: windows, doors, fireplace, baseboard heaters, radiators, AC units, PTAC units, kitchen appliances, kitchen cabinetry, outlets, and ceiling light fixtures.
5. Add furniture and decor ONLY. Do not alter anything structural or architectural.
6. Do NOT invent architectural details not present in the original photo (no crown molding, no chair rail, no wainscoting unless already visible).
7. Do NOT place any artwork, picture frames, mirrors, or wall decor over or overlapping windows. Wall art must only hang on solid wall surfaces.
8. Keep the ceiling exactly as-is. Do not add coffers, beams, or medallions.
9. Do NOT hide, cover up, obscure, or digitally repair ANY defects, damage, cracks, water stains, peeling paint, holes, mold, discoloration, or wear visible in the original photo. All imperfections must remain fully visible. This is a legal requirement for real estate marketing.
10. Do NOT change the lighting, brightness, color temperature, or exposure of the room. The ambient light must match the original photo exactly.
11. Do NOT add or remove windows, doors, or any openings. Do NOT change window treatments unless adding simple curtains as decor.
12. Furniture and decor must be the ONLY additions. Nothing may be removed, repaired, enhanced, or altered from the original photo.

Room type: ${roomLabel}
Furniture to add: ${roomFurniture}${style ? `\nStyle preference: ${style}` : ''}`

    const buffer = await baseImageFile.arrayBuffer()
    const base64Data = Buffer.from(buffer).toString('base64')
    const mimeType = (baseImageFile.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp'

    const body = {
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt },
        ],
      }],
      generationConfig: {
        responseModalities: ['image'],
      },
    }

    const res = await fetch(
      `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'identity' },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error('[stage-room] Gemini error', res.status, errText.slice(0, 400))
      return NextResponse.json({ error: `Gemini error ${res.status}: ${errText.slice(0, 300)}` }, { status: res.status })
    }

    const data = await res.json()

    const parts = data?.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData)
    if (!imagePart?.inlineData) {
      const textPart = parts.find((p: { text?: string }) => p.text)
      return NextResponse.json({
        error: 'Gemini did not return an image.',
        detail: textPart?.text ?? JSON.stringify(data).slice(0, 300),
      }, { status: 502 })
    }

    const outMime = imagePart.inlineData.mimeType || 'image/png'
    const dataUri = `data:${outMime};base64,${imagePart.inlineData.data}`

    return NextResponse.json({ url: dataUri })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Staging failed'
    console.error('[stage-room]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
