import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Media, Product } from '@/payload-types'
import { ImageCarousel } from './ImageCarousel'
import { VideoCarousel } from './VideoCarousel'

const isMedia = (value: unknown): value is Media =>
  Boolean(typeof value === 'object' && value !== null && 'mimeType' in value)

type HomeProduct = Pick<Product, 'gallery'>

const getGalleryMedia = (product: HomeProduct, mimeType: 'image' | 'video') =>
  product.gallery
    ?.map((item) => item.image)
    .find((media): media is Media => Boolean(isMedia(media) && media.mimeType?.startsWith(`${mimeType}/`)))

export async function HomeProductCarousels() {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    depth: 1,
    draft: false,
    limit: 24,
    overrideAccess: false,
    pagination: false,
    select: {
      gallery: true,
      isTopVariant: true,
      showImageOnHomePage: true,
      showVideoOnHomePage: true,
      slug: true,
      title: true,
    },
    sort: ['-isTopVariant', '-createdAt'],
    where: { _status: { equals: 'published' } },
  })

  const imageSlides = products.docs.reduce<{ image: Media; slug: string; title: string }[]>(
    (slides, product) => {
      const image = product.showImageOnHomePage ? getGalleryMedia(product, 'image') : undefined
      return image ? [...slides, { image, slug: product.slug, title: product.title }] : slides
    },
    [],
  )
  const videoSlides = products.docs.reduce<{ title: string; video: Media }[]>((slides, product) => {
    const video = product.showVideoOnHomePage ? getGalleryMedia(product, 'video') : undefined
    return video ? [...slides, { title: product.title, video }] : slides
  }, [])

  return (
    <>
      <ImageCarousel slides={imageSlides} />
      <VideoCarousel slides={videoSlides} />
    </>
  )
}
