import { OrderStatus as StatusOptions } from '@/payload-types'
import { cn } from '@/utilities/cn'

type Props = {
  status: StatusOptions
  className?: string
}

export const OrderStatus: React.FC<Props> = ({ status, className }) => {
  return (
    <div
      className={cn(
        'w-fit rounded px-2 py-0 font-accent text-xs uppercase tracking-widest',
        className,
        {
          'bg-[var(--color-notification-bg)] text-[var(--color-notification-text)] ring-1 ring-[var(--color-notification-border)]':
            status === 'pending',
          'bg-[var(--tag-success-bg)] text-[var(--color-status-success)]': status === 'completed',
        },
      )}
    >
      {status}
    </div>
  )
}
