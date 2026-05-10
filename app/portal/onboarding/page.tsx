'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Onboarding wizard is being replaced by the in-portal "Add a business" flow.
// This page now redirects users to the right place based on whether they have any businesses.

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/portal/businesses')
      .then(r => r.json())
      .then(d => {
        if ((d.businesses || []).length > 0) {
          router.replace('/portal')
        } else {
          router.replace('/portal/businesses/new')
        }
      })
      .catch(() => router.replace('/portal/businesses/new'))
  }, [router])

  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
      Setting things up…
    </div>
  )
}
