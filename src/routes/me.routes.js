import { Router } from 'express'
import {
  listAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/me.controller.js'
import { requireAuth } from '../middleware/auth.js'

// All /me endpoints require an authenticated user.
const router = Router()
router.use(requireAuth)

router.get('/addresses', listAddresses)
router.post('/addresses', addAddress)
router.patch('/addresses/:id', updateAddress)
router.delete('/addresses/:id', removeAddress)

router.get('/wishlist', getWishlist)
router.post('/wishlist', addToWishlist)
router.delete('/wishlist/:handle', removeFromWishlist)

export default router
