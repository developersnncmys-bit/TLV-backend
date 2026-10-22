import asyncHandler from 'express-async-handler'
import { z } from 'zod'
import { User } from '../models/User.js'
import { signToken } from '../middleware/auth.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().optional(),
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user || !(await user.verifyPassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  res.json({ token: signToken(user), user: user.toSafeJSON() })
})

export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = registerSchema.parse(req.body)

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const user = new User({ email: email.toLowerCase(), name, role: 'customer' })
  await user.setPassword(password)
  await user.save()

  res.status(201).json({ token: signToken(user), user: user.toSafeJSON() })
})

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() })
})

export const updateMe = asyncHandler(async (req, res) => {
  const patch = z
    .object({
      name: z.string().trim().optional(),
      avatar: z.string().optional(),
      preferences: z
        .object({
          language: z.string().optional(),
          currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
        })
        .optional(),
    })
    .parse(req.body)

  Object.assign(req.user, patch)
  if (patch.preferences) req.user.preferences = { ...req.user.preferences, ...patch.preferences }
  await req.user.save()
  res.json({ user: req.user.toSafeJSON() })
})
