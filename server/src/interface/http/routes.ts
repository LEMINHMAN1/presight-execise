import { Router } from 'express'
import type { UserController } from './UserController'

export function createRouter(controller: UserController): Router {
  const router = Router()
  router.get('/users', controller.listUsers)
  router.get('/facets', controller.listFacets)
  return router
}
