import { Router } from 'express'
import multer from 'multer'
import { uploadImage, uploadVideo } from '../controllers/upload.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

// Image uploads — small, cheap, Cloudinary handles optimisation.
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'))
    }
    cb(null, true)
  },
})

// Video uploads — larger ceiling, video MIME only. 100 MB covers the
// short editorial clips the home chapters use; anything larger should
// be hosted externally and pasted as a URL.
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video uploads are allowed'))
    }
    cb(null, true)
  },
})

const router = Router()

router.post(
  '/image',
  requireAuth,
  requireRole('admin'),
  imageUpload.single('image'),
  uploadImage,
)

router.post(
  '/video',
  requireAuth,
  requireRole('admin'),
  videoUpload.single('video'),
  uploadVideo,
)

export default router
