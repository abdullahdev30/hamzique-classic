import type { Product, Variant } from '@/payload-types'

type PriceableProduct = Pick<
  Product,
  'discountPercent' | 'enableVariants' | 'priceInPKR' | 'variants'
>

export type ProductPriceSummary = {
  basePrice?: number
  discountAmount?: number
  discountPercent: number
  finalPrice?: number
  hasDiscount: boolean
}

const getVariantPrices = (product: PriceableProduct) => {
  return (
    product.variants?.docs
      ?.filter((variant): variant is Variant => typeof variant === 'object')
      .map((variant) => variant.priceInPKR)
      .filter((price): price is number => typeof price === 'number') || []
  )
}

export const normalizeDiscountPercent = (value?: null | number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0

  return Math.min(Math.max(value, 0), 100)
}

export const getProductBasePrice = (product: PriceableProduct) => {
  if (product.enableVariants) {
    const variantPrices = getVariantPrices(product)

    if (variantPrices.length) {
      return Math.min(...variantPrices)
    }
  }

  return typeof product.priceInPKR === 'number' ? product.priceInPKR : undefined
}

export const getProductPriceSummary = (product: PriceableProduct): ProductPriceSummary => {
  const basePrice = getProductBasePrice(product)
  const discountPercent = normalizeDiscountPercent(product.discountPercent)
  const hasDiscount = typeof basePrice === 'number' && discountPercent > 0
  const discountAmount = hasDiscount ? Math.round(basePrice * (discountPercent / 100)) : undefined
  const finalPrice = hasDiscount && discountAmount ? basePrice - discountAmount : basePrice

  return {
    basePrice,
    discountAmount,
    discountPercent,
    finalPrice,
    hasDiscount,
  }
}
