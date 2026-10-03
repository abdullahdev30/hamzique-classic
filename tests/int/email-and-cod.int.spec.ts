import type { Order } from '@/payload-types'
import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { buildOrderEmail } from '@/emails/orderEmail'
import { buildPasswordResetURL } from '@/emails/passwordResetEmail'
import { sendCompletedOrderEmail } from '@/collections/Orders/hooks/sendCompletedOrderEmail'
import { cashOnDeliveryAdapter } from '@/payments/cashOnDelivery'

const createRequest = (overrides: Record<string, unknown> = {}) => {
  const payload = {
    create: vi.fn(),
    find: vi.fn(),
    findByID: vi.fn(),
    logger: {
      error: vi.fn(),
      warn: vi.fn(),
    },
    sendEmail: vi.fn(),
    update: vi.fn(),
  }

  return {
    payload,
    req: {
      payload,
      user: null,
      ...overrides,
    } as unknown as PayloadRequest,
  }
}

describe('email templates', () => {
  it('builds a storefront password reset URL', () => {
    const url = new URL(buildPasswordResetURL('reset-token'))

    expect(url.pathname).toBe('/reset-password')
    expect(url.searchParams.get('token')).toBe('reset-token')
  })

  it('escapes product names in order emails', () => {
    const order = {
      id: 42,
      amount: 2500,
      createdAt: new Date().toISOString(),
      items: [
        {
          product: { id: 1, title: '<script>alert(1)</script>' },
          quantity: 1,
        },
      ],
      updatedAt: new Date().toISOString(),
    } as Order

    const email = buildOrderEmail({
      order,
      recipient: 'customer@example.com',
      type: 'confirmation',
    })

    expect(email.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(email.html).not.toContain('<script>')
  })
})

describe('cash on delivery adapter', () => {
  it('creates a pending transaction with a cart snapshot', async () => {
    const adapter = cashOnDeliveryAdapter()
    const { payload, req } = createRequest()
    payload.create.mockResolvedValue({ id: 88 })

    const result = await adapter.initiatePayment({
      data: {
        billingAddress: {} as never,
        cart: {
          id: 7,
          items: [{ id: 'line-1', product: { id: 11 } as never, quantity: 2 }],
          subtotal: 5000,
        },
        currency: 'PKR',
        customerEmail: 'customer@example.com',
      },
      req,
      transactionsSlug: 'transactions',
    })

    expect(result.transactionID).toBe(88)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'transactions',
        data: expect.objectContaining({
          customerEmail: 'customer@example.com',
          items: [expect.objectContaining({ product: 11, quantity: 2 })],
          paymentMethod: 'cashOnDelivery',
          status: 'pending',
        }),
      }),
    )
  })

  it('uses the core finalizer once and does not fail checkout when email delivery fails', async () => {
    const adapter = cashOnDeliveryAdapter()
    const { payload, req } = createRequest()
    payload.findByID.mockResolvedValue({
      amount: 5000,
      cart: 7,
      currency: 'PKR',
      customerEmail: 'customer@example.com',
      id: 88,
      items: [{ product: 11, quantity: 2 }],
      paymentMethod: 'cashOnDelivery',
      status: 'pending',
    })
    payload.sendEmail.mockRejectedValue(new Error('SMTP unavailable'))
    const finalizeOrder = vi.fn().mockResolvedValue({
      accessToken: 'order-access-token',
      amount: 5000,
      createdAt: new Date().toISOString(),
      id: 99,
      items: [{ product: 11, quantity: 2 }],
      updatedAt: new Date().toISOString(),
    })

    const result = await adapter.confirmOrder({
      data: {
        cartID: 7,
        customerEmail: 'customer@example.com',
        shippingAddress: {},
        transactionID: 88,
      },
      finalizeOrder,
      req,
      transactionsSlug: 'transactions',
    })

    expect(finalizeOrder).toHaveBeenCalledTimes(1)
    expect(finalizeOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        orderData: expect.objectContaining({
          customerEmail: 'customer@example.com',
          status: 'pending',
        }),
        transactionID: 88,
      }),
    )
    expect(result).toEqual(
      expect.objectContaining({
        accessToken: 'order-access-token',
        orderID: 99,
        transactionID: 88,
      }),
    )
    expect(payload.logger.error).toHaveBeenCalledOnce()
  })
})

describe('completed order notifications', () => {
  it('sends once when an order moves to completed', async () => {
    const { payload, req } = createRequest()
    payload.sendEmail.mockResolvedValue({})
    const order = {
      amount: 5000,
      createdAt: new Date().toISOString(),
      customerEmail: 'customer@example.com',
      id: 99,
      items: [{ product: 11, quantity: 2 }],
      status: 'completed',
      updatedAt: new Date().toISOString(),
    } as Order

    await sendCompletedOrderEmail({
      doc: order,
      operation: 'update',
      previousDoc: { ...order, status: 'pending' },
      req,
    } as never)
    await sendCompletedOrderEmail({
      doc: order,
      operation: 'update',
      previousDoc: order,
      req,
    } as never)

    expect(payload.sendEmail).toHaveBeenCalledOnce()
    expect(payload.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Your order #99 has been delivered',
        to: 'customer@example.com',
      }),
    )
  })
})
