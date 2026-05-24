'use client'
import type { User } from '../../domain/user/types'

interface Props {
  user: User
}

export function UserCard({ user }: Props) {
  const visible = user.hobbies.slice(0, 2)
  const extra = user.hobbies.length - 2

  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <img
        src={user.avatar}
        alt={`${user.first_name} ${user.last_name}`}
        className="w-12 h-12 rounded-full object-cover shrink-0 bg-gray-100"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-semibold text-gray-900 truncate">
            {user.first_name} {user.last_name}
          </p>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mt-0.5">
          <span>{user.nationality}</span>
          <span className="font-medium">{user.age}y</span>
        </div>
        {visible.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {visible.map(h => (
              <span key={h} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                {h}
              </span>
            ))}
            {extra > 0 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{extra}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
