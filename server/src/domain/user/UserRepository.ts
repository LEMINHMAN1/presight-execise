import type { User } from './User'

export interface UserFilter {
  search: string
  nationalities: string[]
  hobbies: string[]
}

export type SortField = 'first_name' | 'last_name' | 'age' | 'nationality'
export type SortDirection = 'asc' | 'desc'

export interface UserSort {
  field: SortField
  direction: SortDirection
}

export interface Pagination {
  page: number
  limit: number
}

export interface PagedResult {
  data: User[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface FacetItem {
  value: string
  count: number
}

export interface UserFacets {
  nationalities: FacetItem[]
  hobbies: FacetItem[]
}

export interface IUserRepository {
  findMany(filter: UserFilter, sort: UserSort, pagination: Pagination): PagedResult
  getFacets(filter: UserFilter): UserFacets
}
