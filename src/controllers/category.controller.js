import asyncHandler from 'express-async-handler'
import { z } from 'zod'
import { Category } from '../models/Category.js'

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const COLOR = z.enum(['rose', 'gold', 'maroon', 'ink'])

const categoryCreateSchema = z.object({
  id: z.string().optional(), // slug; derived from name if omitted
  name: z.string().min(1),
  color: COLOR.optional(),
  image: z.string().optional(),
  heroImage: z.string().optional(),
  region: z.string().optional(),
  tagline: z.string().optional(),
  heroEyebrow: z.string().optional(),
  collectionNote: z.string().optional(),
  promoBody: z.string().optional(),
  promoImage: z.string().optional(),
  promoCtaLabel: z.string().optional(),
  promoCtaHref: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
})

// Everything on a category is editable after creation except the slug,
// which is the _id. The admin UI already locks the name field for existing
// rows for the same reason.
const categoryUpdateSchema = categoryCreateSchema.omit({ id: true }).partial()

export const listCategories = asyncHandler(async (req, res) => {
  const filter = {}
  if (!req.user || req.user.role !== 'admin') filter.active = true
  const items = await Category.find(filter).sort({ order: 1, name: 1 })
  res.json({ items, total: items.length })
})

export const getCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id)
  if (!cat) return res.status(404).json({ error: 'Category not found' })
  if ((!req.user || req.user.role !== 'admin') && !cat.active) {
    return res.status(404).json({ error: 'Category not found' })
  }
  res.json(cat)
})

export const createCategory = asyncHandler(async (req, res) => {
  const payload = categoryCreateSchema.parse(req.body)
  const _id = (payload.id ? slugify(payload.id) : slugify(payload.name))
  if (!_id) return res.status(400).json({ error: 'Could not derive a slug from name' })
  const { id, ...rest } = payload

  const existing = await Category.findById(_id)
  if (existing) return res.status(409).json({ error: `Category "${_id}" already exists` })

  const cat = await Category.create({ _id, ...rest })
  res.status(201).json(cat)
})

export const updateCategory = asyncHandler(async (req, res) => {
  const patch = categoryUpdateSchema.parse(req.body)
  const cat = await Category.findByIdAndUpdate(req.params.id, patch, {
    new: true,
    runValidators: true,
  })
  if (!cat) return res.status(404).json({ error: 'Category not found' })
  res.json(cat)
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await Category.findByIdAndDelete(req.params.id)
  if (!result) return res.status(404).json({ error: 'Category not found' })
  res.status(204).end()
})
