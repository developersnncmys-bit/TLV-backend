# TLV Backend

Node + Express + MongoDB API for The Luxe Version storefront and admin panel.

## Setup

```bash
cd Backend
npm install
cp .env.example .env   # then edit MONGO_URI / JWT_SECRET
```

Make sure a MongoDB instance is reachable at the `MONGO_URI` in `.env`
(local, Docker, or Atlas — any Mongo 6+ works).

## Scripts

| Command         | What it does                                                           |
| --------------- | ---------------------------------------------------------------------- |
| `npm run dev`   | Start the API with `nodemon` (auto-reload)                             |
| `npm start`     | Start the API with plain `node`                                        |
| `npm run seed`  | Load the admin's seed products into Mongo and create an admin user     |

Default admin credentials after seeding: `admin@theluxeversion.com` / `Luxe@2026`
(matches the admin panel's pre-filled login form).
**Change the password before shipping.**

## Endpoints (so far)

Base URL: `http://localhost:4000`

### Health

- `GET /health` → `{ ok: true }`

### Auth — `/api/auth`

- `POST /login` — `{ email, password }` → `{ token, user }`
- `POST /register` — `{ email, password, name? }` → `{ token, user }`
- `GET /me` — requires `Authorization: Bearer <token>` → `{ user }`
- `PATCH /me` — update profile / preferences → `{ user }`

### Products — `/api/products`

Public reads filter to `status: active` automatically. If a request carries
a valid admin token (`Authorization: Bearer <token>`), the same routes
also return drafts and archived products.

- `GET /` — list; query: `category`, `editTag`, `status` (admin only), `q`, `limit`, `skip`
- `GET /:idOrHandle` — fetch by Mongo `_id` or by `handle` slug
- `POST /` — **admin** — create
- `PATCH /:id` — **admin** — update
- `DELETE /:id` — **admin** — delete

## Project layout

```
src/
  app.js                 Express app factory (middleware + route mounts)
  server.js              Entry point — connects DB then listens
  config/
    env.js               Env loading & validation
    db.js                mongoose connect/disconnect
  middleware/
    auth.js              signToken, requireAuth, requireRole, optionalAuth
    error.js             notFound + global error handler (Zod/Cast/Dup)
  models/
    User.js              email + passwordHash + role (admin|customer) + addresses + prefs + wishlist
    Product.js           Mirrors the admin's product shape (reference, handle, dimensions, bespoke, images, editorial fields)
  controllers/
    auth.controller.js   login, register, me, updateMe
    product.controller.js list, get, create, update, delete (Zod-validated)
  routes/
    auth.routes.js
    product.routes.js
  scripts/
    seed.js              Imports the admin's seed.js and upserts products + creates admin user
```

## Running backend + storefront + admin together

Three terminals, one per app.

1. **Backend** (this folder):
   ```bash
   cd Backend
   npm install
   # edit .env with your MONGO_URI and JWT_SECRET
   npm run seed      # one-time: loads seed products + creates admin user
   npm run dev       # http://localhost:4000
   ```

2. **Storefront** (reads products from the backend; falls back to its
   hardcoded data if the backend is down):
   ```bash
   cd The-Luxe-version
   npm install
   cp .env.local.example .env.local   # defaults to http://localhost:4000
   npm run dev       # http://localhost:3000
   ```

3. **Admin panel** (login + product CRUD go through the backend; other
   resources are still localStorage-only until their endpoints land):
   ```bash
   cd TLV-admin
   npm install
   cp .env.example .env               # defaults to http://localhost:4000
   npm run dev       # http://localhost:5173
   ```

Open http://localhost:5173, log in with the seeded credentials, edit a
product, then refresh http://localhost:3000/collections — the change
shows up because both apps are reading from the same Mongo collection.

## Next resources to add

Shapes already exist in [../TLV-admin/src/data/seed.js](../TLV-admin/src/data/seed.js):
categories, editTags, journal, banners, enquiries, orders, customers,
payments, inSitu, materials, craftPrinciples, ownershipPillars, houseContent.

Each follows the same pattern as Products — model → controller → routes
mounted in [src/app.js](src/app.js). The resource factory in the admin
([TLV-admin/src/lib/store.js](../TLV-admin/src/lib/store.js)) is the
reference for the method shapes (`list / get / create / update / remove / bulk`).
