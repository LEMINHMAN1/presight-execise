import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import { UserController } from './UserController'
import type { GetUsersUseCase } from '../../application/user/GetUsersUseCase'
import type { GetFacetsUseCase } from '../../application/user/GetFacetsUseCase'

function mockRes() {
  const res = { json: vi.fn() } as unknown as Response
  return res
}

function mockReq(query: Record<string, string> = {}): Request {
  return { query } as unknown as Request
}

const pagedResult = { data: [], total: 0, page: 1, limit: 20, hasMore: false }
const facetsResult = { nationalities: [], hobbies: [] }

function makeController() {
  const getUsers = { execute: vi.fn().mockReturnValue(pagedResult) } as unknown as GetUsersUseCase
  const getFacets = { execute: vi.fn().mockReturnValue(facetsResult) } as unknown as GetFacetsUseCase
  const ctrl = new UserController(getUsers, getFacets)
  return { ctrl, getUsers, getFacets }
}

describe('UserController – listUsers', () => {
  it('passes empty filter when no query params', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq(), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      { search: '', nationalities: [], hobbies: [] },
      { field: 'first_name', direction: 'asc' },
      { page: 1, limit: 20 }
    )
  })

  it('parses search param', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq({ search: 'alice' }), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'alice' }),
      expect.anything(),
      expect.anything()
    )
  })

  it('parses comma-separated nationalities', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq({ nationalities: 'US,UK' }), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      expect.objectContaining({ nationalities: ['US', 'UK'] }),
      expect.anything(),
      expect.anything()
    )
  })

  it('parses comma-separated hobbies', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq({ hobbies: 'Gaming,Reading' }), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      expect.objectContaining({ hobbies: ['Gaming', 'Reading'] }),
      expect.anything(),
      expect.anything()
    )
  })

  it('ignores empty comma parts', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq({ nationalities: 'US,,UK' }), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      expect.objectContaining({ nationalities: ['US', 'UK'] }),
      expect.anything(),
      expect.anything()
    )
  })

  it('defaults to first_name asc sort', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq(), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      expect.anything(),
      { field: 'first_name', direction: 'asc' },
      expect.anything()
    )
  })

  it('accepts valid sort field and direction', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq({ sortField: 'age', sortDir: 'desc' }), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      expect.anything(),
      { field: 'age', direction: 'desc' },
      expect.anything()
    )
  })

  it('rejects invalid sort field, falls back to first_name', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq({ sortField: 'DROP TABLE users' }), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ field: 'first_name' }),
      expect.anything()
    )
  })

  it('clamps page to minimum 1', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq({ page: '0' }), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ page: 1 })
    )
  })

  it('clamps limit to maximum 100', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq({ limit: '9999' }), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ limit: 100 })
    )
  })

  it('clamps limit to minimum 1', () => {
    const { ctrl, getUsers } = makeController()
    ctrl.listUsers(mockReq({ limit: '0' }), mockRes())
    expect(getUsers.execute).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ limit: 1 })
    )
  })

  it('responds with json from use case', () => {
    const { ctrl } = makeController()
    const res = mockRes()
    ctrl.listUsers(mockReq(), res)
    expect(res.json).toHaveBeenCalledWith(pagedResult)
  })
})

describe('UserController – listFacets', () => {
  it('passes filter to use case', () => {
    const { ctrl, getFacets } = makeController()
    ctrl.listFacets(mockReq({ search: 'bob', nationalities: 'US' }), mockRes())
    expect(getFacets.execute).toHaveBeenCalledWith(
      { search: 'bob', nationalities: ['US'], hobbies: [] }
    )
  })

  it('responds with json from use case', () => {
    const { ctrl } = makeController()
    const res = mockRes()
    ctrl.listFacets(mockReq(), res)
    expect(res.json).toHaveBeenCalledWith(facetsResult)
  })
})
