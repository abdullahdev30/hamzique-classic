'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const ConfirmOrder: React.FC = () => {
  return (
    <div className="text-center w-full flex flex-col items-center justify-start gap-4">
      <h1 className="text-2xl">Cash on delivery checkout</h1>
      <p className="max-w-md text-[var(--color-text-secondary)]">
        Orders are now confirmed directly from checkout with cash on delivery.
      </p>
      <Button asChild>
        <Link href="/checkout">Return to checkout</Link>
      </Button>
    </div>
  )
}
