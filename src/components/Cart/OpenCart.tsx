import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/cn'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <Button
      aria-label={quantity ? `Open cart with ${quantity} items` : 'Open cart'}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center p-0 text-[var(--color-text-primary)] transition-colors hover:cursor-pointer hover:text-[var(--color-cta-accent)]',
        className,
      )}
      size="clear"
      variant="nav"
      {...rest}
    >
      <ShoppingBag className="h-6 w-6 stroke-[1.6]" />
      {quantity ? (
        <span className="absolute -right-1 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-cta-accent)] px-1 text-[0.7rem] font-semibold leading-none text-[var(--color-text-primary)]">
          {quantity}
        </span>
      ) : null}
    </Button>
  )
}
