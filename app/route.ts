// 11/24/2026: '/' serves the static general homepage from public/home/index.html.
// The previous React homepage (components/home/HomePage) is in git history at app/page.tsx.
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const res = await fetch(new URL('/home/index.html', request.url), { cache: 'no-store' })
  return new Response(await res.text(), {
    status: res.ok ? 200 : 502,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=300' },
  })
}
