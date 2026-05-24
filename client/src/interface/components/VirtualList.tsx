'use client'
import { useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { User } from '../../domain/user/types'
import { UserCard } from './UserCard'

interface Props {
  users: User[]
  hasMore: boolean
  isLoading: boolean
  error: string | null
  onLoadMore: () => void
}

export function VirtualList({ users, hasMore, isLoading, error, onLoadMore }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 112,
    overscan: 5,
  })

  const items = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const last = items[items.length - 1]
    if (!last) return
    if (last.index >= users.length - 5 && hasMore && !isLoading) {
      onLoadMore()
    }
  }, [items, users.length, hasMore, isLoading, onLoadMore])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-1">Something went wrong</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-1">No users found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{ height: rowVirtualizer.getTotalSize() }}
        className="relative"
      >
        {items.map(row => (
          <div
            key={row.key}
            data-index={row.index}
            ref={rowVirtualizer.measureElement}
            style={{ transform: `translateY(${row.start}px)` }}
            className="absolute top-0 left-0 w-full px-1 py-1"
          >
            <UserCard user={users[row.index]} />
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="py-4 text-center text-sm text-gray-400 animate-pulse">
          Loading…
        </div>
      )}
    </div>
  )
}
