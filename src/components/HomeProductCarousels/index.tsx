import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Media, Product } from '@/payload-types'
import { CustomerComments } from './CustomerComments'
import { HomeContactInfo } from './HomeContactInfo'
import { ImageCarousel } from './ImageCarousel'
import type { ProductStorySlide } from './types'
import { VideoCarousel } from './VideoCarousel'

const isMedia = (value: unknown): value is Media =>
  Boolean(typeof value === 'object' && value !== null && 'mimeType' in value)

type HomeProduct = Pick<
  Product,
  | 'discountPercent'
  | 'enableVariants'
  | 'gallery'
  | 'priceInPKR'
  | 'priceTag'
  | 'showImageOnHomePage'
  | 'showVideoOnHomePage'
  | 'slug'
  | 'title'
  | 'variants'
>

const getGalleryMedia = (product: HomeProduct, mimeType: 'image' | 'video') =>
  product.gallery
    ?.map((item) => item.image)
    .find((media): media is Media => Boolean(isMedia(media) && media.mimeType?.startsWith(`${mimeType}/`)))

export async function HomeProductCarousels() {
  let products
  let comments

  try {
    const payload = await getPayload({ config: configPromise })
    ;[products, comments] = await Promise.all([
      payload.find({
        collection: 'products',
        depth: 1,
        draft: false,
        limit: 24,
        overrideAccess: false,
        pagination: false,
        select: {
          discountPercent: true,
          enableVariants: true,
          gallery: true,
          isTopVariant: true,
          priceInPKR: true,
          priceTag: true,
          showImageOnHomePage: true,
          showVideoOnHomePage: true,
          slug: true,
          title: true,
          variants: true,
        },
        sort: ['-isTopVariant', '-createdAt'],
        where: { _status: { equals: 'published' } },
      }),
      payload.find({
        collection: 'customer-comments',
        depth: 1,
        draft: false,
        limit: 8,
        overrideAccess: false,
        pagination: false,
        sort: ['sortOrder', '-createdAt'],
        where: { _status: { equals: 'published' } },
      }),
    ])
  } catch (error) {
    console.error('Failed to load home product carousels:', error)
    return null
  }

  const imageSlides = products.docs.reduce<ProductStorySlide[]>((slides, product) => {
    const image = product.showImageOnHomePage ? getGalleryMedia(product, 'image') : undefined

    return image ? [...slides, { ...product, image }] : slides
  }, [])
  const videoSlides = products.docs.reduce<ProductStorySlide[]>((slides, product) => {
    const video = product.showVideoOnHomePage ? getGalleryMedia(product, 'video') : undefined
    const image = getGalleryMedia(product, 'image')

    return video && image ? [...slides, { ...product, image, video }] : slides
  }, [])
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || ''

  return (
    <>
      <ImageCarousel slides={imageSlides} whatsappNumber={whatsappNumber} />
      <CustomerComments comments={comments.docs} />
      <VideoCarousel slides={videoSlides} whatsappNumber={whatsappNumber} />
      <HomeContactInfo />
    </>
  )
}
