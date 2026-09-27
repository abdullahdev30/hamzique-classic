import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import React from 'react'

export const metadata = {
  description: 'Search for products in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

const validSorts = new Set(['title', '-createdAt', 'priceInPKR', '-priceInPKR'])

const getFirstParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0]
  return value
}

const normalizeSearchParam = (value: string | string[] | undefined, maxLength = 80) => {
  const firstValue = getFirstParam(value)?.trim()

  if (!firstValue) return undefined

  return firstValue.slice(0, maxLength)
}

const getSortValue = (value: string | string[] | undefined) => {
  const sortValue = normalizeSearchParam(value, 32)

  if (sortValue === 'latest') return '-createdAt'

  return sortValue && validSorts.has(sortValue) ? sortValue : 'title'
}

export default async function ShopPage({ searchParams }: Props) {
  const { q, sort, category } = await searchParams
  const searchValue = normalizeSearchParam(q)
  const categoryParam = normalizeSearchParam(category, 64)
  const sortValue = getSortValue(sort)
  const payload = await getPayload({ config: configPromise })
  let categoryID: number | undefined

  if (categoryParam) {
    if (/^\d+$/.test(categoryParam)) {
      categoryID = Number(categoryParam)
    } else {
      const categories = await payload.find({
        collection: 'categories',
        depth: 0,
        limit: 1,
        overrideAccess: false,
        pagination: false,
        where: {
          slug: {
            equals: categoryParam,
          },
        },
      })

      categoryID = categories.docs[0]?.id
    }
  }

  const hasUnresolvedCategory = Boolean(categoryParam && typeof categoryID !== 'number')

  const where: Where = {
    and: [
      {
        _status: {
          equals: 'published',
        },
      },
      ...(searchValue
        ? [
            {
              or: [
                {
                  title: {
                    like: searchValue,
                  },
                },
                {
                  description: {
                    like: searchValue,
                  },
                },
              ],
            },
          ]
        : []),
      ...(typeof categoryID === 'number'
        ? [
            {
              categories: {
                contains: categoryID,
              },
            },
          ]
        : []),
    ],
  }

  const products = hasUnresolvedCategory
    ? { docs: [] }
    : await payload.find({
        collection: 'products',
        depth: 1,
        draft: false,
        limit: 48,
        overrideAccess: false,
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
        sort: sortValue === 'title' ? ['-isTopVariant', 'title'] : ['-isTopVariant', sortValue],
        where,
        populate: {
          variants: {
            priceInPKR: true,
          },
        },
      })

  const resultsText = products.docs.length > 1 ? 'results' : 'result'

  return (
    <div>
      {searchValue ? (
        <p className="mb-4">
          {products.docs?.length === 0
            ? 'There are no products that match '
            : `Showing ${products.docs.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && products.docs?.length === 0 && (
        <p className="mb-4">No products found. Please try different filters.</p>
      )}

      {products?.docs.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.docs.map((product) => {
            return <ProductGridItem key={product.id} product={product} />
          })}
        </Grid>
      ) : null}
    </div>
  )
}
