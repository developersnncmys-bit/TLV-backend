import { z } from 'zod'
import { LuxeExclusive } from '../models/LuxeExclusive.js'
import { slugResource } from './_slugResource.js'

const createSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  number: z.string().optional(),
  discipline: z.string().optional(),
  tagline: z.string().optional(),
  intro: z.string().optional(),
  body: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  leadTime: z.string().optional(),
  edition: z.string().optional(),
  price: z.number().nonnegative().optional(),
  image: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
})

const updateSchema = createSchema.omit({ id: true }).partial()

export const luxeExclusiveHandlers = slugResource({
  Model: LuxeExclusive,
  name: 'Luxe Exclusive piece',
  createSchema,
  updateSchema,
  slugFrom: 'name',
  visibilityField: 'active',
  sort: { order: 1, createdAt: -1 },
})
