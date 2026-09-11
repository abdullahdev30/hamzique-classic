'use client'

import React from 'react'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto my-4 flex max-w-xl flex-col rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)] p-8 text-[var(--color-text-primary)] md:p-12">
      <h2 className="text-xl font-bold">Oh no!</h2>
      <p className="my-2">
        There was an issue with our storefront. This could be a temporary issue, please try your
        action again.
      </p>
      <button
        className="mx-auto mt-4 flex w-full items-center justify-center rounded-full bg-[var(--button-primary-bg)] p-4 font-accent font-semibold text-[var(--button-primary-text)] hover:opacity-90"
        onClick={() => reset()}
        type="button"
      >
        Try Again
      </button>
    </div>
  )
}
