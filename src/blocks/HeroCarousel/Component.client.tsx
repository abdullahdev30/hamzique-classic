'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Media as MediaComponent } from '@/components/Media'
import type { Media } from '@/payload-types'
import { cn } from '@/utilities/cn'

type Slide = {
  image: Media
  altOverride?: string | null
  contentPosition?: 'left' | 'right' | null
  countdownEnd?: string | null
  countdownPosition?: 'left' | 'right' | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  description?: string | null
  eyebrow?: string | null
  heading?: string | null
}

type Props = {
  contentPosition?: 'left' | 'right' | null
  countdownEnd?: null | string
  countdownPosition?: 'left' | 'right' | null
  ctaLabel?: null | string
  ctaUrl?: null | string
  description?: null | string
  eyebrow?: null | string
  heading?: null | string
  slides: Slide[]
}

const slideDuration = 5000
const countdownUnits = [
  { label: 'Days', value: 24 * 60 * 60 * 1000 },
  { label: 'Hours', value: 60 * 60 * 1000 },
  { label: 'Minutes', value: 60 * 1000 },
  { label: 'Seconds', value: 1000 },
]

const getRemainingTime = (endTime?: null | string) => {
  if (!endTime) return 0

  const endDate = new Date(endTime)

  if (Number.isNaN(endDate.getTime())) return 0

  return Math.max(0, endDate.getTime() - Date.now())
}

const getCountdownParts = (milliseconds: number) => {
  let remaining = milliseconds

  return countdownUnits.map((unit) => {
    const value = Math.floor(remaining / unit.value)
    remaining -= value * unit.value

    return {
      label: unit.label,
      value: value.toString().padStart(2, '0'),
    }
  })
}

const getSlideValue = <T,>(slideValue: T | null | undefined, fallbackValue: T | null | undefined) =>
  slideValue ?? fallbackValue

const hasText = (value?: null | string) => Boolean(value?.trim())

