import mongoose from 'mongoose'

const dimensionsSchema = new mongoose.Schema(
  {
    main: String,
    base: String,
    weight: String,
  },
  { _id: false },
)

const whyHighlightSchema = new mongoose.Schema(
  { title: String, body: String },
  { _id: false },
)

const productSchema = new mongoose.Schema(
  {
    // The admin generates its own ids like "LV-398764". We keep that as a
    // human reference and let Mongo supply _id. The storefront uses `handle`
    // for URL slugs; it defaults to the reference lowercased.
    reference: { type: String, required: true, unique: true, index: true },
    handle: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },

    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    editTag: { type: String, index: true },

    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active', index: true },

    materials: String,
    materialTags: { type: [String], default: [] },
    dimensions: { type: dimensionsSchema, default: () => ({}) },
    description: String,
    moreDetails: String,

    // Rich editorial fields (optional — only product-detail pages use these)
    materialImage: String,
    materialDetail: String,
    craftImage: String,
    craftDetail: String,
    whyHeadline: String,
    whyHighlights: { type: [whyHighlightSchema], default: [] },
    pullQuote: String,
    featureImage: String,

    bespoke: { type: Boolean, default: false },

    image: String,
    images: { type: [String], default: [] },
  },
  { timestamps: true },
)

productSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id.toString()
  delete obj._id
  return obj
}

export const Product = mongoose.model('Product', productSchema)
