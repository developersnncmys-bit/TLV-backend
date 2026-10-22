import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema(
  {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postal: String,
    country: String,
    phone: String,
  },
  { _id: true, timestamps: false },
)

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer', index: true },
    addresses: { type: [addressSchema], default: [] },
    preferences: {
      language: { type: String, default: 'English' },
      currency: { type: String, enum: ['INR', 'USD', 'EUR', 'GBP'], default: 'INR' },
    },
    wishlist: { type: [String], default: [] }, // product handles / ids
  },
  { timestamps: true },
)

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10)
}

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

userSchema.methods.toSafeJSON = function () {
  const { _id, email, name, avatar, role, addresses, preferences, wishlist, createdAt } = this
  return { id: _id.toString(), email, name, avatar, role, addresses, preferences, wishlist, createdAt }
}

export const User = mongoose.model('User', userSchema)
