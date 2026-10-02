import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

import type { Product } from '@/payload-types'

const revalidateProductListings = (slug?: string | null) => {
  try {
    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath('/products')
    revalidatePath('/[slug]/[categorySlug]', 'page')

    if (slug) revalidatePath(`/products/${slug}`)
  } catch (error) {
    console.error('Product revalidation error:', error)
  }
}

const deferProductRevalidation = (slug?: string | null) => {
  setTimeout(() => {
    revalidateProductListings(slug)
  }, 0)
}

export const revalidateProduct: CollectionAfterChangeHook<Product> = ({
  doc,
  req: { context },
}) => {
  if (!context?.disableRevalidate) deferProductRevalidation(doc.slug)
  return doc
}

export const revalidateProductDelete: CollectionAfterDeleteHook<Product> = ({
  doc,
  req: { context },
}) => {
  if (!context?.disableRevalidate) deferProductRevalidation(doc.slug)
  return doc
}
