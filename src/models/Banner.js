import mongoose from 'mongoose'

// Marketing surfaces (hero sections, parallax strips, editorial blocks,
// cta bands) displayed across the storefront pages. Each banner carries
// one or two CTAs and either an image or a video.
const bannerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true, lowercase: true },
    type: {
      type: String,
      enum: ['hero', 'parallax', 'editorial', 'cta_band', 'weave'],
      default: 'hero',
      index: true,
    },
    page: { type: String, default: '', index: true },
    // Optional sub-slot within a page. Lets the admin target a specific
    // chapter / section — e.g. page="home", section="film" overrides the
    // ChapterFilm media; section="look" overrides the ChapterLook cover.
    // Blank for whole-page banners that render via <BannerSections>.
    section: { type: String, default: '', index: true },
    // Category name (not slug) this tile overrides. Only populated for
    // `type: 'weave'` — ties the uploaded tile image to a specific category.
    weave: { type: String, default: '', index: true },
    eyebrow: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    body: { type: String, default: '' },
    image: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    videoUrl: { type: String, default: '' },
    attribution: { type: String, default: '' },
    ctaLabel: { type: String, default: '' },
    ctaHref: { type: String, default: '' },
    ctaLabel2: { type: String, default: '' },
    ctaHref2: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, _id: false },
)

bannerSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false })
  obj.id = obj._id
  delete obj._id
  return obj
}

export const Banner = mongoose.model('Banner', bannerSchema)
