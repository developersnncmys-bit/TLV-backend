import mongoose from 'mongoose'

// Editorial entries that back the Journal / Studio pages. The slug _id
// is used as the URL path on the storefront (/journal/<id>).
const journalSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: '' },
    region: { type: String, default: '' },
    author: { type: String, default: 'The Luxe Version' },
    hero: { type: String, default: '' },
    // Additional angles gallery — rendered as the "N OTHER ANGLES"
    // thumbnail grid in the storefront StudioShowcase.
    images: { type: [String], default: [] },
    pull_quote: { type: String, default: '' },
    body: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, _id: false },
)

journalSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id
  delete obj._id
  return obj
}

export const Journal = mongoose.model('Journal', journalSchema)
