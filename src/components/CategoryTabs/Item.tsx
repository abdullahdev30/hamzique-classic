'use client'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

type Props = {
  href: string
  title: string
}

export function Item({ href, title }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = pathname === href
  const DynamicTag = active ? 'p' : Link

  return (
    <li className="mt-2 flex text-sm text-[var(--color-text-primary)]">
      <DynamicTag
        className={clsx(
          'w-full rounded-md px-2 py-1 font-accent text-sm font-semibold uppercase text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-cta-accent)]',
          {
            'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]': active,
          },
        )}
        href={href}
        prefetch={!active ? false : undefined}
      >
        {title}
      </DynamicTag>
    </li>
  )
}
