'use client'
import type { Product, Variant } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'
import { CalendarDays, PackageCheck } from 'lucide-react'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'
import { FavoriteButton } from '@/components/product/FavoriteButton'
import type { DeliveryWindow } from '@/utilities/deliveryDates'
import { normalizeDiscountPercent } from '@/utilities/productPricing'

type Props = {
  deliveryWindow: DeliveryWindow
  product: Product
}

export function ProductDescription({ deliveryWindow, product }: Props) {
  const { currency } = useCurrency()
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  const priceField = `priceIn${currency.code}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)
  const discountPercent = normalizeDiscountPercent(product.discountPercent)
  const hasDiscount = discountPercent > 0

  if (hasVariants) {
    const priceField = `priceIn${currency.code}` as keyof Variant
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (
          typeof a === 'object' &&
          typeof b === 'object' &&
          priceField in a &&
          priceField in b &&
          typeof a[priceField] === 'number' &&
          typeof b[priceField] === 'number'
        ) {
          return a[priceField] - b[priceField]
        }

        return 0
      }) as Variant[]

    const lowestVariant = variantsOrderedByPrice[0][priceField]
    const highestVariant = variantsOrderedByPrice[variantsOrderedByPrice.length - 1][priceField]
    if (
      variantsOrderedByPrice &&
      typeof lowestVariant === 'number' &&
      typeof highestVariant === 'number'
    ) {
      lowestAmount = lowestVariant
      highestAmount = highestVariant
    }
  } else if (product[priceField] && typeof product[priceField] === 'number') {
    amount = product[priceField]
  }

  const discountPrice = (price?: number) => {
    if (!price || !hasDiscount) return price

    return Math.max(0, price - Math.round(price * (discountPercent / 100)))
  }

  const sizes = product.sizes?.filter((size) => size?.label) || []
  const colors = product.colorChart?.filter((color) => color?.label) || []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {product.priceTag ? (
            <p className="mb-2 text-xs font-semibold uppercase text-[var(--color-cta-accent)]">
              {product.priceTag}
            </p>
          ) : null}
          <h1 className="text-2xl font-medium text-[var(--color-text-primary)]">{product.title}</h1>
        </div>
        <FavoriteButton productId={product.id} title={product.title} />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="font-mono uppercase">
          {hasVariants ? (
            <>
              <Price
                highestAmount={discountPrice(highestAmount) ?? highestAmount}
                lowestAmount={discountPrice(lowestAmount) ?? lowestAmount}
              />
              {hasDiscount ? (
                <Price
                  className="text-sm text-[var(--color-text-secondary)] line-through"
                  highestAmount={highestAmount}
                  lowestAmount={lowestAmount}
                />
              ) : null}
            </>
          ) : (
            <>
              <Price amount={discountPrice(amount) ?? amount} />
              {hasDiscount ? (
                <Price
                  amount={amount}
                  className="text-sm text-[var(--color-text-secondary)] line-through"
                />
              ) : null}
            </>
          )}
        </div>
        {hasDiscount ? (
          <span className="rounded-full bg-[var(--tag-error-bg)] px-3 py-1 text-sm font-semibold text-[var(--color-status-error)]">
            {discountPercent}% discount
          </span>
        ) : null}
      </div>

      {product.description ? (
        <RichText className="" data={product.description} enableGutter={false} />
      ) : null}
      <hr />
      {hasVariants && (
        <>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>

          <hr />
        </>
      )}

      {sizes.length ? (
        <>
          <section aria-labelledby="size-chart-title" className="space-y-3">
            <h2 id="size-chart-title" className="text-sm font-semibold uppercase">
              Size chart
            </h2>
            <div className="overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Size</th>
                    <th className="px-3 py-2 font-medium">Extra charge</th>
                    <th className="px-3 py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr className="border-t border-[var(--color-border-subtle)]" key={size.id}>
                      <td className="px-3 py-2 font-medium">{size.label}</td>
                      <td className="px-3 py-2">
                        {size.extraCharge ? <Price amount={size.extraCharge} /> : 'No extra charge'}
                      </td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                        {size.notes || 'Standard fit'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <hr />
        </>
      ) : null}

      {colors.length ? (
        <>
          <section aria-labelledby="color-chart-title" className="space-y-3">
            <h2 id="color-chart-title" className="text-sm font-semibold uppercase">
              Color chart
            </h2>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <div
                  className="flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] px-3 py-2 text-sm"
                  key={color.id}
                >
                  <span>{color.label}</span>
                </div>
              ))}
            </div>
          </section>
          <hr />
        </>
      ) : null}

      <section className="grid gap-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)] p-4 text-sm sm:grid-cols-2">
        <div className="flex gap-3">
          <PackageCheck className="mt-0.5 size-4 text-[var(--color-cta-accent)]" />
          <div>
            <p className="font-semibold">Dispatch will be on {deliveryWindow.dispatchDate}</p>
            <p className="text-[var(--color-text-secondary)]">Calculated as 3 days from today.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 size-4 text-[var(--color-cta-accent)]" />
          <div>
            <p className="font-semibold">
              Delivery {deliveryWindow.deliveryStart} to {deliveryWindow.deliveryEnd}
            </p>
            <p className="text-[var(--color-text-secondary)]">
              Usually 2 to 3 working days after dispatch.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>

      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <AddToCart product={product} />
        </Suspense>
      </div>
    </div>
  )
}
