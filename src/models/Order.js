import mongoose from 'mongoose'

// Snapshot of a product line at the moment of purchase. We deliberately
// store `name`, `image`, `unitPrice`, `reference` rather than relying on
// the Product doc so historical orders stay stable if a product is later
// renamed, repriced or deleted.
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    handle: { type: String, default: '' },
    reference: { type: String, default: '' },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const shippingAddressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postal: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  { _id: false },
)

const contactSchema = new mongoose.Schema(
  {
    email: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { _id: false },
)

const extrasSchema = new mongoose.Schema(
  {
    wrapping: { type: String, enum: ['essential', 'classic'], default: 'essential' },
    giftMessage: { type: String, default: '' },
  },
  { _id: false },
)

const deliverySchema = new mongoose.Schema(
  {
    method: { type: String, enum: ['standard', 'express'], default: 'standard' },
    cost: { type: Number, default: 0 },
  },
  { _id: false },
)

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'cod', 'wire', 'other'],
      default: 'cod',
    },
    fee: { type: Number, default: 0 },
    // The gateway integration lands later; for now paymentStatus is the
    // state we actually track and update manually from the admin.
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
      index: true,
    },
    reference: { type: String, default: '' },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    // Human-readable order number (e.g. LVO-0001). Generated server-side
    // on create; still unique for admin lookup.
    ref: { type: String, required: true, unique: true, index: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    items: { type: [orderItemSchema], default: [] },
    extras: { type: extrasSchema, default: () => ({}) },
    delivery: { type: deliverySchema, default: () => ({}) },
    payment: { type: paymentSchema, default: () => ({}) },

    contact: { type: contactSchema, default: () => ({}) },
    shipping: { type: shippingAddressSchema, default: () => ({}) },

    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    gst: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },

    status: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
      index: true,
    },
    cancelledAt: { type: Date },

    notes: { type: String, default: '' },
  },
  { timestamps: true },
)

orderSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id
  delete obj._id
  return obj
}

// Allocate the next ref in `LVO-####` form. Not race-safe for
// extremely high concurrency, but perfectly adequate for this scale —
// a single-tenant luxury store.
orderSchema.statics.nextRef = async function () {
  const last = await this.findOne({ ref: /^LVO-/ }).sort({ ref: -1 }).lean()
  const n = last ? Number(String(last.ref).replace(/^LVO-/, '')) + 1 : 1
  return `LVO-${String(n).padStart(4, '0')}`
}

export const Order = mongoose.model('Order', orderSchema)
