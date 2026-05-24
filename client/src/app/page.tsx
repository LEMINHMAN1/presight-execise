import { Suspense } from 'react'
import { DirectoryPage } from '../interface/pages/DirectoryPage'

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>}>
      <DirectoryPage />
    </Suspense>
  )
}
