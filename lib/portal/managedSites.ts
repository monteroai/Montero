// Which client sites Montero actually controls (our Netlify, our source).
// Site Studio can only truly edit these — everything else (Wix, Squarespace,
// client-owned hosting) runs in request-mode: the AI captures exactly what
// the client wants changed and routes it to the team instead of claiming an
// edit it can't deliver.

const MANAGED_HOSTS = new Set([
  'smilemanagementconsultingsnj.com',
  'www.smilemanagementconsultingsnj.com',
  'smileconsultingplaceholder.netlify.app',
  'montero.cool',
  'www.montero.cool',
])

export function isManagedSite(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    return MANAGED_HOSTS.has(new URL(url).hostname.toLowerCase())
  } catch {
    return false
  }
}
