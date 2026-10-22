import mongoose from 'mongoose'

// Categories use their slug as _id (e.g. "sculptures") rather than a
// generated ObjectId. That matches:
//  - the admin UX, which locks the name field after creation
//    ("Category id is fixed once created")
//  - the Product.category field, which stores the slug
//  - storefront URLs like /collections/sculptures

const categorySchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, enum: ['rose', 'gold', 'maroon', 'ink'], default: 'ink' },
    image: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    region: { type: String, default: '' },
    tagline: { type: String, default: '' },
    heroEyebrow: { type: String, default: '' },
    collectionNote: { type: String, default: '' },
    promoBody: { type: String, default: '' },
    promoImage: { type: String, default: '' },
    promoCtaLabel: { type: String, default: '' },
    promoCtaHref: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, _id: false },
)

categorySchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id
  delete obj._id
  return obj
}

export const Category = mongoose.model('Category', categorySchema)
