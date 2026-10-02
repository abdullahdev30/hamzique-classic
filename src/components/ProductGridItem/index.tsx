import type { Product } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { getProductPriceSummary } from '@/utilities/productPricing'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceTag, title } = product
  const price = getProductPriceSummary(product)

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : false

  return (
    <Link className="group block h-full w-full" href={`/products/${product.slug}`}>
      <article className="h-full">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)]">
          {image ? (
            <Media
              className="relative h-full w-full"
              fill
              height={480}
              imgClassName={clsx('h-full w-full object-cover', {
                'transition duration-300 ease-in-out group-hover:scale-105': true,
              })}
              resource={image}
              size="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              width={480}
            />
          ) : null}

          <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
            {priceTag ? (
              <span className="rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                {priceTag}
              </span>
            ) : null}
            {price.hasDiscount ? (
              <span className="rounded-full bg-[var(--tag-error-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-status-error)]">
                {price.discountPercent}% off
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3 font-accent">
          <h3 className="line-clamp-2 text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-cta-accent)]">
            {title}
          </h3>

          {typeof price.finalPrice === 'number' ? (
            <div className="shrink-0 text-right">
              <Price
                amount={price.finalPrice}
                className="text-sm font-semibold text-[var(--color-text-primary)]"
              />
              {price.hasDiscount && typeof price.basePrice === 'number' ? (
                <Price
                  amount={price.basePrice}
                  className="text-xs text-[var(--color-text-secondary)] line-through"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  )
}
