'use client'
import { useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { User } from '../../domain/user/types'
import { UserCard, UserCardSkeleton } from './UserCard'

interface Props {
  users: User[]
  hasMore: boolean
  isLoading: boolean
  error: string | null
  onLoadMore: () => void
}

export function VirtualList({ users, hasMore, isLoading, error, onLoadMore }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 68,
    overscan: 3,
  })

  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = parentRef.current
    if (!sentinel || !container) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !isLoading) onLoadMore() },
      { root: container, threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoading, onLoadMore])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-300">Request failed</p>
          <p className="text-xs text-zinc-600 mt-0.5">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-400">No results</p>
          <p className="text-xs text-zinc-600 mt-0.5">Try adjusting your search or filters</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative">
        {rowVirtualizer.getVirtualItems().map(row => (
          <div
            key={row.key}
            data-index={row.index}
            ref={rowVirtualizer.measureElement}
            style={{ transform: `translateY(${row.start}px)` }}
            className="absolute top-0 left-0 w-full py-0.5"
          >
            <UserCard user={users[row.index]} />
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-0.5 py-0.5">
          {Array.from({ length: 5 }).map((_, i) => <UserCardSkeleton key={i} />)}
        </div>
      )}

      {hasMore && !isLoading && <div ref={sentinelRef} className="h-1" />}
    </div>
  )
}
