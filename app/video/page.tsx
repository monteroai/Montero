import type { Metadata } from 'next'
import Maker from './Maker'

export const metadata: Metadata = { title: 'Turn a job posting into a video ad · MONTERO', description: 'Paste a job posting and get a short video ad for Instagram and Facebook. Your first one is free.' }

export default function Page() { return <Maker mode="make" /> }
