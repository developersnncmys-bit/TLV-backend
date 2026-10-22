import asyncHandler from 'express-async-handler'
import { z } from 'zod'
import { Product } from '../models/Product.js'

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const dimensionsSchema = z
  .object({
    main: z.string().optional(),
    base: z.string().optional(),
    weight: z.string().optional(),
  })
  .partial()

const whyHighlightSchema = z.object({
  title: z.string(),
  body: z.string(),
})

const productCreateSchema = z.object({
  reference: z.string().min(1),
  handle: z.string().optional(),
  name: z.string().min(1),
  category: z.string().min(1),
  editTag: z.string().optional(),
  price: z.number().nonnegative(),
  mrp: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  materials: z.string().optional(),
  materialTags: z.array(z.string()).optional(),
  dimensions: dimensionsSchema.optional(),
  description: z.string().optional(),
  moreDetails: z.string().optional(),
  materialImage: z.string().optional(),
  materialDetail: z.string().optional(),
  craftImage: z.string().optional(),
  craftDetail: z.string().optional(),
  whyHeadline: z.string().optional(),
  whyHighlights: z.array(whyHighlightSchema).optional(),
  pullQuote: z.string().optional(),
  featureImage: z.string().optional(),
  bespoke: z.boolean().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
})

const productUpdateSchema = productCreateSchema.partial()

const listQuerySchema = z.object({
  category: z.string().optional(),
  editTag: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  skip: z.coerce.number().int().nonnegative().optional(),
})

export const listProducts = asyncHandler(async (req, res) => {
  const { category, editTag, status, q, limit = 50, skip = 0 } = listQuerySchema.parse(req.query)

  const filter = {}
  if (category) filter.category = category
  if (editTag) filter.editTag = editTag
  if (status) filter.status = status
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { reference: new RegExp(q, 'i') }]

  // Storefront (unauthenticated) only ever sees active products.
  if (!req.user || req.user.role !== 'admin') filter.status = 'active'

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ])

  res.json({ items, total, limit, skip })
})

export const getProduct = asyncHandler(async (req, res) => {
  const { idOrHandle } = req.params
  const query = mongoose_isObjectId(idOrHandle)
    ? { _id: idOrHandle }
    : { handle: idOrHandle.toLowerCase() }

  const product = await Product.findOne(query)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  if ((!req.user || req.user.role !== 'admin') && product.status !== 'active') {
    return res.status(404).json({ error: 'Product not found' })
  }

  res.json(product)
})

export const createProduct = asyncHandler(async (req, res) => {
  const payload = productCreateSchema.parse(req.body)
  if (!payload.handle) payload.handle = slugify(payload.reference)

  const product = await Product.create(payload)
  res.status(201).json(product)
})

export const updateProduct = asyncHandler(async (req, res) => {
  const patch = productUpdateSchema.parse(req.body)
  const product = await Product.findByIdAndUpdate(req.params.id, patch, {
    new: true,
    runValidators: true,
  })
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.json(product)
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await Product.findByIdAndDelete(req.params.id)
  if (!result) return res.status(404).json({ error: 'Product not found' })
  res.status(204).end()
})

function mongoose_isObjectId(v) {
  return typeof v === 'string' && /^[a-f\d]{24}$/i.test(v)
}
