import { OrderStatus } from '@/components/OrderStatus'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Order } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import Link from 'next/link'

type Props = {
  order: Order
}

export const OrderItem: React.FC<Props> = ({ order }) => {
  const itemsLabel = order.items?.length === 1 ? 'Item' : 'Items'

  return (
    <div className="flex flex-col gap-12 rounded-lg border bg-card px-4 py-2 md:px-6 md:py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4">
        <h3 className="max-w-32 truncate font-accent text-sm uppercase tracking-widest text-[var(--color-text-secondary)] sm:max-w-none">{`#${order.id}`}</h3>

        <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center">
          <p className="text-xl">
            <time dateTime={order.createdAt}>
              {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
            </time>
          </p>

          {order.status && <OrderStatus status={order.status} />}
        </div>

        <p className="flex gap-2 text-xs text-[var(--color-text-secondary)]">
          <span>
            {order.items?.length} {itemsLabel}
          </span>
          {order.amount && (
            <>
              <span aria-hidden="true">/</span>
              <Price as="span" amount={order.amount} currencyCode={order.currency ?? undefined} />
            </>
          )}
        </p>
      </div>

      <Button asChild className="self-start sm:self-auto" variant="outline">
        <Link href={`/orders/${order.id}`}>View Order</Link>
      </Button>
    </div>
  )
}
