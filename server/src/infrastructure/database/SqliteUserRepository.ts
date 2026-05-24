import Database from 'better-sqlite3'
import type { User } from '../../domain/user/User'
import type {
  IUserRepository,
  UserFilter,
  UserSort,
  Pagination,
  PagedResult,
  UserFacets,
  FacetItem,
} from '../../domain/user/UserRepository'

type DbRow = Omit<User, 'hobbies'> & { hobbies: string | null }

const VALID_SORT_FIELDS = new Set(['first_name', 'last_name', 'age', 'nationality'])

function buildWhere(filter: UserFilter): { sql: string; params: unknown[] } {
  const conds: string[] = []
  const params: unknown[] = []

  if (filter.search) {
    conds.push('(u.first_name LIKE ? OR u.last_name LIKE ?)')
    const like = `%${filter.search}%`
    params.push(like, like)
  }

  if (filter.nationalities.length > 0) {
    conds.push(`u.nationality IN (${filter.nationalities.map(() => '?').join(',')})`)
    params.push(...filter.nationalities)
  }

  if (filter.hobbies.length > 0) {
    const ph = filter.hobbies.map(() => '?').join(',')
    conds.push(`u.id IN (
      SELECT user_id FROM user_hobbies
      WHERE hobby IN (${ph})
      GROUP BY user_id
      HAVING COUNT(DISTINCT hobby) = ?
    )`)
    params.push(...filter.hobbies, filter.hobbies.length)
  }

  return {
    sql: conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '',
    params,
  }
}

function run<T>(db: Database.Database, sql: string, params: unknown[]): T[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.prepare(sql) as any).all(...params) as T[]
}

function runOne<T>(db: Database.Database, sql: string, params: unknown[]): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.prepare(sql) as any).get(...params) as T
}

export class SqliteUserRepository implements IUserRepository {
  constructor(private db: Database.Database) {}

  findMany(filter: UserFilter, sort: UserSort, pagination: Pagination): PagedResult {
    const { sql: where, params } = buildWhere(filter)
    const field = VALID_SORT_FIELDS.has(sort.field) ? sort.field : 'first_name'
    const dir = sort.direction === 'desc' ? 'DESC' : 'ASC'
    const offset = (pagination.page - 1) * pagination.limit

    const { total } = runOne<{ total: number }>(
      this.db,
      `SELECT COUNT(DISTINCT u.id) as total FROM users u ${where}`,
      params
    )

    const rows = run<DbRow>(
      this.db,
      `SELECT u.id, u.avatar, u.first_name, u.last_name, u.age, u.nationality,
         GROUP_CONCAT(h.hobby, '|') as hobbies
       FROM users u
       LEFT JOIN user_hobbies h ON h.user_id = u.id
       ${where}
       GROUP BY u.id
       ORDER BY u.${field} ${dir}, u.id ${dir}
       LIMIT ? OFFSET ?`,
      [...params, pagination.limit, offset]
    )

    return {
      data: rows.map(r => ({ ...r, hobbies: r.hobbies ? r.hobbies.split('|') : [] })),
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: offset + rows.length < total,
    }
  }

  getFacets(filter: UserFilter): UserFacets {
    const { sql: where, params } = buildWhere(filter)

    const nationalities = run<FacetItem>(
      this.db,
      `SELECT u.nationality as value, COUNT(DISTINCT u.id) as count
       FROM users u ${where}
       GROUP BY u.nationality
       ORDER BY count DESC
       LIMIT 20`,
      params
    )

    const hobbies = run<FacetItem>(
      this.db,
      `SELECT h.hobby as value, COUNT(DISTINCT h.user_id) as count
       FROM user_hobbies h
       JOIN users u ON h.user_id = u.id
       ${where}
       GROUP BY h.hobby
       ORDER BY count DESC
       LIMIT 20`,
      params
    )

    return { nationalities, hobbies }
  }
}
