'use client'
import { useEffect, useState } from 'react'
import { fetchFacets } from '../api/userApi'
import type { UserFacets, UserFilter, UserSort } from '../../domain/user/types'

export function useFacets(filter: UserFilter, sort: UserSort) {
  const [facets, setFacets] = useState<UserFacets>({ nationalities: [], hobbies: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    fetchFacets(filter, sort)
      .then(data => {
        if (!cancelled) setFacets(data)
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load facets')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter.search,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...filter.nationalities].sort().join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...filter.hobbies].sort().join(','),
    sort.field,
    sort.direction,
  ])

  return { facets, isLoading, error }
}
