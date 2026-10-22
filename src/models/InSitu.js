import mongoose from 'mongoose'

// Home page "See the piece in the room" pairings — one in-situ photo
// per featured product. productRef is the human Product.reference
// (e.g. LV-721405), not the ObjectId.
const inSituSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true, lowercase: true },
    productRef: { type: String, required: true, trim: true, index: true },
    productLabel: { type: String, default: '' },
    categoryLabel: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, _id: false },
)

inSituSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id
  delete obj._id
  return obj
}

export const InSitu = mongoose.model('InSitu', inSituSchema)
