import type { Metadata } from 'next'
import { StudioNav } from '@/components/studio/StudioNav'

export const metadata: Metadata = { title: 'Studio · VidVerse' }

// creator studio shell; /studio is protected in src/proxy.ts
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg pt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Studio</h1>
        <p className="mt-1 text-sm text-fg-secondary">Upload, manage and track your videos.</p>
        <div className="mt-6">
          <StudioNav />
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
