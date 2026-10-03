import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { Order, Transaction } from '@/payload-types'
import { sendOrderEmailSafely } from '@/emails/orderEmail'

type CartItemSnapshot = {
  id?: string
  product: unknown
  quantity: number
  variant?: unknown
  [key: string]: unknown
}

const paymentMethodName = 'cashOnDelivery'

const getRelationshipID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = value.id
    return typeof id === 'number' || typeof id === 'string' ? id : null
  }
  return null
}

const flattenCartItems = (items: CartItemSnapshot[]) => {
  return items.map((item) => {
    const productID =
      typeof item.product === 'object' && item.product && 'id' in item.product
        ? item.product.id
        : item.product
    const variantID =
      typeof item.variant === 'object' && item.variant && 'id' in item.variant
        ? item.variant.id
        : item.variant
    const { product, variant, ...customProperties } = item

    return {
      ...customProperties,
      product: productID,
      quantity: item.quantity,
      ...(variantID ? { variant: variantID } : {}),
    }
  }) as NonNullable<Transaction['items']>
}

export const cashOnDeliveryAdapter = (): PaymentAdapter => ({
  name: paymentMethodName,
  label: 'Cash on delivery',
  group: {
    name: paymentMethodName,
    type: 'group',
    admin: {
      condition: (data) => data?.paymentMethod === paymentMethodName,
    },
    fields: [
      {
        name: 'note',
        type: 'text',
        admin: {
          readOnly: true,
        },
        defaultValue: 'Payment will be collected in cash at delivery.',
        label: 'COD note',
      },
    ],
  },
  initiatePayment: async ({ data, req, transactionsSlug }) => {
    const { billingAddress, cart, currency, customerEmail } = data
    const resolvedCustomerEmail = customerEmail || req.user?.email
    const amount = cart.subtotal
    const transactionsCollection = transactionsSlug as 'transactions'

    if (!currency) {
      throw new Error('Currency is required.')
    }

    if (!cart?.items?.length) {
      throw new Error('Cart is empty or not provided.')
    }

    if (!resolvedCustomerEmail || typeof resolvedCustomerEmail !== 'string') {
      throw new Error('A valid customer email is required to make a purchase.')
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error('A valid amount is required to place this order.')
    }

    const flattenedCart = flattenCartItems(cart.items)

    const transaction = await req.payload.create({
      collection: transactionsCollection,
      data: {
        ...(req.user ? { customer: req.user.id } : {}),
        customerEmail: resolvedCustomerEmail,
        amount,
        billingAddress,
        cart: cart.id,
        currency: 'PKR',
        items: flattenedCart,
        paymentMethod: paymentMethodName,
        status: 'pending',
        [paymentMethodName]: {
          note: 'Payment will be collected in cash at delivery.',
        },
      },
      req,
    })

    return {
      message: 'Cash on delivery selected.',
      transactionID: transaction.id,
    }
  },
  confirmOrder: async ({ data, finalizeOrder, req, transactionsSlug = 'transactions' }) => {
    const transactionID = data.transactionID
    const cartID = data.cartID
    const customerEmail = data.customerEmail
    const transactionsCollection = transactionsSlug as 'transactions'

    if (typeof cartID !== 'string' && typeof cartID !== 'number') {
      throw new Error('Cart ID is required to confirm a cash on delivery order.')
    }

    const transaction =
      typeof transactionID === 'string' || typeof transactionID === 'number'
        ? await req.payload.findByID({
            id: transactionID,
            collection: transactionsCollection,
            depth: 0,
            req,
          })
        : (
            await req.payload.find({
              collection: transactionsCollection,
              depth: 0,
              limit: 1,
              req,
              sort: '-createdAt',
              where: {
                and: [
                  {
                    cart: {
                      equals: cartID,
                    },
                  },
                  {
                    paymentMethod: {
                      equals: paymentMethodName,
                    },
                  },
                ],
              },
            })
          ).docs[0]

    if (!transaction) {
      throw new Error('No cash on delivery transaction was found for this cart.')
    }

    if (typeof finalizeOrder !== 'function') {
      throw new Error('The core order finalizer is required for cash on delivery.')
    }

    if (transaction.paymentMethod !== paymentMethodName) {
      throw new Error('The transaction is not a cash on delivery transaction.')
    }

    if (String(getRelationshipID(transaction.cart)) !== String(cartID)) {
      throw new Error('The transaction does not belong to this cart.')
    }

    const transactionCustomerID = getRelationshipID(transaction.customer)
    if (req.user && String(transactionCustomerID) !== String(req.user.id)) {
      throw new Error('The transaction does not belong to this customer.')
    }

    const resolvedCustomerEmail =
      customerEmail ||
      transaction.customerEmail ||
      (transaction.customer && typeof transaction.customer === 'object'
        ? transaction.customer.email
        : null) ||
      req.user?.email

    if (
      !req.user &&
      (!resolvedCustomerEmail ||
        resolvedCustomerEmail.trim().toLowerCase() !== String(customerEmail).trim().toLowerCase())
    ) {
      throw new Error('The transaction customer email does not match this order.')
    }

    const order = (await finalizeOrder({
      orderData: {
        amount: transaction.amount,
        currency: transaction.currency,
        ...(req.user ? { customer: req.user.id } : {}),
        ...(resolvedCustomerEmail ? { customerEmail: resolvedCustomerEmail } : {}),
        items: transaction.items,
        shippingAddress: data.shippingAddress,
        status: 'pending',
      },
      transactionID: transaction.id,
    })) as unknown as Order

    await sendOrderEmailSafely({
      order,
      payload: req.payload,
      recipient: resolvedCustomerEmail,
      type: 'confirmation',
    })

    return {
      message: 'Cash on delivery order confirmed.',
      orderID: order.id,
      transactionID: transaction.id,
      ...(order.accessToken ? { accessToken: order.accessToken } : {}),
    }
  },
})
