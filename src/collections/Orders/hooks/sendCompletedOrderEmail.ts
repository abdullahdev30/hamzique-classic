import type { Order, User } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'

import { sendOrderEmailSafely } from '@/emails/orderEmail'

const getRelationshipID = (value: Order['customer']): number | null => {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object') return value.id
  return null
}

const resolveCustomerEmail = async ({
  doc,
  req,
}: Parameters<CollectionAfterChangeHook<Order>>[0]): Promise<string | null> => {
  if (doc.customerEmail) return doc.customerEmail

  if (doc.customer && typeof doc.customer === 'object' && doc.customer.email) {
    return doc.customer.email
  }

  const customerID = getRelationshipID(doc.customer)
  if (!customerID) return null

  try {
    const customer = (await req.payload.findByID({
      collection: 'users',
      id: customerID,
      depth: 0,
      overrideAccess: false,
      req,
    })) as User

    return customer.email || null
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: `Could not resolve the customer email for completed order ${doc.id}.`,
    })
    return null
  }
}

export const sendCompletedOrderEmail: CollectionAfterChangeHook<Order> = async (args) => {
  const { doc, operation, previousDoc, req } = args

  if (operation !== 'update' || doc.status !== 'completed' || previousDoc?.status === 'completed') {
    return doc
  }

  const recipient = await resolveCustomerEmail(args)
  await sendOrderEmailSafely({
    order: doc,
    payload: req.payload,
    recipient,
    type: 'completed',
  })

  return doc
}
