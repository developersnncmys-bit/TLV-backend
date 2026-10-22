import mongoose from 'mongoose'
import { env } from './env.js'

mongoose.set('strictQuery', true)

// Standalone-server connect: used by src/server.js on local dev (`npm run
// dev`) where the Node process stays alive. Not used by the Vercel adapter.
export async function connectDb() {
  await mongoose.connect(env.mongoUri)
  console.log(`[db] connected: ${mongoose.connection.name}`)
}

export async function disconnectDb() {
  await mongoose.disconnect()
}

// Serverless-friendly cached connect. Vercel reuses the Node instance
// across invocations when the function is warm, so caching the promise
// at module scope means we only pay the Atlas handshake on cold starts.
// Subsequent requests resolve immediately against the cached connection.
//
// We store on globalThis so hot module replacement (nodemon, Next dev)
// doesn't accidentally spawn multiple connections per process.
const CACHE_KEY = '__tlvMongoConnection__'

export async function ensureDb() {
  const g = globalThis
  if (!g[CACHE_KEY]) {
    g[CACHE_KEY] = mongoose
      .connect(env.mongoUri, {
        // Serverless connections should fail fast rather than hang the
        // whole invocation; Vercel aborts the function at ~10s on hobby.
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        // Clear the cache so the next invocation retries instead of
        // forever-failing against a dead promise.
        g[CACHE_KEY] = null
        throw err
      })
  }
  await g[CACHE_KEY]
}
