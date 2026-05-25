import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { applySchema } from './schema'
import { SqliteUserRepository } from './SqliteUserRepository'
import type { UserFilter, UserSort, Pagination } from '../../domain/user/UserRepository'

function createDb() {
  const db = new Database(':memory:')
  applySchema(db)

  const insertUser = db.prepare(
    `INSERT INTO users (avatar, first_name, last_name, age, nationality) VALUES (?, ?, ?, ?, ?)`
  )
  const insertHobby = db.prepare(`INSERT INTO user_hobbies (user_id, hobby) VALUES (?, ?)`)

  // id=1: Alice Anderson, US, Gaming + Reading
  insertUser.run('a1', 'Alice', 'Anderson', 25, 'US')
  insertHobby.run(1, 'Gaming')
  insertHobby.run(1, 'Reading')

  // id=2: Bob Brown, UK, Reading
  insertUser.run('a2', 'Bob', 'Brown', 30, 'UK')
  insertHobby.run(2, 'Reading')

  // id=3: Charlie Clark, US, Gaming
  insertUser.run('a3', 'Charlie', 'Clark', 22, 'US')
  insertHobby.run(3, 'Gaming')

  // id=4: Diana Diaz, DE, (no hobbies)
  insertUser.run('a4', 'Diana', 'Diaz', 28, 'DE')

  return db
}

const defaultSort: UserSort = { field: 'first_name', direction: 'asc' }
const page1: Pagination = { page: 1, limit: 20 }
const noFilter: UserFilter = { search: '', nationalities: [], hobbies: [] }

