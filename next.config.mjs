/** @type {import('next').NextConfig} */
const nextConfig = {
  // montero.cool/test = Janeth's test drive (static files in public/test)
  async rewrites() {
    return [{ source: '/test', destination: '/test/index.html' }]
  },
}
export default nextConfig
