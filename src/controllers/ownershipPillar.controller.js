import { z } from 'zod'
import { OwnershipPillar } from '../models/OwnershipPillar.js'
import { slugResource } from './_slugResource.js'

const createSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  order: z.number().int().optional(),
})

const updateSchema = createSchema.omit({ id: true }).partial()

export const ownershipPillarHandlers = slugResource({
  Model: OwnershipPillar,
  name: 'Ownership pillar',
  createSchema,
  updateSchema,
  slugFrom: 'title',
  sort: { order: 1, title: 1 },
})
