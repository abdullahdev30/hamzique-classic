import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { CustomerComment } from '@/payload-types'

export const revalidateCustomerComments: CollectionAfterChangeHook<CustomerComment> = ({
  doc,
  previousDoc,
  req: { context },
}) => {
  if (!context.disableRevalidate && (doc._status === 'published' || previousDoc?._status === 'published')) {
    revalidatePath('/')
  }

  return doc
}

export const revalidateCustomerCommentsDelete: CollectionAfterDeleteHook<CustomerComment> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate && doc?._status === 'published') {
    revalidatePath('/')
  }

  return doc
}
