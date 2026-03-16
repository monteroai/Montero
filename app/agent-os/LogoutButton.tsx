'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '6px 14px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.5)',
        border: '1px solid rgba(255,255,255,0.6)',
        fontSize: '13px',
        fontWeight: 500,
        color: '#64748b',
        cursor: 'pointer',
      }}
    >
      Log out
    </button>
  )
}
