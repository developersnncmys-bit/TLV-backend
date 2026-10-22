import asyncHandler from 'express-async-handler'

export const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Builds list/get/create/update/remove handlers for a slug-id Mongoose model.
//   Model           — the Mongoose model (its _id is a String slug)
//   name            — label used in 404/409 messages
//   createSchema    — zod schema for POST body; `.id` is treated as the explicit slug
//   updateSchema    — zod schema for PATCH body (usually createSchema.omit({id:true}).partial())
//   slugFrom        — field name on the create payload used to derive the slug when `.id` is omitted.
//                     May also be a function (payload) => string for entities that need to
//                     choose the source field dynamically (e.g. Banner falls back between
//                     title / weave / eyebrow depending on type).
//   visibilityField — optional boolean field (e.g. 'active') that non-admins filter on for list/get
//   sort            — mongo sort doc for list()
export function slugResource({
  Model,
  name,
  createSchema,
  updateSchema,
  slugFrom,
  visibilityField = null,
  sort = { order: 1, createdAt: -1 },
}) {
  return {
    list: asyncHandler(async (req, res) => {
      const filter = {}
      if (visibilityField && (!req.user || req.user.role !== 'admin')) {
        filter[visibilityField] = true
      }
      const items = await Model.find(filter).sort(sort)
      res.json({ items, total: items.length })
    }),

    get: asyncHandler(async (req, res) => {
      const row = await Model.findById(req.params.id)
      if (!row) return res.status(404).json({ error: `${name} not found` })
      if (
        visibilityField &&
        (!req.user || req.user.role !== 'admin') &&
        !row[visibilityField]
      ) {
        return res.status(404).json({ error: `${name} not found` })
      }
      res.json(row)
    }),

    create: asyncHandler(async (req, res) => {
      const payload = createSchema.parse(req.body)
      const derived = typeof slugFrom === 'function' ? slugFrom(payload) : payload[slugFrom]
      const source = payload.id || derived
      const _id = slugify(source)
      if (!_id) return res.status(400).json({ error: `Could not derive a slug for ${name}` })

      const existing = await Model.findById(_id)
      if (existing) return res.status(409).json({ error: `${name} "${_id}" already exists` })

      const { id: _ignored, ...rest } = payload
      const row = await Model.create({ _id, ...rest })
      res.status(201).json(row)
    }),

    update: asyncHandler(async (req, res) => {
      const patch = updateSchema.parse(req.body)
      const row = await Model.findByIdAndUpdate(req.params.id, patch, {
        new: true,
        runValidators: true,
      })
      if (!row) return res.status(404).json({ error: `${name} not found` })
      res.json(row)
    }),

    remove: asyncHandler(async (req, res) => {
      const result = await Model.findByIdAndDelete(req.params.id)
      if (!result) return res.status(404).json({ error: `${name} not found` })
      res.status(204).end()
    }),
  }
}
