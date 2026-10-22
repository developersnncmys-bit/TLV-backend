import { Router } from 'express'
import { getHouseContent, updateHouseContent } from '../controllers/houseContent.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

// Singleton — no list / no :id. GET is always the one row (seeded if
// missing), PATCH upserts it.
const router = Router()
router.get('/', getHouseContent)
router.patch('/', requireAuth, requireRole('admin'), updateHouseContent)

export default router
