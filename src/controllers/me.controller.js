import asyncHandler from 'express-async-handler'
import { z } from 'zod'

// Address & wishlist endpoints that operate on the signed-in user.
// req.user is set by requireAuth and is the full Mongoose doc.

const addressSchema = z.object({
  name: z.string().optional().default(''),
  line1: z.string().min(1),
  line2: z.string().optional().default(''),
  city: z.string().min(1),
  state: z.string().min(1),
  postal: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional().default(''),
})

const addressPatchSchema = addressSchema.partial()

// ---------- Addresses ----------

export const listAddresses = asyncHandler(async (req, res) => {
  res.json({ items: req.user.addresses, total: req.user.addresses.length })
})

export const addAddress = asyncHandler(async (req, res) => {
  const payload = addressSchema.parse(req.body)
  req.user.addresses.push(payload)
  await req.user.save()
  const added = req.user.addresses[req.user.addresses.length - 1]
  res.status(201).json(added)
})

export const updateAddress = asyncHandler(async (req, res) => {
  const patch = addressPatchSchema.parse(req.body)
  const addr = req.user.addresses.id(req.params.id)
  if (!addr) return res.status(404).json({ error: 'Address not found' })
  Object.assign(addr, patch)
  await req.user.save()
  res.json(addr)
})

export const removeAddress = asyncHandler(async (req, res) => {
  const addr = req.user.addresses.id(req.params.id)
  if (!addr) return res.status(404).json({ error: 'Address not found' })
  addr.deleteOne()
  await req.user.save()
  res.status(204).end()
})

// ---------- Wishlist ----------

const wishlistItemSchema = z.object({
  handle: z.string().min(1),
})

export const getWishlist = asyncHandler(async (req, res) => {
  res.json({ items: req.user.wishlist })
})

export const addToWishlist = asyncHandler(async (req, res) => {
  const { handle } = wishlistItemSchema.parse(req.body)
  if (!req.user.wishlist.includes(handle)) {
    req.user.wishlist.push(handle)
    await req.user.save()
  }
  res.status(201).json({ items: req.user.wishlist })
})

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { handle } = req.params
  req.user.wishlist = req.user.wishlist.filter((h) => h !== handle)
  await req.user.save()
  res.json({ items: req.user.wishlist })
})
