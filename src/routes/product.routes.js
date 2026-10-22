import { Router } from 'express'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js'
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js'

const router = Router()

// Public reads — storefront. Admin reads are the same handler; it switches
// behavior based on req.user.role (admins see drafts/archived too), which
// is why we run optionalAuth here.
router.get('/', optionalAuth, listProducts)
router.get('/:idOrHandle', optionalAuth, getProduct)

// Admin writes
router.post('/', requireAuth, requireRole('admin'), createProduct)
router.patch('/:id', requireAuth, requireRole('admin'), updateProduct)
router.delete('/:id', requireAuth, requireRole('admin'), deleteProduct)

export default router