describe('SqliteUserRepository', () => {
  let repo: SqliteUserRepository

  beforeEach(() => {
    repo = new SqliteUserRepository(createDb())
  })

  describe('findMany – no filter', () => {
    it('returns all users', () => {
      const result = repo.findMany(noFilter, defaultSort, page1)
      expect(result.total).toBe(4)
      expect(result.data).toHaveLength(4)
    })

    it('parses hobbies as array', () => {
      const result = repo.findMany(noFilter, defaultSort, page1)
      const alice = result.data.find(u => u.first_name === 'Alice')!
      expect(alice.hobbies).toEqual(expect.arrayContaining(['Gaming', 'Reading']))
    })

    it('returns empty hobbies array for user with no hobbies', () => {
      const result = repo.findMany(noFilter, defaultSort, page1)
      const diana = result.data.find(u => u.first_name === 'Diana')!
      expect(diana.hobbies).toEqual([])
    })
  })

  describe('findMany – search', () => {
    it('matches first_name', () => {
      const result = repo.findMany({ ...noFilter, search: 'alice' }, defaultSort, page1)
      expect(result.total).toBe(1)
      expect(result.data[0].first_name).toBe('Alice')
    })

    it('matches last_name', () => {
      const result = repo.findMany({ ...noFilter, search: 'brown' }, defaultSort, page1)
      expect(result.total).toBe(1)
      expect(result.data[0].last_name).toBe('Brown')
    })

    it('is case-insensitive', () => {
      const result = repo.findMany({ ...noFilter, search: 'CLARK' }, defaultSort, page1)
      expect(result.total).toBe(1)
    })

    it('returns empty when no match', () => {
      const result = repo.findMany({ ...noFilter, search: 'xyz_no_match' }, defaultSort, page1)
      expect(result.total).toBe(0)
    })
  })

  describe('findMany – nationality filter (OR)', () => {
    it('filters by single nationality', () => {
      const result = repo.findMany({ ...noFilter, nationalities: ['US'] }, defaultSort, page1)
      expect(result.total).toBe(2)
      result.data.forEach(u => expect(u.nationality).toBe('US'))
    })

    it('filters by multiple nationalities (OR)', () => {
      const result = repo.findMany({ ...noFilter, nationalities: ['US', 'UK'] }, defaultSort, page1)
      expect(result.total).toBe(3)
    })

    it('returns empty for unknown nationality', () => {
      const result = repo.findMany({ ...noFilter, nationalities: ['XX'] }, defaultSort, page1)
      expect(result.total).toBe(0)
    })
  })

  describe('findMany – hobby filter (AND)', () => {
    it('filters by single hobby', () => {
      const result = repo.findMany({ ...noFilter, hobbies: ['Gaming'] }, defaultSort, page1)
      expect(result.total).toBe(2) // Alice + Charlie
    })

    it('requires ALL hobbies (AND semantics)', () => {
      const result = repo.findMany({ ...noFilter, hobbies: ['Gaming', 'Reading'] }, defaultSort, page1)
      expect(result.total).toBe(1) // only Alice has both
      expect(result.data[0].first_name).toBe('Alice')
    })

    it('returns empty when no user has all hobbies', () => {
      const result = repo.findMany({ ...noFilter, hobbies: ['Gaming', 'Reading', 'Cooking'] }, defaultSort, page1)
      expect(result.total).toBe(0)
    })
  })

  describe('findMany – combined filters', () => {
    it('combines search + nationality', () => {
      const result = repo.findMany({ search: 'alice', nationalities: ['US'], hobbies: [] }, defaultSort, page1)
      expect(result.total).toBe(1)
      expect(result.data[0].first_name).toBe('Alice')
    })

    it('combines nationality + hobby', () => {
      const result = repo.findMany({ ...noFilter, nationalities: ['US'], hobbies: ['Gaming'] }, defaultSort, page1)
      expect(result.total).toBe(2) // Alice + Charlie (both US + Gaming)
    })
  })

  describe('findMany – sort', () => {
    it('sorts by first_name asc', () => {
      const result = repo.findMany(noFilter, { field: 'first_name', direction: 'asc' }, page1)
      const names = result.data.map(u => u.first_name)
      expect(names).toEqual([...names].sort())
    })

    it('sorts by age desc', () => {
      const result = repo.findMany(noFilter, { field: 'age', direction: 'desc' }, page1)
      const ages = result.data.map(u => u.age)
      expect(ages[0]).toBeGreaterThanOrEqual(ages[ages.length - 1])
    })
  })

  describe('findMany – pagination', () => {
    it('respects limit', () => {
      const result = repo.findMany(noFilter, defaultSort, { page: 1, limit: 2 })
      expect(result.data).toHaveLength(2)
      expect(result.hasMore).toBe(true)
    })

    it('returns correct page 2', () => {
      const p1 = repo.findMany(noFilter, defaultSort, { page: 1, limit: 2 })
      const p2 = repo.findMany(noFilter, defaultSort, { page: 2, limit: 2 })
      const ids1 = p1.data.map(u => u.id)
      const ids2 = p2.data.map(u => u.id)
      expect(ids1).not.toEqual(ids2)
      expect(p2.hasMore).toBe(false)
    })

    it('hasMore is false on last page', () => {
      const result = repo.findMany(noFilter, defaultSort, { page: 1, limit: 100 })
      expect(result.hasMore).toBe(false)
    })
  })

  describe('getFacets', () => {
    it('returns nationality facets with counts', () => {
      const facets = repo.getFacets(noFilter)
      const us = facets.nationalities.find(f => f.value === 'US')
      expect(us?.count).toBe(2)
    })

    it('returns hobby facets with counts', () => {
      const facets = repo.getFacets(noFilter)
      const gaming = facets.hobbies.find(f => f.value === 'Gaming')
      const reading = facets.hobbies.find(f => f.value === 'Reading')
      expect(gaming?.count).toBe(2)
      expect(reading?.count).toBe(2)
    })

    it('orders nationalities by count desc', () => {
      const facets = repo.getFacets(noFilter)
      const counts = facets.nationalities.map(f => f.count)
      expect(counts).toEqual([...counts].sort((a, b) => b - a))
    })

    it('nationality facets ignore nationality filter', () => {
      // nationality filter excluded → all nationalities visible even when UK is selected
      const facets = repo.getFacets({ ...noFilter, nationalities: ['UK'] })
      expect(facets.nationalities.find(f => f.value === 'US')).toBeDefined()
      expect(facets.nationalities.find(f => f.value === 'UK')).toBeDefined()
      expect(facets.nationalities.find(f => f.value === 'DE')).toBeDefined()
    })

    it('hobby facets ignore hobby filter', () => {
      // hobby filter excluded → all hobbies visible even when Gaming is selected
      const facets = repo.getFacets({ ...noFilter, hobbies: ['Gaming'] })
      expect(facets.hobbies.find(f => f.value === 'Gaming')).toBeDefined()
      expect(facets.hobbies.find(f => f.value === 'Reading')).toBeDefined()
    })
  })
})
