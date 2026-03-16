import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const REPLICATE_BASE = 'https://api.replicate.com/v1/predictions'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.REPLICATE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'REPLICATE_API_KEY is not configured.' }, { status: 500 })
    }

    // Auth check + credit check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('credits_remaining')
      .eq('id', user.id)
      .single()

    if (!agent || agent.credits_remaining <= 0) {
      return NextResponse.json({ error: 'No credits remaining. Contact your team lead for more credits.' }, { status: 403 })
    }

    const formData = await req.formData()
    const baseImageFile = formData.get('base_image') as File | null
    const roomType = (formData.get('room_type') as string) || 'room'
    const style = (formData.get('style') as string) || 'modern minimalist'

    if (!baseImageFile) {
      return NextResponse.json({ error: 'base_image is required' }, { status: 400 })
    }

    // Convert image to base64 data URI for Replicate
    const buffer = await baseImageFile.arrayBuffer()
    const base64Data = Buffer.from(buffer).toString('base64')
    const mimeType = baseImageFile.type || 'image/jpeg'
    const dataUri = `data:${mimeType};base64,${base64Data}`

    const prompt = `Interior design photograph of a ${roomType}, ${style} aesthetic, professionally staged, luxury real estate photography, natural light, high-end finishes, no people, architectural digest quality`

    // Create prediction with SDXL img2img
    const createRes = await fetch(REPLICATE_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        input: {
          image: dataUri,
          prompt,
          negative_prompt: 'people, persons, humans, blurry, low quality, distorted, watermark, text, logo',
          prompt_strength: 0.45,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
    })

    if (!createRes.ok) {
      const errText = await createRes.text()
      console.error('[stage-room] Replicate create error', createRes.status, errText.slice(0, 400))
      return NextResponse.json({ error: `Replicate error ${createRes.status}: ${errText.slice(0, 300)}` }, { status: createRes.status })
    }

    let prediction = await createRes.json()

    // If Prefer: wait didn't resolve it, poll
    if (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      const pollUrl = prediction.urls?.get || `${REPLICATE_BASE}/${prediction.id}`
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 2000))
        const pollRes = await fetch(pollUrl, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        })
        prediction = await pollRes.json()
        if (prediction.status === 'succeeded' || prediction.status === 'failed') break
      }
    }

    if (prediction.status === 'failed') {
      console.error('[stage-room] Replicate failed', prediction.error)
      return NextResponse.json({ error: prediction.error || 'Staging generation failed.' }, { status: 502 })
    }

    // Get output URL(s)
    const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
    if (!outputUrl) {
      return NextResponse.json({ error: 'No image returned from staging model.' }, { status: 502 })
    }

    // Deduct credit and increment generation count
    await supabase
      .from('agents')
      .update({
        credits_remaining: agent.credits_remaining - 1,
      })
      .eq('id', user.id)

    // Log generation (best-effort, don't block response)
    await supabase.from('generations').insert({
      agent_id: user.id,
      room_type: roomType,
      style,
      output_url: outputUrl,
    })

    return NextResponse.json({ url: outputUrl, credits_remaining: agent.credits_remaining - 1 })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Staging failed'
    console.error('[stage-room]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
