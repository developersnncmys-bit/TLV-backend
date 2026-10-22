import asyncHandler from 'express-async-handler'
import { cloudinary } from '../config/cloudinary.js'
import { env, cloudinaryConfigured } from '../config/env.js'

function uploadBufferToCloudinary(buffer, { folder, filename, resource_type = 'image' }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type,
        public_id: filename || undefined,
        overwrite: false,
        unique_filename: true,
        use_filename: Boolean(filename),
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    )
    stream.end(buffer)
  })
}

function resolveFolder(req) {
  const folderParam = typeof req.body.folder === 'string' ? req.body.folder.trim() : ''
  return folderParam
    ? `${env.cloudinary.folder}/${folderParam.replace(/^\/+|\/+$/g, '')}`
    : env.cloudinary.folder
}

export const uploadImage = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigured) {
    return res.status(503).json({ error: 'Image upload is not configured on the server' })
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided (expected multipart field "image")' })
  }

  const originalName = req.file.originalname?.replace(/\.[^.]+$/, '') || ''

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: resolveFolder(req),
    filename: originalName,
    resource_type: 'image',
  })

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  })
})

export const uploadVideo = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigured) {
    return res.status(503).json({ error: 'Video upload is not configured on the server' })
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided (expected multipart field "video")' })
  }

  const originalName = req.file.originalname?.replace(/\.[^.]+$/, '') || ''

  // Cloudinary charges separate quota buckets for videos — larger assets,
  // bandwidth metered differently. The multer cap (see routes/upload.routes.js)
  // caps the server-side ingest; Cloudinary will reject anything larger.
  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: resolveFolder(req),
    filename: originalName,
    resource_type: 'video',
  })

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    duration: result.duration,
  })
})
