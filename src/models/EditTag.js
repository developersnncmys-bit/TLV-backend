import mongoose from 'mongoose'

// Edit tags use their slug as _id (e.g. "statement", "new", "limited",
// "designer"). The admin UX locks the name field after creation, and
// Product.editTag stores this slug.

const editTagSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, enum: ['rose', 'gold', 'maroon', 'ink'], default: 'ink' },
    tagline: { type: String, default: '' },
    // Count displayed as "NN pieces in this edit" on the storefront.
    // Admin-authored (not derived from the Product.editTag count) so the
    // admin can show a curated-feeling number even when the actual tagged
    // product count is different.
    piecesCount: { type: Number, default: 0, min: 0 },
    // Hero / feature image for this edit tag's section on The Edit page.
    image: { type: String, default: '' },
    // Featured piece label — shown as a product name call-out alongside
    // the image on the storefront. Free text (admin can enter anything,
    // not necessarily a real Product name).
    productName: { type: String, default: '' },
    // Longer editorial description, below the tagline.
    description: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, _id: false },
)

editTagSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id
  delete obj._id
  return obj
}

export const EditTag = mongoose.model('EditTag', editTagSchema)