export function HeroCarouselClient({
  contentPosition,
  countdownEnd,
  countdownPosition,
  ctaLabel,
  ctaUrl,
  description,
  eyebrow,
  heading,
  slides,
}: Props) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [remainingTime, setRemainingTime] = React.useState(0)
  const hasMultipleSlides = slides.length > 1
  const activeSlide = slides[activeIndex]
  const activeContentPosition =
    getSlideValue(activeSlide?.contentPosition, contentPosition) || 'left'
  const activeCountdownEnd = getSlideValue(activeSlide?.countdownEnd, countdownEnd)
  const activeCountdownPosition =
    getSlideValue(activeSlide?.countdownPosition, countdownPosition) || 'right'
  const activeContent = {
    ctaLabel: getSlideValue(activeSlide?.ctaLabel, ctaLabel),
    ctaUrl: getSlideValue(activeSlide?.ctaUrl, ctaUrl),
    description: getSlideValue(activeSlide?.description, description),
    eyebrow: getSlideValue(activeSlide?.eyebrow, eyebrow),
    heading: getSlideValue(activeSlide?.heading, heading),
  }
  const hasContent =
    hasText(activeContent.eyebrow) ||
    hasText(activeContent.heading) ||
    hasText(activeContent.description) ||
    (hasText(activeContent.ctaLabel) && hasText(activeContent.ctaUrl))
  const visibleRemainingTime = activeCountdownEnd ? remainingTime : 0
  const hasCountdown = Boolean(activeCountdownEnd) && visibleRemainingTime > 0
  const countdownParts = getCountdownParts(visibleRemainingTime)

  React.useEffect(() => {
    if (!hasMultipleSlides) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, slideDuration)

    return () => window.clearInterval(timer)
  }, [hasMultipleSlides, slides.length])

  React.useEffect(() => {
    if (!activeCountdownEnd) return

    const updateRemainingTime = () => {
      setRemainingTime(getRemainingTime(activeCountdownEnd))
    }

    const frame = window.requestAnimationFrame(updateRemainingTime)
    const timer = window.setInterval(updateRemainingTime, 1000)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearInterval(timer)
    }
  }, [activeCountdownEnd])

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length)
  }

  return (
    <section
      aria-label="Featured collections"
      className="relative isolate h-[calc(100svh-4rem)] min-h-[32rem] w-full overflow-hidden bg-[var(--color-structure)]"
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div className="relative h-full min-w-full" key={`${slide.image.id}-${index}`}>
            <MediaComponent
              alt={slide.altOverride || slide.image.alt || ''}
              className="relative h-full w-full"
              fill
              imgClassName="h-full w-full object-cover"
              priority={index === 0}
              resource={slide.image}
              size="100vw"
            />
          </div>
        ))}
      </div>

      {hasContent ? (
        <div
          className={cn(
            'absolute inset-0',
            activeContentPosition === 'right'
              ? 'bg-gradient-to-l from-black/58 via-black/18 to-transparent'
              : 'bg-gradient-to-r from-black/58 via-black/18 to-transparent',
          )}
        />
      ) : null}

      {hasContent ? (
        <div className="absolute inset-x-0 bottom-0 top-0 flex items-center">
          <div className="container">
            <div
              className={cn(
                'max-w-2xl text-white',
                activeContentPosition === 'right' ? 'ml-auto text-right' : '',
              )}
            >
              {activeContent.eyebrow ? (
                <p className="mb-4 font-accent text-sm font-semibold uppercase tracking-[0.22em]">
                  {activeContent.eyebrow}
                </p>
              ) : null}
              {activeContent.heading ? (
                <h1 className="font-display text-5xl font-semibold leading-[0.95] md:text-7xl">
                  {activeContent.heading}
                </h1>
              ) : null}
              {activeContent.description ? (
                <p
                  className={cn(
                    'mt-5 max-w-xl text-base leading-7 text-white/86 md:text-lg',
                    activeContentPosition === 'right' ? 'ml-auto' : '',
                  )}
                >
                  {activeContent.description}
                </p>
              ) : null}
              {activeContent.ctaLabel && activeContent.ctaUrl ? (
                <Link
                  className="mt-8 inline-flex h-11 items-center justify-center bg-primary px-6 font-accent text-sm font-semibold uppercase text-primary-foreground transition-colors hover:bg-primary/90"
                  href={activeContent.ctaUrl}
                >
                  {activeContent.ctaLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {hasCountdown ? (
        <div
          className={cn(
            'absolute bottom-16 z-10 w-full px-4 text-white md:bottom-10',
            activeCountdownPosition === 'right' ? 'text-right' : 'text-left',
          )}
        >
          <div className="container">
            <div
              className={cn(
                'inline-grid grid-cols-4 border border-white/24 bg-black/36 text-center backdrop-blur-sm',
                activeCountdownPosition === 'right' ? 'ml-auto' : '',
              )}
            >
              {countdownParts.map((part) => (
                <div className="min-w-16 px-3 py-2 md:min-w-20 md:px-4" key={part.label}>
                  <span className="block font-display text-2xl font-semibold leading-none md:text-3xl">
                    {part.value}
                  </span>
                  <span className="mt-1 block font-accent text-[0.62rem] font-semibold uppercase text-white/72">
                    {part.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {hasMultipleSlides ? (
        <>
          <button
            aria-label="Previous poster"
            className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/50 text-white transition-colors hover:border-primary hover:text-primary md:flex"
            onClick={goToPrevious}
            type="button"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            aria-label="Next poster"
            className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/50 text-white transition-colors hover:border-primary hover:text-primary md:flex"
            onClick={goToNext}
            type="button"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((slide, index) => (
              <button
                aria-label={`Show poster ${index + 1}`}
                className={cn(
                  'h-2.5 w-2.5 rounded-full border border-white/70 transition-colors',
                  index === activeIndex ? 'bg-primary' : 'bg-white/30',
                )}
                key={`dot-${slide.image.id}-${index}`}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
