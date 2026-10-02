import { Media } from '@/components/Media'
import type { CustomerComment, Media as MediaType } from '@/payload-types'

const isMedia = (value: unknown): value is MediaType =>
  Boolean(typeof value === 'object' && value !== null && 'url' in value)

type Props = {
  comments: CustomerComment[]
}

export function CustomerComments({ comments }: Props) {
  if (!comments.length) return null

  return (
    <section className="container py-10 md:py-14" aria-label="Customer comments">
      <h2 className="mb-8 text-center font-accent text-2xl font-bold text-[var(--color-text-primary)] md:text-3xl">
        Trusted and Loved by Our Valued Customers
      </h2>

      <div className="flex snap-x gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-1 md:overflow-visible">
        {comments.map((comment) => {
          const image = isMedia(comment.image) ? comment.image : null
          const rating = Math.min(Math.max(comment.rating || 5, 1), 5)

          return (
            <article
              className="grid min-w-[88%] snap-center gap-6 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)] p-5 shadow-sm md:min-w-0 md:grid-cols-[240px_1fr] md:items-center md:p-8"
              key={comment.id}
            >
              {image ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[var(--color-surface-secondary)] md:h-72 md:w-60">
                  <Media
                    alt={image.alt || comment.customerName}
                    className="h-full w-full"
                    fill
                    imgClassName="h-full w-full object-cover"
                    resource={image}
                    size="(min-width: 768px) 240px, 88vw"
                  />
                </div>
              ) : null}

              <div className="text-center">
                <blockquote className="mx-auto max-w-4xl text-lg font-medium leading-relaxed text-[var(--color-text-primary)] md:text-2xl">
                  &ldquo;{comment.quote}&rdquo;
                </blockquote>
                <div className="mt-12 font-accent text-xl font-bold text-[var(--color-text-primary)]">
                  {comment.customerName}
                </div>
                <div
                  aria-label={`${rating} out of 5 stars`}
                  className="mt-2 text-xl tracking-wide text-[var(--color-cta-accent)]"
                >
                  {'★'.repeat(rating)}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
