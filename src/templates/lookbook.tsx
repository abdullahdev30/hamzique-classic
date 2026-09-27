import type { Page } from '@/payload-types'

type Props = {
  page: Page
}

export function LookbookTemplate({ page }: Props) {
  return (
    <section className="container py-16 md:py-24">
      <h1 className="font-display text-4xl font-semibold text-[var(--color-text-primary)] md:text-6xl">
        {page.title}
      </h1>
    </section>
  )
}
