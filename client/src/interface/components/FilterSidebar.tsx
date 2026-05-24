'use client'
import { useState } from 'react'
import type { FacetItem } from '../../domain/user/types'

interface Props {
  nationalities: FacetItem[]
  hobbies: FacetItem[]
  selectedNationalities: string[]
  selectedHobbies: string[]
  onNationalityToggle: (v: string) => void
  onHobbyToggle: (v: string) => void
  isLoading: boolean
  onClearAll: () => void
}

function FacetGroup({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string
  items: FacetItem[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      {/* Header — collapsible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-zinc-800/40 transition-colors group"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
            {title}
          </span>
          {items.length > 0 && (
            <span className="text-[10px] tabular-nums text-zinc-600">
              {selected.length > 0 ? (
                <span className="text-violet-400">{selected.length}/</span>
              ) : null}
              {items.length}
            </span>
          )}
        </div>
        <svg
          className={`w-3 h-3 text-zinc-600 transition-transform duration-150 ${open ? 'rotate-0' : '-rotate-90'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Items */}
      {open && (
        <ul className="mt-0.5">
          {items.length === 0 ? (
            <li className="px-2 py-1 text-xs text-zinc-700 italic">No results</li>
          ) : (
            items.map(item => {
              const active = selected.includes(item.value)
              return (
                <li key={item.value}>
                  <button
                    onClick={() => onToggle(item.value)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${active
                      ? 'text-violet-400 bg-violet-500/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                      }`}
                  >
                    <span className="truncate">{item.value}</span>
                    <span className={`tabular-nums ml-2 shrink-0 text-[11px] ${active ? 'text-violet-500' : 'text-zinc-600'
                      }`}>
                      {item.count}
                    </span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}

export function FilterSidebar({
  nationalities,
  hobbies,
  selectedNationalities,
  selectedHobbies,
  onNationalityToggle,
  onHobbyToggle,
  isLoading,
  onClearAll
}: Props) {
  const hasActive = selectedNationalities.length > 0 || selectedHobbies.length > 0

  return (
    <aside className="flex flex-col gap-3">
      <div className="hidden md:flex items-center justify-between px-2">
        <span className="text-xs font-medium text-zinc-300">Filters</span>
        {hasActive && (
          <button
            onClick={() => { onClearAll() }}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex gap-1 px-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}

      <FacetGroup
        title="Nationality"
        items={nationalities}
        selected={selectedNationalities}
        onToggle={onNationalityToggle}
      />

      <div className="h-px bg-zinc-800/60 mx-2" />

      <FacetGroup
        title="Hobbies"
        items={hobbies}
        selected={selectedHobbies}
        onToggle={onHobbyToggle}
      />
    </aside>
  )
}
