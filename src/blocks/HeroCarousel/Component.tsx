import type { DefaultDocumentIDType } from 'payload'
import { getPayload } from 'payload'
import React from 'react'

import configPromise from '@payload-config'
import type { HeroCarouselBlock as HeroCarouselBlockProps, Media } from '@/payload-types'

import { HeroCarouselClient } from './Component.client'

type Slide = {
  altOverride?: string | null
  contentPosition?: 'left' | 'right' | null
  countdownEnd?: string | null
  countdownPosition?: 'left' | 'right' | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  description?: string | null
  eyebrow?: string | null
  heading?: string | null
  image: Media
}

export const HeroCarouselBlock: React.FC<
  HeroCarouselBlockProps & {
    id?: DefaultDocumentIDType
  }
> = async (props) => {
  const {
    ctaLabel,
    ctaUrl,
    description,
    eyebrow,
    heading,
    contentPosition,
    countdownEnd,
    countdownPosition,
    limit = 5,
    populateBy,
    slides: selectedSlides,
  } = props

  let slides: Slide[] = []

  if (populateBy === 'selection' && selectedSlides?.length) {
    slides = selectedSlides.reduce<Slide[]>((acc, slide) => {
      if (slide.image && typeof slide.image === 'object') {
        acc.push({
          altOverride: slide.altOverride,
          contentPosition: slide.contentPosition,
          countdownEnd: slide.countdownEnd,
          countdownPosition: slide.countdownPosition,
          ctaLabel: slide.ctaLabel,
          ctaUrl: slide.ctaUrl,
          description: slide.description,
          eyebrow: slide.eyebrow,
          heading: slide.heading,
          image: slide.image,
        })
      }

      return acc
    }, [])
  } else {
    const payload = await getPayload({ config: configPromise })
    const media = await payload.find({
      collection: 'media',
      limit: limit || 5,
      pagination: false,
      sort: '-createdAt',
      where: {
        mimeType: {
          contains: 'image',
        },
      },
    })

    slides = media.docs
      .filter((doc): doc is Media => Boolean(doc?.url))
      .map((image) => ({
      image,
    }))
  }

  if (!slides.length) return null

  return (
    <HeroCarouselClient
      ctaLabel={ctaLabel}
      ctaUrl={ctaUrl}
      description={description}
      eyebrow={eyebrow}
      heading={heading}
      contentPosition={contentPosition}
      countdownEnd={countdownEnd}
      countdownPosition={countdownPosition}
      slides={slides}
    />
  )
}
