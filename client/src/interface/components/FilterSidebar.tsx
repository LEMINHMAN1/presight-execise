'use client'
import type { FacetItem } from '../../domain/user/types'

interface Props {
  nationalities: FacetItem[]
  hobbies: FacetItem[]
  selectedNationalities: string[]
  selectedHobbies: string[]
  onNationalityToggle: (v: string) => void
  onHobbyToggle: (v: string) => void
  isLoading: boolean
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
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No results</p>
      ) : (
        <ul className="space-y-1">
          {items.map(item => {
            const active = selected.includes(item.value)
            return (
              <li key={item.value}>
                <button
                  onClick={() => onToggle(item.value)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{item.value}</span>
                  <span className={`text-xs ml-2 shrink-0 ${active ? 'text-blue-500' : 'text-gray-400'}`}>
                    {item.count}
                  </span>
                </button>
              </li>
            )
          })}
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
}: Props) {
  const hasActive = selectedNationalities.length > 0 || selectedHobbies.length > 0

  return (
    <aside className="flex flex-col gap-6 h-full overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Filters</h2>
        {hasActive && (
          <button
            onClick={() => {
              selectedNationalities.forEach(onNationalityToggle)
              selectedHobbies.forEach(onHobbyToggle)
            }}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-xs text-gray-400 animate-pulse">Updating…</div>
      )}

      <FacetGroup
        title="Nationality"
        items={nationalities}
        selected={selectedNationalities}
        onToggle={onNationalityToggle}
      />

      <FacetGroup
        title="Hobbies"
        items={hobbies}
        selected={selectedHobbies}
        onToggle={onHobbyToggle}
      />
    </aside>
  )
}
