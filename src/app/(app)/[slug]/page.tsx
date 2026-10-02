import type { Metadata } from 'next'

import { CategoryProductSection } from '@/components/CategoryProductSection'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { homeStaticData } from '@/endpoints/seed/home-static'
import React from 'react'

import type { Page } from '@/payload-types'
import { notFound } from 'next/navigation'
import { pageTemplates } from '@/templates/pageTemplates'
import { HomeProductCarousels } from '@/components/HomeProductCarousels'
import { StaticInfoPage, staticInfoPages } from '@/components/StaticInfoPage'

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const pages = await payload.find({
      collection: 'pages',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    const params = pages.docs
      ?.filter((doc) => {
        return doc.slug !== 'home'
      })
      .map(({ slug }) => {
        return { slug }
      })

    return params
  } catch (error) {
    console.error('Failed to generate page static params:', error)
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
  searchParams?: Promise<{
    category?: string | string[]
  }>
}

const getFirstParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0]
  return value
}

const normalizeCategoryParam = (value?: string | string[]) => {
  const category = getFirstParam(value)?.trim()

  return category ? category.slice(0, 64) : undefined
}

export default async function Page({ params, searchParams }: Args) {
  const { slug = 'home' } = await params
  const selectedCategory = normalizeCategoryParam((await searchParams)?.category)

  let page = await queryPageBySlug({
    slug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStaticData() as Page
  }

  if (!page && staticInfoPages[slug]) {
    return (
      <article>
        <StaticInfoPage page={staticInfoPages[slug]} />
      </article>
    )
  }

  if (!page) {
    return notFound()
  }

  const { hero, layout } = page
  const Template = pageTemplates[page.slug]
  const isHomePage = page.slug === 'home'
  const faqBlocks = isHomePage ? layout?.filter((block) => block.blockType === 'faq') : []
  const heroCarouselBlocks = isHomePage
    ? layout?.filter((block) => block.blockType === 'heroCarousel')
    : []
  const contentBlocks = isHomePage
    ? layout?.filter((block) => block.blockType !== 'faq' && block.blockType !== 'heroCarousel')
    : layout

  return (
    <article>
      {Template ? (
        <Template page={page} />
      ) : (
        <>
          <RenderHero {...hero} />
          {isHomePage ? <RenderBlocks blocks={heroCarouselBlocks} /> : null}
          {isHomePage ? <HomeProductCarousels /> : null}
          {isHomePage ? (
            <div id="faq">
              <RenderBlocks blocks={faqBlocks} />
            </div>
          ) : null}
          <RenderBlocks blocks={contentBlocks} />
        </>
      )}
      <CategoryProductSection page={page} selectedCategory={selectedCategory} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params

  const page = await queryPageBySlug({
    slug,
  })

  if (!page && staticInfoPages[slug]) {
    return {
      title: staticInfoPages[slug].title,
    }
  }

  if (!page && slug === 'home') {
    return generateMeta({ doc: homeStaticData() as Page })
  }

  if (!page) {
    return {
      title: 'Storefront',
    }
  }

  return generateMeta({ doc: page })
}

const queryPageBySlug = async ({ slug }: { slug: string }) => {
  try {
    const { isEnabled: draft } = await draftMode()

    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'pages',
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          ...(draft ? [] : [{ _status: { equals: 'published' } }]),
        ],
      },
    })

    return result.docs?.[0] || null
  } catch (error) {
    console.error(`Failed to load page "${slug}":`, error)
    return null
  }
}
