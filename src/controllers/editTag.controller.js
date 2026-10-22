import { z } from 'zod'
import { EditTag } from '../models/EditTag.js'
import { slugResource } from './_slugResource.js'

const COLOR = z.enum(['rose', 'gold', 'maroon', 'ink'])

const createSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  color: COLOR.optional(),
  tagline: z.string().optional(),
  piecesCount: z.number().int().nonnegative().optional(),
  image: z.string().optional(),
  productName: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
})

const updateSchema = createSchema.omit({ id: true }).partial()

export const editTagHandlers = slugResource({
  Model: EditTag,
  name: 'Edit tag',
  createSchema,
  updateSchema,
  slugFrom: 'name',
  sort: { order: 1, name: 1 },
})
