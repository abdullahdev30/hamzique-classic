import clsx from 'clsx'
import React from 'react'

import { Price } from '@/components/Price'

type Props = {
  amount: number
  position?: 'bottom' | 'center'
  title: string
}

export const Label: React.FC<Props> = ({ amount, position = 'bottom', title }) => {
  return (
    <div
      className={clsx('absolute bottom-0 left-0 flex w-full px-4 pb-4 @container/label', {
        '': position === 'center',
      })}
    >
      <div className="flex grow items-end justify-between text-sm font-semibold">
        <h3 className="mr-4 line-clamp-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)] p-2 px-3 font-accent leading-none text-[var(--color-text-primary)] backdrop-blur-md">
          {title}
        </h3>

        <Price
          amount={amount}
          className="flex-none rounded-full bg-[var(--color-cta-accent)] p-2 text-[var(--color-text-primary)]"
          currencyCodeClassName="hidden @[275px]/label:inline"
        />
      </div>
    </div>
  )
}
