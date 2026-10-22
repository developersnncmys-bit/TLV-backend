import { z } from 'zod'
import { CraftPrinciple } from '../models/CraftPrinciple.js'
import { slugResource } from './_slugResource.js'

const createSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  body: z.string().optional(),
  order: z.number().int().optional(),
})

const updateSchema = createSchema.omit({ id: true }).partial()

export const craftPrincipleHandlers = slugResource({
  Model: CraftPrinciple,
  name: 'Craft principle',
  createSchema,
  updateSchema,
  slugFrom: 'title',
  sort: { order: 1, title: 1 },
})
