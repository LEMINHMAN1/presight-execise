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
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 shrink-0">Sort by</span>
      <select
        value={field}
        onChange={e => onFieldChange(e.target.value as SortField)}
        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {FIELDS.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
      <button
        onClick={() => onDirectionChange(direction === 'asc' ? 'desc' : 'asc')}
        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-sm"
        title={direction === 'asc' ? 'Ascending' : 'Descending'}
      >
        {direction === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  )
}
