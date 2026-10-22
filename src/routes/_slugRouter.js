import { Router } from 'express'
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js'

// Public reads with optionalAuth (so admins see hidden rows) + admin-only writes.
// All slug-id resources share this shape.
export function slugRouter(handlers) {
  const router = Router()
  router.get('/', optionalAuth, handlers.list)
  router.get('/:id', optionalAuth, handlers.get)
  router.post('/', requireAuth, requireRole('admin'), handlers.create)
  router.patch('/:id', requireAuth, requireRole('admin'), handlers.update)
  router.delete('/:id', requireAuth, requireRole('admin'), handlers.remove)
  return router
}
