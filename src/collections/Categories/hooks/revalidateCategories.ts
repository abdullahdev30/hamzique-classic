import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Category } from '@/payload-types'

export const revalidateCategoryNavigation: CollectionAfterChangeHook<Category> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidateTag('categories', 'max')
    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath('/[slug]/[categorySlug]', 'page')
  }

  return doc
}

export const revalidateCategoryNavigationDelete: CollectionAfterDeleteHook<Category> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidateTag('categories', 'max')
    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath('/[slug]/[categorySlug]', 'page')
  }

  return doc
}
