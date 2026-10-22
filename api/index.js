// Vercel serverless entrypoint.
//
// Vercel maps files in /api/ to serverless functions; vercel.json rewrites
// every incoming request to /api so this file becomes the single catch-all
// handler for the whole Express app.
//
// Important: Vercel's Node runtime reuses the function instance across
// invocations when warm (so module-level constants like `app` and the
// cached Mongo connection survive), but discards it between cold starts.
// That means we build the Express app ONCE at module load and only
// kick off (or await) a connection promise per invocation.

import { createApp } from '../src/app.js'
import { ensureDb } from '../src/config/db.js'

const app = createApp()

export default async function handler(req, res) {
  // ensureDb() returns the same promise across invocations once resolved,
  // so this is a cheap no-op after the first cold-start connect.
  await ensureDb()
  return app(req, res)
}
