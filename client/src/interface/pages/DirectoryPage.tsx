'use client'
import { useEffect, useState } from 'react'
import { useUrlState } from '../../application/hooks/useUrlState'
import { useUsers } from '../../application/hooks/useUsers'
import { useFacets } from '../../application/hooks/useFacets'
import { useDebounce } from '../../application/hooks/useDebounce'
import { FilterSidebar } from '../components/FilterSidebar'
import { VirtualList } from '../components/VirtualList'
import { SearchInput } from '../components/SearchInput'
import { SortControls } from '../components/SortControls'
import type { SortDirection, SortField } from '../../domain/user/types'

export function DirectoryPage() {
  const { state, setState } = useUrlState()

  const [searchInput, setSearchInput] = useState(state.filter.search)
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    if (debouncedSearch !== state.filter.search) {
      setState({ filter: { ...state.filter, search: debouncedSearch } })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const { users, hasMore, isLoading, error, loadMore } = useUsers(state.filter, state.sort)
  const { facets, isLoading: facetsLoading } = useFacets(state.filter, state.sort)

  function toggleNationality(value: string) {
    const nationalities = state.filter.nationalities.includes(value)
      ? state.filter.nationalities.filter(v => v !== value)
      : [...state.filter.nationalities, value]
    setState({ filter: { ...state.filter, nationalities } })
  }

  function toggleHobby(value: string) {
    const hobbies = state.filter.hobbies.includes(value)
      ? state.filter.hobbies.filter(v => v !== value)
      : [...state.filter.hobbies, value]
    setState({ filter: { ...state.filter, hobbies } })
  }

  function onSortField(field: SortField) {
    setState({ sort: { ...state.sort, field } })
  }

  function onSortDirection(direction: SortDirection) {
    setState({ sort: { ...state.sort, direction } })
  }

  const activeFilters = [...state.filter.nationalities, ...state.filter.hobbies]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 shrink-0">User Directory</h1>
          <div className="flex-1 max-w-md">
            <SearchInput value={searchInput} onChange={setSearchInput} />
          </div>
          <SortControls
            field={state.sort.field}
            direction={state.sort.direction}
            onFieldChange={onSortField}
            onDirectionChange={onSortDirection}
          />
        </div>
        {activeFilters.length > 0 && (
          <div className="max-w-6xl mx-auto mt-2 flex flex-wrap gap-1.5">
            {state.filter.nationalities.map(v => (
              <span
                key={v}
                className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full cursor-pointer hover:bg-blue-200"
                onClick={() => toggleNationality(v)}
              >
                {v} ✕
              </span>
            ))}
            {state.filter.hobbies.map(v => (
              <span
                key={v}
                className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full cursor-pointer hover:bg-green-200"
                onClick={() => toggleHobby(v)}
              >
                {v} ✕
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden max-w-6xl w-full mx-auto px-4 py-4 gap-4">
        {/* Sidebar */}
        <div className="hidden md:block w-56 shrink-0">
          <FilterSidebar
            nationalities={facets.nationalities}
            hobbies={facets.hobbies}
            selectedNationalities={state.filter.nationalities}
            selectedHobbies={state.filter.hobbies}
            onNationalityToggle={toggleNationality}
            onHobbyToggle={toggleHobby}
            isLoading={facetsLoading}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-hidden">
          <VirtualList
            users={users}
            hasMore={hasMore}
            isLoading={isLoading}
            error={error}
            onLoadMore={loadMore}
          />
        </div>
      </div>
    </div>
  )
}
