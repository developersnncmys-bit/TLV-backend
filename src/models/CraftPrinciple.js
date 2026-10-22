import mongoose from 'mongoose'

// The numbered principles rendered in The House → Craft section.
const craftPrincipleSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, _id: false },
)

craftPrincipleSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id
  delete obj._id
  return obj
}

export const CraftPrinciple = mongoose.model('CraftPrinciple', craftPrincipleSchema)
