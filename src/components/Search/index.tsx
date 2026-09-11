'use client'

import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'
import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

type Props = {
  className?: string
  inputLabel?: string
  placeholder?: string
}

export const Search: React.FC<Props> = ({
  className,
  inputLabel = 'Search products',
  placeholder = 'Search for products...',
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchId = React.useId()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const val = e.target as HTMLFormElement
    const search = val.search as HTMLInputElement
    const newParams = new URLSearchParams(searchParams.toString())

    if (search.value) {
      newParams.set('q', search.value)
    } else {
      newParams.delete('q')
    }

    router.push(createUrl('/shop', newParams))
  }

  return (
    <form className={cn('relative w-full', className)} onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={searchId}>
        {inputLabel}
      </label>
      <input
        autoComplete="off"
        className="h-10 w-full border border-[var(--color-surface-secondary)] bg-[var(--color-surface-secondary)] px-3 pr-11 font-accent text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-cta-accent)]"
        defaultValue={searchParams?.get('q') || ''}
        id={searchId}
        key={searchParams?.get('q')}
        name="search"
        placeholder={placeholder}
        type="text"
      />
      <button
        aria-label="Submit search"
        className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-cta-accent)]"
        type="submit"
      >
        <SearchIcon className="h-6 w-6 stroke-[1.5]" />
      </button>
    </form>
  )
}
