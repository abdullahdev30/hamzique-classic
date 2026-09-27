'use client'

import AutoScroll from 'embla-carousel-auto-scroll'
import Link from 'next/link'

import { Media } from '@/components/Media'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import type { Media as MediaType } from '@/payload-types'

type Slide = { image: MediaType; slug: string; title: string }

export function ImageCarousel({ slides }: { slides: Slide[] }) {
  if (!slides.length) return null

  return (
    <section aria-label="Featured products" className="container py-10 md:py-12">
      <Carousel
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
              className="basis-[68%] sm:basis-1/3 lg:basis-1/5 xl:basis-1/6"
              key={`${slide.slug}-${slide.image.id}-${index}`}
            >
              <Link
                aria-label={slide.title}
                className="block aspect-[4/5] overflow-hidden border border-[var(--color-border-subtle)]"
                href={`/products/${slide.slug}`}
              >
                <Media
                  alt={slide.image.alt || slide.title}
                  className="h-full w-full"
                  fill
                  imgClassName="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  resource={slide.image}
                  size="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 33vw, 68vw"
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
