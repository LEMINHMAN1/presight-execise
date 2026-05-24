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
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  const activeFilterCount = state.filter.nationalities.length + state.filter.hobbies.length

  return (
    <div className="flex flex-col h-screen bg-zinc-950">

      {/* ── Header ── */}
      <header className="shrink-0 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-2.5 space-y-2">

          {/* Row 1 */}
          <div className="flex items-center gap-3">
            {/* Wordmark */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-zinc-200 hidden sm:inline tracking-tight">
                Directory
              </span>
            </div>

            <div className="flex-1">
              <SearchInput value={searchInput} onChange={setSearchInput} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <SortControls
                field={state.sort.field}
                direction={state.sort.direction}
                onFieldChange={f => setState({ sort: { ...state.sort, field: f as SortField } })}
                onDirectionChange={d => setState({ sort: { ...state.sort, direction: d as SortDirection } })}
              />
              {/* Active chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {state.filter.nationalities.map(v => (
                    <button
                      key={v}
                      onClick={() => toggleNationality(v)}
                      className="flex items-center gap-1 pl-2 pr-1.5 py-0.5 bg-violet-500/10 text-violet-400 text-[11px] font-medium rounded-md border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
                    >
                      {v} <span className="opacity-60 text-[10px]">✕</span>
                    </button>
                  ))}
                  {state.filter.hobbies.map(v => (
                    <button
                      key={v}
                      onClick={() => toggleHobby(v)}
                      className="flex items-center gap-1 pl-2 pr-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[11px] font-medium rounded-md border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                    >
                      {v} <span className="opacity-60 text-[10px]">✕</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter button — mobile */}
            <button
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors shrink-0"
              onClick={() => setDrawerOpen(true)}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M10 12h4" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center bg-violet-600 text-white text-[10px] font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden max-w-4xl w-full mx-auto px-4 py-3 gap-4">

        {/* Sidebar — desktop */}
        <div className="hidden md:block w-48 shrink-0 overflow-y-auto pt-1">
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

        {/* Divider */}
        <div className="hidden md:block w-px bg-zinc-800/60 shrink-0" />

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

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col md:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
              <span className="text-sm font-medium text-zinc-200">Filters</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors text-xs"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
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
            {activeFilterCount > 0 && (
              <div className="px-3 py-3 border-t border-zinc-800 shrink-0">
                <button
                  onClick={() => {
                    state.filter.nationalities.forEach(toggleNationality)
                    state.filter.hobbies.forEach(toggleHobby)
                  }}
                  className="w-full py-2 text-xs font-medium text-zinc-500 border border-zinc-800 rounded-lg hover:border-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
