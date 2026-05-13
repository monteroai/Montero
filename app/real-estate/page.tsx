import { redirect } from 'next/navigation'

// /real-estate (the old Agent OS marketing landing) was removed from the
// public site. Anyone hitting this URL now lands on the client portal login.
// Agent OS itself remains accessible to existing users at /agent-os.
export default function RealEstateRedirect() {
  redirect('/portal')
}
