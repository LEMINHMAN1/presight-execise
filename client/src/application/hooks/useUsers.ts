'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchUsers } from '../api/userApi'
import type { User, UserFilter, UserSort } from '../../domain/user/types'

const PAGE_SIZE = 20

function filterKey(filter: UserFilter, sort: UserSort): string {
  return [
    filter.search,
    [...filter.nationalities].sort().join(','),
    [...filter.hobbies].sort().join(','),
    sort.field,
    sort.direction,
  ].join('|')
}

export function useUsers(filter: UserFilter, sort: UserSort) {
  const [users, setUsers] = useState<User[]>([])
  const [nextPage, setNextPage] = useState(2)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const key = filterKey(filter, sort)
  const prevKey = useRef(key)
  const loading = useRef(false)

  // Reset and fetch page 1 whenever filter/sort changes
  useEffect(() => {
    prevKey.current = key
    let cancelled = false

    setUsers([])
    setNextPage(2)
    setHasMore(true)
    setError(null)
    setIsLoading(true)

    fetchUsers(filter, sort, 1, PAGE_SIZE)
      .then(res => {
        if (cancelled) return
        setUsers(res.data)
        setHasMore(res.hasMore)
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load users')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const loadMore = useCallback(() => {
    if (loading.current || !hasMore) return
    loading.current = true
    setIsLoading(true)

    fetchUsers(filter, sort, nextPage, PAGE_SIZE)
      .then(res => {
        setUsers(prev => [...prev, ...res.data])
        setNextPage(p => p + 1)
        setHasMore(res.hasMore)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load more'))
      .finally(() => {
        loading.current = false
        setIsLoading(false)
      })
  }, [filter, sort, nextPage, hasMore])

  return { users, hasMore, isLoading, error, loadMore }
}
