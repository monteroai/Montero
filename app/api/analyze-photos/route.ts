import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are analyzing real estate listing photos for a professional real estate agent using MONTERO Agent OS. Look at all photos and identify: property type, standout features, room types visible, any outdoor spaces, any notable architectural details, approximate condition. Then write MLS listing remarks — authoritative, understated, market-expert tone, maximum 130 words, 1-2 tight paragraphs. Banned words: charming, exceptional value, strategic positioning, residence, accommodate, delivers, positioned, offers, provides, features, perfect for morning coffee, bare bones, nestled, leverage, seamless, robust, innovative, cutting-edge, world-class, curated, holistic, synergy, game-changing, transformative, empower. No metaphors or hyperbole. Return JSON with fields: detected_features (array of strings), remarks (string), instagram_caption (string under 150 chars), sms_teaser (string under 160 chars).`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('photos') as File[]
    const address = (formData.get('address') as string) || ''
    const description = (formData.get('description') as string) || ''

    if (files.length === 0 && !description) {
      return NextResponse.json({ error: 'Provide photos or a property description.' }, { status: 400 })
    }

    const client = new Anthropic()

    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const imageBlocks: Anthropic.ImageBlockParam[] = []

    for (const file of files.slice(0, 20)) {
      const mime = supportedTypes.includes(file.type) ? file.type : 'image/jpeg'
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      imageBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mime as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: base64,
        },
      })
    }

    const userContent: Anthropic.ContentBlockParam[] = [
      ...imageBlocks,
      {
        type: 'text',
        text: [
          address ? `Address: ${address}.` : '',
          description ? `Property description: ${description}.` : '',
          imageBlocks.length > 0
            ? `Analyze these ${imageBlocks.length} listing photo(s) and return the JSON response.`
            : 'Write MLS listing remarks based on the property description above and return the JSON response. Set detected_features to an empty array.',
        ].filter(Boolean).join(' '),
      },
    ]

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    })

    const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Claude did not return valid JSON.', raw }, { status: 502 })
    }
    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Analysis failed'
    console.error('[analyze-photos]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
