// Quick concept-image generator — writes PNGs to a local folder, no upload.
//   node scripts/gen_images.mjs <prompts.json> <outdir>
// prompts.json: [{ "name": "slug", "prompt": "..." }, ...]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const env = Object.fromEntries(
  readFileSync('D:/make-to-n8n-toolkit/.env', 'utf8')
    .split(/\r?\n/)
    .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map(m => [m[1], m[2].trim().replace(/^["']|["']$/g, '')]),
)

const specs = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'))
const outDir = resolve(process.argv[3])
mkdirSync(outDir, { recursive: true })
const SIZE = process.argv[4] || '1536x1024' // landscape for a web hero

for (const s of specs) {
  process.stdout.write(`  ${s.name} … `)
  const t0 = Date.now()
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: s.prompt, size: SIZE, n: 1 }),
  })
  const j = await res.json()
  if (!res.ok || !j.data?.[0]?.b64_json) {
    console.log(`FAILED: ${JSON.stringify(j).slice(0, 200)}`)
    continue
  }
  const buf = Buffer.from(j.data[0].b64_json, 'base64')
  writeFileSync(`${outDir}/${s.name}.png`, buf)
  console.log(`${(buf.length / 1024).toFixed(0)}KB in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}
console.log(`\n→ ${outDir}`)
