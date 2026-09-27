import type { Category, Page, Product } from '@/payload-types'

import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

type Props = {
  page: Page
  selectedCategory?: string
}

const getPageHref = (page: Pick<Page, 'slug'>) => {
  return page.slug === 'home' ? '/' : `/${page.slug}`
}

const getCategoryHref = (page: Pick<Page, 'slug'>, category: Pick<Category, 'slug'>) => {
  return `${getPageHref(page)}/${category.slug}`
}

export const getCategoriesForPage = async (pageID: number) => {
  const payload = await getPayload({ config: configPromise })

  return payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: ['-isTopVariant', 'title'],
    where: {
      mainPage: {
        equals: pageID,
      },
    },
  })
}

export const CategoryProductSection = async ({ page, selectedCategory }: Props) => {
  const payload = await getPayload({ config: configPromise })
  const categories = await getCategoriesForPage(page.id)

  if (!categories.docs.length) return null

  const activeCategory = selectedCategory
    ? categories.docs.find((category) => {
        return String(category.id) === selectedCategory || category.slug === selectedCategory
      })
    : undefined

  if (selectedCategory && !activeCategory) return null

  const categoryIDs = activeCategory
    ? [activeCategory.id]
    : categories.docs.map((category) => category.id)

  const products = await payload.find({
    collection: 'products',
    depth: 1,
    draft: false,
    limit: 24,
    overrideAccess: false,
    pagination: false,
    populate: {
      variants: {
        priceInPKR: true,
      },
    },
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInPKR: true,
      priceTag: true,
      discountPercent: true,
      variants: true,
    },
    sort: ['-isTopVariant', '-createdAt'],
    where: {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        {
          categories: {
            in: categoryIDs,
          },
        },
      ],
    },
  })

  const pageHref = getPageHref(page)

  return (
    <section className="container my-16">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {activeCategory ? activeCategory.title : `Shop ${page.title}`}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {activeCategory
              ? `Products in ${activeCategory.title}.`
              : `All products connected to ${page.title}.`}
          </p>
        </div>
        <nav aria-label={`${page.title} categories`}>
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                aria-current={!activeCategory ? 'page' : undefined}
                className="rounded-full border border-[var(--color-border-subtle)] px-3 py-2 text-sm font-semibold aria-current:bg-[var(--color-text-primary)] aria-current:text-[var(--color-bg-dominant)]"
                href={pageHref}
              >
                All
              </Link>
            </li>
            {categories.docs.map((category) => (
              <li key={category.id}>
                <Link
                  aria-current={activeCategory?.id === category.id ? 'page' : undefined}
                  className="rounded-full border border-[var(--color-border-subtle)] px-3 py-2 text-sm font-semibold aria-current:bg-[var(--color-text-primary)] aria-current:text-[var(--color-bg-dominant)]"
                  href={getCategoryHref(page, category)}
                >
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {products.docs.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.docs.map((product) => (
            <ProductGridItem key={product.id} product={product as Product} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-secondary)]">
          No products are connected to this category yet.
        </p>
      )}
    </section>
  )
}
