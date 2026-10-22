import { z } from 'zod'
import { Journal } from '../models/Journal.js'
import { slugResource } from './_slugResource.js'

const createSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  category: z.string().optional(),
  region: z.string().optional(),
  author: z.string().optional(),
  hero: z.string().optional(),
  pull_quote: z.string().optional(),
  body: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
})

const updateSchema = createSchema.omit({ id: true }).partial()

export const journalHandlers = slugResource({
  Model: Journal,
  name: 'Journal entry',
  createSchema,
  updateSchema,
  slugFrom: 'name',
  visibilityField: 'active',
  sort: { order: 1, createdAt: -1 },
})
