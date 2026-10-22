import mongoose from 'mongoose'

// Singleton document — section headers for The House page's Materials
// and Craft grids, plus the brand story block. There is only ever one
// row in this collection; it's addressed by the fixed `_id = "singleton"`.
const houseContentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'singleton' },
    materialsHeadline: { type: String, default: '' },
    materialsLead: { type: String, default: '' },
    craftHeadline: { type: String, default: '' },
    craftLead: { type: String, default: '' },
    craftImage: { type: String, default: '' },
    craftImageAttribution: { type: String, default: '' },
    storyPullQuote: { type: String, default: '' },
    storyBody: { type: String, default: '' },
  },
  { timestamps: true, _id: false },
)

houseContentSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  delete obj._id
  return obj
}

export const HouseContent = mongoose.model('HouseContent', houseContentSchema)
