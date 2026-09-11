import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { Transaction } from '@/payload-types'

type CartItemSnapshot = {
  id?: string
  product: unknown
  quantity: number
  variant?: unknown
  [key: string]: unknown
}

const paymentMethodName = 'cashOnDelivery'

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
    const amount = cart.subtotal
    const transactionsCollection = transactionsSlug as 'transactions'

    if (!currency) {
      throw new Error('Currency is required.')
    }

    if (!cart?.items?.length) {
      throw new Error('Cart is empty or not provided.')
    }

    if (!customerEmail || typeof customerEmail !== 'string') {
      throw new Error('A valid customer email is required to make a purchase.')
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error('A valid amount is required to place this order.')
    }

    const flattenedCart = flattenCartItems(cart.items)

    const transaction = await req.payload.create({
      collection: transactionsCollection,
      data: {
        ...(req.user ? { customer: req.user.id } : { customerEmail }),
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
  confirmOrder: async ({
    cartsSlug = 'carts',
    data,
    ordersSlug = 'orders',
    req,
    transactionsSlug = 'transactions',
  }) => {
    const transactionID = data.transactionID
    const cartID = data.cartID
    const customerEmail = data.customerEmail
    const cartsCollection = cartsSlug as 'carts'
    const ordersCollection = ordersSlug as 'orders'
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

    const order = await req.payload.create({
      collection: ordersCollection,
      data: {
        amount: transaction.amount,
        currency: transaction.currency,
        ...(req.user ? { customer: req.user.id } : { customerEmail }),
        items: transaction.items,
        shippingAddress: data.shippingAddress,
        status: 'processing',
        transactions: [transaction.id],
      },
      req,
    })

    await req.payload.update({
      id: cartID,
      collection: cartsCollection,
      data: {
        purchasedAt: new Date().toISOString(),
      },
      req,
    })

    await req.payload.update({
      id: transaction.id,
      collection: transactionsCollection,
      data: {
        order: order.id,
        status: 'pending',
      },
      req,
    })

    return {
      message: 'Cash on delivery order confirmed.',
      orderID: order.id,
      transactionID: transaction.id,
      ...(order.accessToken ? { accessToken: order.accessToken } : {}),
    }
  },
})
