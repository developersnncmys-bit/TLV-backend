import asyncHandler from 'express-async-handler'
import { z } from 'zod'
import { HouseContent } from '../models/HouseContent.js'

// Singleton — a single document keyed on `_id = "singleton"`. Reads
// return that row (creating a default if none exists so the storefront
// never sees a 404). Writes upsert.
const SINGLETON_ID = 'singleton'

const patchSchema = z
  .object({
    materialsHeadline: z.string().optional(),
    materialsLead: z.string().optional(),
    craftHeadline: z.string().optional(),
    craftLead: z.string().optional(),
    craftImage: z.string().optional(),
    craftImageAttribution: z.string().optional(),
    storyPullQuote: z.string().optional(),
    storyBody: z.string().optional(),
  })
  .partial()

export const getHouseContent = asyncHandler(async (_req, res) => {
  let doc = await HouseContent.findById(SINGLETON_ID)
  if (!doc) doc = await HouseContent.create({ _id: SINGLETON_ID })
  res.json(doc)
})

export const updateHouseContent = asyncHandler(async (req, res) => {
  const patch = patchSchema.parse(req.body)
  const doc = await HouseContent.findByIdAndUpdate(
    SINGLETON_ID,
    { $set: patch },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  res.json(doc)
})
