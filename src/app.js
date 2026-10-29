import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { env } from './config/env.js'
import { notFound, errorHandler } from './middleware/error.js'
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import categoryRoutes from './routes/category.routes.js'
import editTagRoutes from './routes/editTag.routes.js'
import journalRoutes from './routes/journal.routes.js'
import bannerRoutes from './routes/banner.routes.js'
import inSituRoutes from './routes/inSitu.routes.js'
import materialRoutes from './routes/material.routes.js'
import craftPrincipleRoutes from './routes/craftPrinciple.routes.js'
import ownershipPillarRoutes from './routes/ownershipPillar.routes.js'
import houseContentRoutes from './routes/houseContent.routes.js'
import orderRoutes from './routes/order.routes.js'
import meRoutes from './routes/me.routes.js'
import luxeExclusiveRoutes from './routes/luxeExclusive.routes.js'

export function createApp() {
  const app = express()

  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.use(
    cors({
      origin: env.corsOrigins.length ? env.corsOrigins : true,
      credentials: true,
    }),
  )

  if (env.nodeEnv !== 'test') app.use(morgan('dev'))

  app.get('/health', (req, res) => res.json({ ok: true, env: env.nodeEnv }))

  app.use('/api/auth', authRoutes)
  app.use('/api/products', productRoutes)
  app.use('/api/uploads', uploadRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/edit-tags', editTagRoutes)
  app.use('/api/journal', journalRoutes)
  app.use('/api/banners', bannerRoutes)
  app.use('/api/in-situ', inSituRoutes)
  app.use('/api/materials', materialRoutes)
  app.use('/api/craft-principles', craftPrincipleRoutes)
  app.use('/api/ownership-pillars', ownershipPillarRoutes)
  app.use('/api/house-content', houseContentRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/users/me', meRoutes)
  app.use('/api/luxe-exclusive', luxeExclusiveRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
