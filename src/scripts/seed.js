// Seed the database with the same data the admin shipped in its
// localStorage default. Also creates a default admin user. Idempotent
// — safe to re-run; upserts by stable key (reference / slug).
//
// Usage: npm run seed

import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { env } from '../config/env.js'
import { connectDb, disconnectDb } from '../config/db.js'
import { User } from '../models/User.js'
import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { EditTag } from '../models/EditTag.js'
import { Journal } from '../models/Journal.js'
import { Banner } from '../models/Banner.js'
import { InSitu } from '../models/InSitu.js'
import { Material } from '../models/Material.js'
import { CraftPrinciple } from '../models/CraftPrinciple.js'
import { OwnershipPillar } from '../models/OwnershipPillar.js'
import { HouseContent } from '../models/HouseContent.js'

const ADMIN_SEED = path.resolve('../TLV-admin/src/data/seed.js')

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

async function loadAdminSeed() {
  const url = pathToFileURL(ADMIN_SEED).href
  const mod = await import(url)
  return mod
}

async function seedProducts(PRODUCTS) {
  let created = 0
  let updated = 0
  for (const p of PRODUCTS) {
    const doc = {
      reference: p.reference || p.id,
      handle: slugify(p.reference || p.id),
      name: p.name,
      category: p.category,
      editTag: p.editTag,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      status: p.status || 'active',
      materials: p.materials,
      materialTags: p.materialTags || [],
      dimensions: p.dimensions || {},
      description: p.description,
      moreDetails: p.moreDetails,
      materialImage: p.materialImage,
      materialDetail: p.materialDetail,
      craftImage: p.craftImage,
      craftDetail: p.craftDetail,
      whyHeadline: p.whyHeadline,
      whyHighlights: p.whyHighlights || [],
      pullQuote: p.pullQuote,
      featureImage: p.featureImage,
      bespoke: !!p.bespoke,
      image: p.image || '',
      images: p.images || [],
    }

    const existing = await Product.findOne({ reference: doc.reference })
    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: doc })
      updated++
    } else {
      await Product.create(doc)
      created++
    }
  }
  console.log(`[seed] products: ${created} created, ${updated} updated`)
}

// Generic upsert for slug-id collections. The admin seed rows carry an
// `id` (the slug); we strip it off and use it as the Mongo _id.
async function seedSlugCollection(Model, rows, label) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.log(`[seed] ${label}: skipped (no rows)`)
    return
  }
  let created = 0
  let updated = 0
  for (const row of rows) {
    const { id, ...rest } = row
    const _id = id ? slugify(id) : slugify(rest.name || rest.title || '')
    if (!_id) continue
    const existing = await Model.findById(_id)
    if (existing) {
      await Model.updateOne({ _id }, { $set: rest })
      updated++
    } else {
      await Model.create({ _id, ...rest })
      created++
    }
  }
  console.log(`[seed] ${label}: ${created} created, ${updated} updated`)
}

async function seedHouseContent(DEFAULT_HOUSE_CONTENT) {
  if (!DEFAULT_HOUSE_CONTENT) return
  const existing = await HouseContent.findById('singleton')
  if (existing) {
    console.log('[seed] house content: already seeded')
    return
  }
  await HouseContent.create({ _id: 'singleton', ...DEFAULT_HOUSE_CONTENT })
  console.log('[seed] house content: created')
}

async function seedAdminUser() {
  // Matches the Login page's pre-filled credentials
  // (TLV-admin/src/pages/Login.jsx). Change both if either changes.
  const email = 'admin@theluxeversion.com'
  const password = 'Luxe@2026'
  const existing = await User.findOne({ email })
  if (existing) {
    console.log(`[seed] admin user exists: ${email}`)
    return
  }
  const user = new User({ email, name: 'TLV Admin', role: 'admin' })
  await user.setPassword(password)
  await user.save()
  console.log(`[seed] admin user created: ${email} / ${password}`)
}

async function main() {
  console.log(`[seed] connecting to ${env.mongoUri}`)
  await connectDb()

  const seed = await loadAdminSeed()
  if (!Array.isArray(seed.PRODUCTS)) throw new Error('Could not load PRODUCTS from admin seed')

  await seedAdminUser()
  await seedProducts(seed.PRODUCTS)
  await seedSlugCollection(Category,         seed.CATEGORIES,        'categories')
  await seedSlugCollection(EditTag,          seed.EDIT_TAGS,         'edit-tags')
  await seedSlugCollection(Journal,          seed.JOURNAL,           'journal')
  await seedSlugCollection(Banner,           seed.BANNERS,           'banners')
  await seedSlugCollection(InSitu,           seed.IN_SITU,           'in-situ')
  await seedSlugCollection(Material,         seed.MATERIALS,         'materials')
  await seedSlugCollection(CraftPrinciple,   seed.CRAFT_PRINCIPLES,  'craft-principles')
  await seedSlugCollection(OwnershipPillar,  seed.OWNERSHIP_PILLARS, 'ownership-pillars')
  await seedHouseContent(seed.DEFAULT_HOUSE_CONTENT)

  await disconnectDb()
  console.log('[seed] done')
}

main().catch(async (err) => {
  console.error('[seed] failed:', err)
  await disconnectDb().catch(() => {})
  process.exit(1)
})
