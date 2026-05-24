import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { applySchema } from './infrastructure/database/schema'
import { SqliteUserRepository } from './infrastructure/database/SqliteUserRepository'
import { GetUsersUseCase } from './application/user/GetUsersUseCase'
import { GetFacetsUseCase } from './application/user/GetFacetsUseCase'
import { UserController } from './interface/http/UserController'
import { createRouter } from './interface/http/routes'

const PORT = parseInt(process.env.PORT ?? '3001', 10)
const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'users.db')

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

const db = new Database(DB_PATH)
applySchema(db)

const repo = new SqliteUserRepository(db)
const controller = new UserController(
  new GetUsersUseCase(repo),
  new GetFacetsUseCase(repo)
)

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', createRouter(controller))

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
