import mongoose from 'mongoose'

// Luxe Exclusive pieces — the made-to-order range that lives on
// /exclusive on the storefront. One document per piece; the slug _id
// matches the storefront's piece slug (also used in URLs).
const luxeExclusiveSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    // Roman numeral or short label displayed as the piece's chapter
    // marker on the detail panel (I, II, III, …).
    number: { type: String, default: '' },
    discipline: { type: String, default: '' },
    // Short italic line shown under the name on the featured hero.
    tagline: { type: String, default: '' },
    intro: { type: String, default: '' },
    body: { type: String, default: '' },
    material: { type: String, default: '' },
    dimensions: { type: String, default: '' },
    leadTime: { type: String, default: '' },
    edition: { type: String, default: '' },
    // INR retail price shown next to the Add-to-Bag CTA. Stored as a
    // whole number — formatting is a storefront concern.
    price: { type: Number, default: 0 },
    image: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, _id: false },
)

luxeExclusiveSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id
  delete obj._id
  return obj
}

export const LuxeExclusive = mongoose.model('LuxeExclusive', luxeExclusiveSchema)
