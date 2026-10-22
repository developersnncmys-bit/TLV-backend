import mongoose from 'mongoose'

// Material cards displayed in The House → Materials grid.
const materialSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, _id: false },
)

materialSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id
  delete obj._id
  return obj
}

export const Material = mongoose.model('Material', materialSchema)
