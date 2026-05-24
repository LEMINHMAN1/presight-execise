'use client'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { SortDirection, SortField, UserFilter, UserSort } from '../../domain/user/types'

const VALID_SORT_FIELDS: SortField[] = ['first_name', 'last_name', 'age', 'nationality']

export interface UrlState {
  filter: UserFilter
  sort: UserSort
}

export function useUrlState() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const state: UrlState = {
    filter: {
      search: searchParams.get('search') ?? '',
      nationalities: searchParams.get('nationalities')?.split(',').filter(Boolean) ?? [],
      hobbies: searchParams.get('hobbies')?.split(',').filter(Boolean) ?? [],
    },
    sort: {
      field: (VALID_SORT_FIELDS.includes(searchParams.get('sortField') as SortField)
        ? searchParams.get('sortField')
        : 'first_name') as SortField,
      direction: (searchParams.get('sortDir') === 'desc' ? 'desc' : 'asc') as SortDirection,
    },
  }

  function setState(updates: Partial<UrlState>) {
    const next = {
      filter: { ...state.filter, ...updates.filter },
      sort: { ...state.sort, ...updates.sort },
    }
    const p = new URLSearchParams()
    if (next.filter.search) p.set('search', next.filter.search)
    if (next.filter.nationalities.length) p.set('nationalities', next.filter.nationalities.join(','))
    if (next.filter.hobbies.length) p.set('hobbies', next.filter.hobbies.join(','))
    if (next.sort.field !== 'first_name') p.set('sortField', next.sort.field)
    if (next.sort.direction !== 'asc') p.set('sortDir', next.sort.direction)
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return { state, setState }
}
