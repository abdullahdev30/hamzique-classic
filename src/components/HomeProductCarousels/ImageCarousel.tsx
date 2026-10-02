'use client'

import AutoScroll from 'embla-carousel-auto-scroll'
import React from 'react'

import { Media } from '@/components/Media'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

import { ProductStoryModal } from './ProductStoryModal'
import type { ProductStorySlide } from './types'

export function ImageCarousel({
  slides,
  whatsappNumber,
}: {
  slides: ProductStorySlide[]
  whatsappNumber?: string
}) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  if (!slides.length) return null

  return (
    <section aria-label="Featured product images" className="container py-10 md:py-12">
      <h2 className="mb-6 text-center font-accent text-2xl font-bold text-[var(--color-text-primary)] md:text-3xl">
        Top Seller
      </h2>
      <Carousel
        className="relative"
        opts={{ align: 'start', loop: slides.length > 6 }}
        plugins={[
          AutoScroll({
            playOnInit: true,
            speed: 0.8,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem
              className="basis-[72%] sm:basis-1/3 lg:basis-1/5 xl:basis-1/6"
              key={`${slide.slug}-${slide.image.id}-${index}`}
            >
              <button
                aria-label={slide.title}
                className="group relative block aspect-[9/14] w-full overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)] text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <Media
                  alt={slide.image.alt || slide.title}
                  className="h-full w-full"
                  fill
                  imgClassName="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  resource={slide.image}
                  size="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 33vw, 72vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/82 via-black/40 to-transparent p-4 pt-16">
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
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 hidden border-0 bg-white shadow-md md:grid" />
        <CarouselNext className="right-2 hidden border-0 bg-white shadow-md md:grid" />
      </Carousel>

      {activeIndex !== null ? (
        <ProductStoryModal
          initialIndex={activeIndex}
          mediaType="image"
          onClose={() => setActiveIndex(null)}
          slides={slides}
          whatsappNumber={whatsappNumber}
        />
      ) : null}
    </section>
  )
}
