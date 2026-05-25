'use client'
import type { SortDirection, SortField } from '../../domain/user/types'

interface Props {
  field: SortField
  direction: SortDirection
  onFieldChange: (f: SortField) => void
  onDirectionChange: (d: SortDirection) => void
}

const FIELDS: { value: SortField; label: string }[] = [
  { value: 'first_name', label: 'First name' },
  { value: 'last_name', label: 'Last name' },
  { value: 'age', label: 'Age' },
  { value: 'nationality', label: 'Nationality' },
]

export function SortControls({ field, direction, onFieldChange, onDirectionChange }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-zinc-600 shrink-0 hidden sm:inline">Sort</span>
      <select
        value={field}
        onChange={e => onFieldChange(e.target.value as SortField)}
        className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5
          focus:outline-none focus:border-zinc-600 cursor-pointer hover:border-zinc-700 transition-colors"
      >
        {FIELDS.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
      <button
        onClick={() => onDirectionChange(direction === 'asc' ? 'desc' : 'asc')}
        title={direction === 'asc' ? 'Ascending' : 'Descending'}
        className="flex items-center justify-center w-7 h-7 bg-zinc-900 border border-zinc-800 rounded-lg
          hover:border-zinc-600 text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {direction === 'asc' ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
    </div>
  )
}
