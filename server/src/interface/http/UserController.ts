import type { Request, Response } from 'express'
import type { GetUsersUseCase } from '../../application/user/GetUsersUseCase'
import type { GetFacetsUseCase } from '../../application/user/GetFacetsUseCase'
import type { SortField, SortDirection } from '../../domain/user/UserRepository'

const VALID_SORT_FIELDS = new Set<string>(['first_name', 'last_name', 'age', 'nationality'])

function str(q: Request['query'], key: string): string {
  const v = q[key]
  return typeof v === 'string' ? v.trim() : ''
}

function parseFilter(q: Request['query']) {
  return {
    search: str(q, 'search'),
    nationalities: str(q, 'nationalities').split(',').filter(Boolean),
    hobbies: str(q, 'hobbies').split(',').filter(Boolean),
  }
}

function parseSort(q: Request['query']) {
  const field = str(q, 'sortField')
  const dir = str(q, 'sortDir')
  return {
    field: (VALID_SORT_FIELDS.has(field) ? field : 'first_name') as SortField,
    direction: (dir === 'desc' ? 'desc' : 'asc') as SortDirection,
  }
}

export class UserController {
  constructor(
    private getUsers: GetUsersUseCase,
    private getFacets: GetFacetsUseCase
  ) {}

  listUsers = (req: Request, res: Response): void => {
    const filter = parseFilter(req.query)
    const sort = parseSort(req.query)
    const page = Math.max(1, parseInt(str(req.query, 'page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(str(req.query, 'limit') || '20', 10)))
    res.json(this.getUsers.execute(filter, sort, { page, limit }))
  }

  listFacets = (req: Request, res: Response): void => {
    const filter = parseFilter(req.query)
    res.json(this.getFacets.execute(filter))
  }
}
