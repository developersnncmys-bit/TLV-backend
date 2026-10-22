import { z } from 'zod'
import { Banner } from '../models/Banner.js'
import { slugResource } from './_slugResource.js'

const TYPE = z.enum(['hero', 'parallax', 'editorial', 'cta_band', 'weave'])
const MEDIA = z.enum(['image', 'video'])

const createSchema = z.object({
  id: z.string().optional(),
  type: TYPE.optional(),
  page: z.string().optional(),
  section: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  image: z.string().optional(),
  mediaType: MEDIA.optional(),
  videoUrl: z.string().optional(),
  attribution: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  ctaLabel2: z.string().optional(),
  ctaHref2: z.string().optional(),
  weave: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
})

const updateSchema = createSchema.omit({ id: true }).partial()

// Banners are keyed by an admin-authored slug (or auto-derived). Different
// banner types carry different authored text — weave banners have no title
// but do have a `weave` (category name), cta_bands and editorials have an
// eyebrow when title is empty, etc. Pick the first non-empty source field.
export const bannerHandlers = slugResource({
  Model: Banner,
  name: 'Banner',
  createSchema,
  updateSchema,
  slugFrom: (p) => {
    if (p.type === 'weave') return `${p.weave || ''}-tile`
    return p.title || p.weave || p.eyebrow || `${p.type || 'banner'}-${p.page || ''}`
  },
  visibilityField: 'active',
  sort: { page: 1, order: 1 },
})
