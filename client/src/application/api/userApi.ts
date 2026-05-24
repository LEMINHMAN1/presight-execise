import type { PagedResult, UserFacets, UserFilter, UserSort } from '../../domain/user/types'

function toParams(filter: UserFilter, sort: UserSort, page: number, limit: number): URLSearchParams {
  const p = new URLSearchParams()
  if (filter.search) p.set('search', filter.search)
  if (filter.nationalities.length) p.set('nationalities', filter.nationalities.join(','))
  if (filter.hobbies.length) p.set('hobbies', filter.hobbies.join(','))
  p.set('sortField', sort.field)
  p.set('sortDir', sort.direction)
  p.set('page', String(page))
  p.set('limit', String(limit))
  return p
}

function toFacetParams(filter: UserFilter, sort: UserSort): URLSearchParams {
  const p = new URLSearchParams()
  if (filter.search) p.set('search', filter.search)
  if (filter.nationalities.length) p.set('nationalities', filter.nationalities.join(','))
  if (filter.hobbies.length) p.set('hobbies', filter.hobbies.join(','))
  p.set('sortField', sort.field)
  p.set('sortDir', sort.direction)
  return p
}

export async function fetchUsers(
  filter: UserFilter,
  sort: UserSort,
  page: number,
  limit = 20
): Promise<PagedResult> {
  const res = await fetch(`/api/users?${toParams(filter, sort, page, limit)}`)
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`)
  return res.json()
}

export async function fetchFacets(filter: UserFilter, sort: UserSort): Promise<UserFacets> {
  const res = await fetch(`/api/facets?${toFacetParams(filter, sort)}`)
  if (!res.ok) throw new Error(`Failed to fetch facets: ${res.statusText}`)
  return res.json()
}
