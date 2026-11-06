import { redirect } from 'next/navigation'

// Alias: /recruitment and /recruiting are the same page.
export default function Page() {
  redirect('/recruiting')
}
