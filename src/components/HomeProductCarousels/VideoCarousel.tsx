'use client'

import React from 'react'

import { Media } from '@/components/Media'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/utilities/cn'

import { ProductStoryModal } from './ProductStoryModal'
import type { ProductStorySlide } from './types'

const circularDistance = (index: number, activeIndex: number, count: number) => {
  const direct = Math.abs(index - activeIndex)
  return Math.min(direct, count - direct)
}

export function VideoCarousel({
  slides,
  whatsappNumber,
}: {
  slides: ProductStorySlide[]
  whatsappNumber?: string
}) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [activeSlide, setActiveSlide] = React.useState<ProductStorySlide | null>(null)
  const setApi = React.useCallback((api: CarouselApi) => {
    if (!api) return

    const updateActiveIndex = () => setActiveIndex(api.selectedScrollSnap())
    updateActiveIndex()
    api.on('select', updateActiveIndex)
    api.on('reInit', updateActiveIndex)
  }, [])

  if (!slides.length) return null

  return (
    <section aria-label="Product videos" className="overflow-hidden py-12 md:py-16">
      <h2 className="mb-6 text-center font-accent text-2xl font-bold text-[var(--color-text-primary)] md:text-3xl">
        Trending Looks to Watch & Shop
      </h2>
      <Carousel
        className="mx-auto max-w-7xl px-4"
        opts={{ align: 'center', loop: slides.length > 1 }}
        setApi={setApi}
      >
        <CarouselContent className="items-center">
          {slides.map((slide, index) => {
            const distance = circularDistance(index, activeIndex, slides.length)
            return (
              <CarouselItem
                className="basis-[72%] px-2 sm:basis-1/3 lg:basis-1/5 xl:basis-1/6"
                key={`${slide.video?.id}-${index}`}
              >
                <button
                  aria-label={slide.title}
                  className={cn(
                    'group relative block aspect-[9/14] w-full overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-black text-left shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg',
                    distance === 0
                      ? 'relative z-20 scale-100 opacity-100'
                      : 'relative z-10 scale-[0.92] opacity-70 md:scale-95 md:opacity-80',
                  )}
                  onClick={() => setActiveSlide(slide)}
                  type="button"
                >
                  <Media
                    className="h-full w-full"
                    resource={slide.video}
                    videoClassName="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/86 via-black/45 to-transparent p-4 pt-16">
                    <div className="flex items-end gap-3">
                      <span className="relative block h-14 w-11 shrink-0 overflow-hidden rounded-md border border-white/25 bg-black/20">
                        <Media
                          alt={slide.image.alt || slide.title}
                          className="h-full w-full"
                          fill
                          imgClassName="h-full w-full object-cover"
                          resource={slide.image}
                          size="44px"
                        />
                      </span>
                      <span className="line-clamp-3 text-base font-bold leading-tight text-white">
                        {slide.title}
                      </span>
                    </div>
                  </div>
                </button>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2 hidden border-0 bg-white shadow-md md:grid" />
        <CarouselNext className="right-2 hidden border-0 bg-white shadow-md md:grid" />
      </Carousel>

      {activeSlide ? (
        <ProductStoryModal
          mediaType="video"
          onClose={() => setActiveSlide(null)}
          slides={[activeSlide]}
          whatsappNumber={whatsappNumber}
        />
      ) : null}
    </section>
  )
}
