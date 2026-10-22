import { Router } from 'express'
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js'
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', optionalAuth, listCategories)
router.get('/:id', optionalAuth, getCategory)

router.post('/', requireAuth, requireRole('admin'), createCategory)
router.patch('/:id', requireAuth, requireRole('admin'), updateCategory)
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory)

export default router
