import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

import type { Category } from '@/payload-types'

export const revalidateCategoryNavigation: CollectionAfterChangeHook<Category> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidateTag('categories', 'max')
  }

  return doc
}

export const revalidateCategoryNavigationDelete: CollectionAfterDeleteHook<Category> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidateTag('categories', 'max')
  }

  return doc
}
