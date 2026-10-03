import type { Order } from '@/payload-types'
import type { Payload } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

export type OrderEmailType = 'confirmation' | 'completed'

const escapeHTML = (value: unknown): string =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

type OrderItem = NonNullable<Order['items']>[number]

const getProductTitle = (product: OrderItem['product']): string => {
  if (product && typeof product === 'object' && 'title' in product) {
    return product.title
  }

  return product ? `Product #${product}` : 'Product'
}

const buildOrderURL = (order: Order, recipient: string): string => {
  const orderURL = new URL(`/orders/${order.id}`, getServerSideURL())

  if (order.accessToken) {
    orderURL.searchParams.set('email', recipient)
    orderURL.searchParams.set('accessToken', order.accessToken)
  }

  return orderURL.toString()
}

const formatAmount = (amount: number | null | undefined): string =>
  typeof amount === 'number'
    ? new Intl.NumberFormat('en-PK', {
        currency: 'PKR',
        maximumFractionDigits: 0,
        style: 'currency',
      }).format(amount)
    : 'See order details'

export const buildOrderEmail = ({
  order,
  recipient,
  type,
}: {
  order: Order
  recipient: string
  type: OrderEmailType
}): { html: string; subject: string } => {
  const isCompleted = type === 'completed'
  const orderURL = buildOrderURL(order, recipient)
  const itemRows = (order.items || [])
    .map(
      (item) =>
        `<li>${escapeHTML(getProductTitle(item.product))} &times; ${escapeHTML(item.quantity)}</li>`,
    )
    .join('')
  const heading = isCompleted ? 'Your order has been delivered' : 'Thank you for your order'
  const message = isCompleted
    ? 'Your order is marked as completed and delivered.'
    : 'We received your cash on delivery order and will begin processing it.'

  return {
    html: `
      <h1>${heading}</h1>
      <p>${message}</p>
      <p><strong>Order:</strong> #${escapeHTML(order.id)}</p>
      ${itemRows ? `<ul>${itemRows}</ul>` : ''}
      <p><strong>Total:</strong> ${escapeHTML(formatAmount(order.amount))}</p>
      <p><a href="${escapeHTML(orderURL)}">View your order</a></p>
    `,
    subject: isCompleted
      ? `Your order #${order.id} has been delivered`
      : `Order #${order.id} confirmation`,
  }
}

export const sendOrderEmailSafely = async ({
  order,
  payload,
  recipient,
  type,
}: {
  order: Order
  payload: Payload
  recipient: string | null | undefined
  type: OrderEmailType
}): Promise<boolean> => {
  if (!recipient) {
    payload.logger.warn({
      msg: `Skipped ${type} email for order ${order.id}: no customer email is available.`,
    })
    return false
  }

  try {
    const email = buildOrderEmail({ order, recipient, type })
    await payload.sendEmail({
      html: email.html,
      subject: email.subject,
      to: recipient,
    })
    return true
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Failed to send ${type} email for order ${order.id}. The order was not affected.`,
    })
    return false
  }
}
