'use client'

import React from 'react'

import { Media } from '@/components/Media'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/cn'

type Slide = { title: string; video: MediaType }

const circularDistance = (index: number, activeIndex: number, count: number) => {
  const direct = Math.abs(index - activeIndex)
  return Math.min(direct, count - direct)
}

export function VideoCarousel({ slides }: { slides: Slide[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0)
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
      <Carousel
        className="mx-auto max-w-6xl px-4"
        opts={{ align: 'center', loop: slides.length > 1 }}
        setApi={setApi}
      >
        <CarouselContent className="items-center">
          {slides.map((slide, index) => {
            const distance = circularDistance(index, activeIndex, slides.length)
            return (
              <CarouselItem
                className="basis-[82%] px-3 sm:basis-1/2 lg:basis-[42%]"
                key={`${slide.video.id}-${index}`}
              >
                <div
                  className={cn(
                    'aspect-video overflow-hidden border border-[var(--color-border-subtle)] bg-black transition-all duration-500',
                    distance === 0
                      ? 'relative z-20 scale-100 opacity-100 shadow-2xl'
                      : 'relative z-10 scale-[0.82] opacity-55 blur-[1.5px]',
                  )}
                >
                  <Media
                    className="h-full w-full"
                    resource={slide.video}
                    videoClassName="h-full w-full object-cover"
                  />
                  <span className="sr-only">{slide.title}</span>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
