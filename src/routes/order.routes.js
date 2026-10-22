import { Router } from 'express'
import {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  cancelMyOrder,
  deleteOrder,
} from '../controllers/order.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// All order endpoints require auth. Customers see only their own.
router.get('/', requireAuth, listOrders)
router.get('/:id', requireAuth, getOrder)
router.post('/', requireAuth, createOrder)
router.post('/:id/cancel', requireAuth, cancelMyOrder)

// Admin-only mutations
router.patch('/:id', requireAuth, requireRole('admin'), updateOrder)
router.delete('/:id', requireAuth, requireRole('admin'), deleteOrder)

export default router
