'use client'

import { ExternalLink, MessageCircle, Share2, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { getProductPriceSummary } from '@/utilities/productPricing'

import type { ProductStorySlide } from './types'

type Props = {
  initialIndex?: number
  mediaType: 'image' | 'video'
  onClose: () => void
  slides: ProductStorySlide[]
  whatsappNumber?: string
}

const getWhatsAppHref = (number: string | undefined, message: string) => {
  const phone = number?.replace(/[^\d]/g, '')

  if (!phone) return undefined

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function ProductStoryModal({
  initialIndex = 0,
  mediaType,
  onClose,
  slides,
  whatsappNumber,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const lastIndex = Math.max(slides.length - 1, 0)
  const safeInitialIndex = Math.min(Math.max(initialIndex, 0), lastIndex)
  const [activeIndex, setActiveIndex] = React.useState(safeInitialIndex)

  const scrollBySlide = React.useCallback(
    (direction: -1 | 1) => {
      const container = containerRef.current
      if (!container) return

      const currentIndex = Math.round(container.scrollTop / container.clientHeight)
      const nextIndex = Math.min(Math.max(currentIndex + direction, 0), lastIndex)

      container.scrollTo({
        behavior: 'smooth',
        top: nextIndex * container.clientHeight,
      })
    },
    [lastIndex],
  )

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault()
        scrollBySlide(1)
      }

      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        scrollBySlide(-1)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, scrollBySlide])

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) return

      container.scrollTo({ top: safeInitialIndex * container.clientHeight })
      setActiveIndex(safeInitialIndex)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [safeInitialIndex])

  const shareProduct = async (slide: ProductStorySlide) => {
    const productPath = `/products/${slide.slug}`
    const url = new URL(productPath, window.location.origin).toString()

    if (navigator.share) {
      await navigator.share({ title: slide.title, url })
      return
    }

    await navigator.clipboard?.writeText(url)
  }

  if (!slides.length) return null

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-4 py-5"
      role="dialog"
    >
      <button
        aria-label="Close preview"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative z-10 h-[min(90vh,860px)] w-full max-w-[440px] overflow-hidden rounded-lg bg-black shadow-2xl">
        <output
          aria-live="polite"
          className="absolute left-4 top-4 z-40 rounded-full bg-black/45 px-3 py-2 text-xs font-semibold text-white backdrop-blur"
        >
          {activeIndex + 1} / {slides.length}
        </output>
        <button
          aria-label="Close preview"
          className="absolute right-4 top-4 z-40 grid size-12 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
          onClick={onClose}
          type="button"
        >
          <X className="size-6" />
        </button>

        <div
          aria-label="Product stories"
          className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
          onScroll={(event) => {
            const container = event.currentTarget
            const nextIndex = Math.min(
              Math.max(Math.round(container.scrollTop / container.clientHeight), 0),
              lastIndex,
            )
            setActiveIndex((currentIndex) =>
              currentIndex === nextIndex ? currentIndex : nextIndex,
            )
          }}
          ref={containerRef}
        >
          {slides.map((slide, index) => {
            const price = getProductPriceSummary(slide)
            const productPath = `/products/${slide.slug}`
            const whatsappHref = getWhatsAppHref(
              whatsappNumber,
              `Hi, I want to ask about ${slide.title}: ${productPath}`,
            )

            return (
              <article
                aria-label={`${slide.title}, story ${index + 1} of ${slides.length}`}
                className="relative h-full w-full snap-start snap-always overflow-hidden"
                key={`${mediaType}-${slide.slug}-${slide.image.id}-${index}`}
              >
                {mediaType === 'video' && slide.video ? (
                  <Media
                    className="h-full w-full"
                    resource={slide.video}
                    videoClassName="h-full w-full object-cover"
                  />
                ) : (
                  <Media
                    alt={slide.image.alt || slide.title}
                    className="h-full w-full"
                    fill
                    imgClassName="h-full w-full object-cover"
                    priority={index === safeInitialIndex}
                    resource={slide.image}
                    size="440px"
                  />
                )}

                <div className="absolute bottom-5 right-4 z-20 flex flex-col items-center gap-4 text-white">
                  {whatsappHref ? (
                    <a
                      aria-label={`Ask about ${slide.title} on WhatsApp`}
                      className="grid size-12 place-items-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-105"
                      href={whatsappHref}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <MessageCircle className="size-6" />
                    </a>
                  ) : null}
                  <button
                    aria-label={`Share ${slide.title}`}
                    className="grid size-12 place-items-center rounded-full bg-black/45 backdrop-blur transition hover:bg-black/65"
                    onClick={() => void shareProduct(slide)}
                    type="button"
                  >
                    <Share2 className="size-5" />
                  </button>
                </div>

                <div className="absolute inset-x-4 bottom-5 z-10 rounded-lg bg-white/94 p-3 pr-16 text-[var(--color-text-primary)] shadow-xl backdrop-blur">
                  <div className="flex gap-3">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface-secondary)]">
                      <Media
                        alt={slide.image.alt || slide.title}
                        className="h-full w-full"
                        fill
                        imgClassName="h-full w-full object-cover"
                        resource={slide.image}
                        size="80px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                          {slide.title}
                        </h3>
                        <Link
                          aria-label={`Open ${slide.title}`}
                          className="shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-cta-accent)]"
                          href={productPath}
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      </div>

                      {typeof price.finalPrice === 'number' ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Price
                            amount={price.finalPrice}
                            className="rounded-full bg-[var(--color-text-primary)] px-3 py-1 text-xs font-bold text-[var(--color-bg-dominant)]"
                          />
                          {price.hasDiscount && typeof price.basePrice === 'number' ? (
                            <>
                              <Price
                                amount={price.basePrice}
                                className="text-xs text-[var(--color-text-secondary)] line-through"
                              />
                              <span className="text-xs font-bold text-[var(--color-status-success)]">
                                {price.discountPercent}% off
                              </span>
                            </>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <Link
                    className="mt-3 block rounded-md bg-[var(--color-cta-accent)] px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-95"
                    href={productPath}
                  >
                    Shop now
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
