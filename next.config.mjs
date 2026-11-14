/** @type {import('next').NextConfig} */
const nextConfig = {
  // montero.cool/test = Janeth's test drive (static files in public/test)
  async rewrites() {
    return [
      { source: '/test', destination: '/test/index.html' },
      { source: '/p/astonishing', destination: '/p/astonishing/index.html' },
      { source: '/make', destination: '/make/index.html' },
    ]
  },
  // /recruitment and /recruiting are the same page
  async redirects() {
    return [{ source: '/recruitment', destination: '/recruiting', permanent: false }]
  },
}
export default nextConfig
