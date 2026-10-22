import { ZodError } from 'zod'
import multer from 'multer'

export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    })
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id', value: err.value })
  }

  if (err?.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key', keys: Object.keys(err.keyValue || {}) })
  }

  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    return res.status(status).json({ error: err.message, code: err.code })
  }

  const status = err.status || 500
  if (status >= 500) console.error('[error]', err)

  res.status(status).json({
    error: err.message || 'Internal server error',
  })
}
