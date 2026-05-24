'use client'
import type { User } from '../../domain/user/types'

interface Props { user: User }

export function UserCard({ user }: Props) {
  const visible = user.hobbies.slice(0, 2)
  const extra = user.hobbies.length - 2

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors duration-100">
      <img
        src={user.avatar}
        alt=""
        loading="lazy"
        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-zinc-800"
      />
      <div className="flex-1 min-w-0">
        {/* Row 1: name + age */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-zinc-100 truncate leading-none">
            {user.first_name} {user.last_name}
          </span>
          <span className="text-xs text-zinc-600 tabular-nums shrink-0">{user.age}y</span>
        </div>
        {/* Row 2: nationality */}
        <p className="text-xs text-zinc-500 mt-0.5 truncate">{user.nationality}</p>

        {/* Row 3: hobbies */}
        {visible.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {visible.map(h => (
              <span key={h} className="px-1.5 py-px bg-violet-500/10 text-violet-400 text-[11px] rounded border border-violet-500/15">
                {h}
              </span>
            ))}
            {extra > 0 && (
              <span className="px-1.5 py-px bg-zinc-800 text-zinc-500 text-[11px] rounded">
                +{extra}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
      <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 bg-zinc-800 rounded animate-pulse w-28" />
          <div className="h-2.5 bg-zinc-800 rounded animate-pulse w-5" />
        </div>
        <div className="h-2.5 bg-zinc-800 rounded animate-pulse w-16" />
        <div className="flex gap-1 mt-0.5">
          <div className="h-4 bg-zinc-800 rounded animate-pulse w-12" />
          <div className="h-4 bg-zinc-800 rounded animate-pulse w-14" />
        </div>
      </div>
    </div>
  )
}
