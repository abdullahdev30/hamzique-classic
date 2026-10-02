import type { Media, Product } from '@/payload-types'

export type ProductStorySlide = Pick<
  Product,
  | 'discountPercent'
  | 'enableVariants'
  | 'priceInPKR'
  | 'priceTag'
  | 'slug'
  | 'title'
  | 'variants'
> & {
  image: Media
  video?: Media
}
