// Applies portal-tables.sql to the Supabase project using the postgres-meta /query endpoint.
// Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from process.env.
// Run via: node scripts/apply-portal-schema.mjs
import fs from 'node:fs'
import path from 'node:path'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const sqlPath = path.join(process.cwd(), 'scripts', 'portal-tables.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

// Strip out the seed-data comment block at the bottom (everything after the SEED DATA marker).
// We'll seed Janeth's account separately after she signs up.
const ddl = sql.split(/-- ====+\s*\n-- SEED DATA/i)[0]

// Split on semicolons that end statements (naive but works for this schema — no functions/dollar quoting)
const statements = ddl
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'))

console.log(`Applying ${statements.length} SQL statements to ${url}…`)

let okCount = 0
let skipCount = 0
const failures = []

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i] + (statements[i].endsWith(';') ? '' : ';')
  // Use the Supabase pg-meta endpoint at /pg/query (available with service role key on most projects)
  // Fallback: pg-meta /query
  let res
  try {
    res = await fetch(`${url}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query: stmt }),
    })
  } catch (e) {
    failures.push({ idx: i, stmt: stmt.slice(0, 80), error: e.message })
    continue
  }
  if (res.ok) {
    okCount++
  } else {
    const text = await res.text().catch(() => '')
    // 409/already exists is acceptable — IF NOT EXISTS used in DDL handles most
    if (text.includes('already exists') || text.includes('duplicate')) {
      skipCount++
    } else {
      failures.push({ idx: i, status: res.status, stmt: stmt.slice(0, 80), error: text.slice(0, 200) })
    }
  }
}

console.log(`OK: ${okCount}  Skipped (already exists): ${skipCount}  Failures: ${failures.length}`)
if (failures.length) {
  for (const f of failures) {
    console.log(`  [${f.idx}] ${f.status || 'fetch-err'}: ${f.stmt}`)
    console.log(`      → ${f.error}`)
  }
  process.exit(1)
}
