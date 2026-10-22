import { z } from 'zod'
import { InSitu } from '../models/InSitu.js'
import { slugResource } from './_slugResource.js'

const createSchema = z.object({
  id: z.string().optional(),
  productRef: z.string().min(1),
  productLabel: z.string().optional(),
  categoryLabel: z.string().optional(),
  image: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
})

const updateSchema = createSchema.omit({ id: true }).partial()

export const inSituHandlers = slugResource({
  Model: InSitu,
  name: 'In-situ pairing',
  createSchema,
  updateSchema,
  slugFrom: 'productRef',
  visibilityField: 'active',
  sort: { order: 1, createdAt: -1 },
})
