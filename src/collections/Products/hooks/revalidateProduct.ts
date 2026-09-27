import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

import type { Product } from '@/payload-types'

const revalidateProductListings = (slug?: string | null) => {
  revalidatePath('/')
  revalidatePath('/shop')
  revalidatePath('/products')
  revalidatePath('/[slug]/[categorySlug]', 'page')

  if (slug) revalidatePath(`/products/${slug}`)
}

export const revalidateProduct: CollectionAfterChangeHook<Product> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) revalidateProductListings(doc.slug)
  return doc
}

export const revalidateProductDelete: CollectionAfterDeleteHook<Product> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) revalidateProductListings(doc.slug)
  return doc
}
