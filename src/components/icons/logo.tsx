import { cn } from '@/utilities/cn'
import React from 'react'

export function LogoIcon({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-label="Hamzique Classic"
      className={cn('inline-flex items-baseline whitespace-nowrap text-primary', className)}
      {...props}
    >
      <span className="font-brand text-[2.75rem] font-bold leading-none tracking-normal">
        Hamzique
      </span>
      <span className="ml-1 font-display text-[0.78rem] font-semibold uppercase leading-none tracking-[0.18em]">
        Classic
      </span>
    </span>
  )
}
