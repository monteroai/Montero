/** @type {import('next').NextConfig} */
const nextConfig = {
  // montero.cool/test = Janeth's test drive (static files in public/test)
  async rewrites() {
    return [
      { source: '/test', destination: '/test/index.html' },
      { source: '/p/astonishing', destination: '/p/astonishing/index.html' },
      { source: '/make', destination: '/make/index.html' },
      { source: '/how', destination: '/how/index.html' },
    ]
  },
  // 11/23/2026: staffing/recruiting offer paused. Pages stay in the repo;
  // every staffing URL sends visitors to the homepage. Remove to restore.
  async redirects() {
    const paused = ['/recruitment', '/recruiting', '/recruiting/:path*', '/weekly', '/video', '/video/:path*',
      '/v/:path*', '/ad/:path*', '/apply/:path*', '/start', '/jobmap/:path*']
    return paused.map((source) => ({ source, destination: '/', permanent: false }))
  },
}
export default nextConfig
