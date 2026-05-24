export interface User {
  id: number
  avatar: string
  first_name: string
  last_name: string
  age: number
  nationality: string
  hobbies: string[]
}

export interface FacetItem {
  value: string
  count: number
}

export interface UserFacets {
  nationalities: FacetItem[]
  hobbies: FacetItem[]
}

export interface PagedResult {
  data: User[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export type SortField = 'first_name' | 'last_name' | 'age' | 'nationality'
export type SortDirection = 'asc' | 'desc'

export interface UserFilter {
  search: string
  nationalities: string[]
  hobbies: string[]
}

export interface UserSort {
  field: SortField
  direction: SortDirection
}
