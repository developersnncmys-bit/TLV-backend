import asyncHandler from 'express-async-handler'
import { z } from 'zod'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { LuxeExclusive } from '../models/LuxeExclusive.js'

// ---------- Validation ----------

const itemInputSchema = z.object({
  handle: z.string().min(1),
  qty: z.number().int().positive(),
  // The storefront already resolves these from its own content layer; we
  // accept them optimistically but re-validate against the Product doc
  // below so a tampered client can't invent a price.
  name: z.string().optional(),
  image: z.string().optional(),
  unitPrice: z.number().optional(),
  lineTotal: z.number().optional(),
})

const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal: z.string().min(1),
  country: z.string().min(1),
})

const contactSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().optional().default(''),
  phone: z.string().optional().default(''),
})

const extrasSchema = z
  .object({
    wrapping: z.enum(['essential', 'classic']).optional(),
    giftMessage: z.string().optional(),
  })
  .partial()
  .optional()

const createOrderSchema = z.object({
  items: z.array(itemInputSchema).min(1),
  contact: contactSchema,
  shipping: addressSchema,
  delivery: z
    .object({
      method: z.enum(['standard', 'express']).optional(),
      cost: z.number().nonnegative().optional(),
    })
    .optional(),
  payment: z
    .object({
      method: z.enum(['upi', 'card', 'netbanking', 'cod', 'wire', 'other']).optional(),
      fee: z.number().nonnegative().optional(),
    })
    .optional(),
  extras: extrasSchema,
  notes: z.string().optional(),
})

const updateOrderSchema = z
  .object({
    status: z.enum(['placed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    payment: z
      .object({
        method: z.enum(['upi', 'card', 'netbanking', 'cod', 'wire', 'other']).optional(),
        status: z.enum(['pending', 'paid', 'refunded', 'failed']).optional(),
        reference: z.string().optional(),
      })
      .optional(),
    notes: z.string().optional(),
  })
  .partial()

const listQuerySchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  skip: z.coerce.number().int().nonnegative().optional(),
})

// ---------- Handlers ----------

export const listOrders = asyncHandler(async (req, res) => {
  const { status, limit = 50, skip = 0 } = listQuerySchema.parse(req.query)

  const filter = {}
  if (status) filter.status = status

  // Customers only see their own orders; admins see all.
  if (req.user.role !== 'admin') filter.user = req.user._id

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ])

  res.json({ items, total, limit, skip })
})

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found' })

  if (
    req.user.role !== 'admin' &&
    (!order.user || order.user.toString() !== req.user._id.toString())
  ) {
    return res.status(404).json({ error: 'Order not found' })
  }

  res.json(order)
})

export const createOrder = asyncHandler(async (req, res) => {
  const payload = createOrderSchema.parse(req.body)

  // Resolve items from the catalog so snapshots are trustworthy. The
  // storefront passes handles; a handle resolves to either a Product
  // (regular catalog) or a LuxeExclusive piece (made-to-order range,
  // keyed by slug _id). Any handle that matches neither is rejected.
  const handles = payload.items.map((i) => i.handle.toLowerCase())
  const [products, exclusives] = await Promise.all([
    Product.find({ handle: { $in: handles }, status: 'active' }),
    LuxeExclusive.find({ _id: { $in: handles }, active: true }),
  ])
  const byHandle = new Map(products.map((p) => [p.handle, p]))
  const byExclusive = new Map(exclusives.map((e) => [e._id, e]))

  const missing = handles.filter((h) => !byHandle.has(h) && !byExclusive.has(h))
  if (missing.length) {
    return res.status(400).json({ error: `Unavailable items: ${missing.join(', ')}` })
  }

  const items = payload.items.map((input) => {
    const handle = input.handle.toLowerCase()
    const p = byHandle.get(handle)
    if (p) {
      const unitPrice = p.price
      return {
        product: p._id,
        handle: p.handle,
        reference: p.reference,
        name: p.name,
        image: p.image || (p.images && p.images[0]) || '',
        qty: input.qty,
        unitPrice,
        lineTotal: unitPrice * input.qty,
      }
    }
    // Luxe Exclusive piece — no Product ref, slug stands in as the handle.
    const e = byExclusive.get(handle)
    const unitPrice = e.price || 0
    return {
      handle: e._id,
      name: e.name,
      image: e.image || '',
      qty: input.qty,
      unitPrice,
      lineTotal: unitPrice * input.qty,
    }
  })

  const subtotal = items.reduce((a, i) => a + i.lineTotal, 0)
  const deliveryCost = payload.delivery?.cost ?? 0
  const paymentFee = payload.payment?.fee ?? 0
  const total = subtotal + deliveryCost + paymentFee
  // GST is 18% inclusive, matching the storefront's calculation.
  const gst = Math.round(total - total / 1.18)

  const ref = await Order.nextRef()

  const order = await Order.create({
    ref,
    user: req.user._id,
    items,
    contact: payload.contact,
    shipping: payload.shipping,
    delivery: payload.delivery,
    payment: {
      method: payload.payment?.method,
      fee: paymentFee,
      status: 'pending',
    },
    extras: payload.extras,
    subtotal,
    total,
    gst,
    notes: payload.notes,
  })

  res.status(201).json(order)
})

export const updateOrder = asyncHandler(async (req, res) => {
  const patch = updateOrderSchema.parse(req.body)

  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found' })

  if (patch.status) {
    order.status = patch.status
    if (patch.status === 'cancelled' && !order.cancelledAt) {
      order.cancelledAt = new Date()
    }
  }
  if (patch.payment) {
    if (patch.payment.method) order.payment.method = patch.payment.method
    if (patch.payment.status) order.payment.status = patch.payment.status
    if (patch.payment.reference !== undefined) order.payment.reference = patch.payment.reference
  }
  if (patch.notes !== undefined) order.notes = patch.notes

  await order.save()
  res.json(order)
})

// Allow a customer to cancel their own order while it's still in a
// cancellable state. Admins can force-cancel anything via PATCH.
export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (!order.user || order.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ error: 'Order not found' })
  }
  if (!['placed', 'processing'].includes(order.status)) {
    return res.status(400).json({ error: `Cannot cancel order in status "${order.status}"` })
  }
  order.status = 'cancelled'
  order.cancelledAt = new Date()
  await order.save()
  res.json(order)
})

export const deleteOrder = asyncHandler(async (req, res) => {
  const result = await Order.findByIdAndDelete(req.params.id)
  if (!result) return res.status(404).json({ error: 'Order not found' })
  res.status(204).end()
})
