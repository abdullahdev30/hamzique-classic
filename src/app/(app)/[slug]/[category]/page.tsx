import type { Metadata } from 'next'

import { CategoryProductSection, getCategoriesForPage } from '@/components/CategoryProductSection'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import configPromise from '@payload-config'
import type { Category } from '@/payload-types'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

type Args = {
  params: Promise<{
    category: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      mainPage: true,
      slug: true,
    },
    where: {
      mainPage: {
        exists: true,
      },
    },
  })

  return categories.docs
    .map((category) => {
      const mainPage = typeof category.mainPage === 'object' ? category.mainPage : null

      if (!mainPage?.slug || mainPage.slug === 'home') return null

      return {
        category: category.slug,
        slug: mainPage.slug,
      }
    })
    .filter((param): param is { category: string; slug: string } => Boolean(param))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { category: categorySlug, slug } = await params
  const { category, page } = await queryPageAndCategory({ categorySlug, slug })

  if (!page || !category) return notFound()

  return {
    description: category.title
      ? `Shop ${category.title} products in ${page.title}.`
      : page.meta?.description || '',
    title: `${category.title} | ${page.title}`,
  }
}

export default async function CategoryPage({ params }: Args) {
  const { category: categorySlug, slug } = await params
  const { category, page } = await queryPageAndCategory({ categorySlug, slug })

  if (!page || !category) return notFound()

  return (
    <article>
      <RenderHero {...page.hero} />
      <RenderBlocks blocks={page.layout} />
      <CategoryProductSection page={page} selectedCategory={category.slug} />
    </article>
  )
}

const queryPageAndCategory = async ({
  categorySlug,
  slug,
}: {
  categorySlug: string
  slug: string
}) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const pageResult = await payload.find({
    collection: 'pages',
    depth: 1,
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

  const page = pageResult.docs[0]

  if (!page) {
    return {
      category: null,
      page: null,
    }
  }

  const categories = await getCategoriesForPage(page.id)
  const category =
    categories.docs.find(
      (doc: Category) => doc.slug === categorySlug || String(doc.id) === categorySlug,
    ) || null

  return {
    category,
    page,
  }
}
