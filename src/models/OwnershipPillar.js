import mongoose from 'mongoose'

// "OWNERSHIP ACCORDING TO THE HOUSE" strip on each product detail page.
const ownershipPillarSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '' },
    ctaLabel: { type: String, default: '' },
    ctaHref: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, _id: false },
)

ownershipPillarSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id
  delete obj._id
  return obj
}

export const OwnershipPillar = mongoose.model('OwnershipPillar', ownershipPillarSchema)
