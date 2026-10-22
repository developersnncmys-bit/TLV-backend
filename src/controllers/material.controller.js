import { z } from 'zod'
import { Material } from '../models/Material.js'
import { slugResource } from './_slugResource.js'

const createSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  order: z.number().int().optional(),
})

const updateSchema = createSchema.omit({ id: true }).partial()

export const materialHandlers = slugResource({
  Model: Material,
  name: 'Material',
  createSchema,
  updateSchema,
  slugFrom: 'name',
  sort: { order: 1, name: 1 },
})
