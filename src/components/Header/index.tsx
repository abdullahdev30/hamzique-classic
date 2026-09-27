import { getCachedGlobal } from '@/utilities/getGlobals'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import './index.css'
import { HeaderClient } from './index.client'
import { createPageNavItem, type HeaderCategory, type HeaderNavItem } from './navCategories'

const getCachedHeaderCategories = unstable_cache(
  async (): Promise<HeaderCategory[]> => {
    const payload = await getPayload({ config: configPromise })
    const categories = await payload.find({
      collection: 'categories',
      depth: 1,
      limit: 100,
      pagination: false,
      sort: ['-isTopVariant', 'title'],
      where: {
        mainPage: {
          exists: true,
        },
      },
    })

    return categories.docs.map((category) => ({
      id: category.id,
      mainPage: category.mainPage,
      slug: category.slug,
      title: category.title,
    }))
  },
  ['header-categories'],
  {
    tags: ['categories'],
  },
)

const getCachedNavigationPages = unstable_cache(
  async (): Promise<HeaderNavItem[]> => {
    const payload = await getPayload({ config: configPromise })
    const pages = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 20,
      overrideAccess: false,
      pagination: false,
      sort: 'navigationOrder',
      select: {
        id: true,
        navigationLabel: true,
        slug: true,
        title: true,
      },
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          {
            showInNavigation: {
              equals: true,
            },
          },
        ],
      },
    })

    return pages.docs.map((page) => createPageNavItem(page))
  },
  ['header-pages'],
  {
    tags: ['header-pages'],
  },
)

export async function Header() {
  const [header, categories, navigationPages] = await Promise.all([
    getCachedGlobal('header', 1)(),
    getCachedHeaderCategories(),
    getCachedNavigationPages(),
  ])

  return <HeaderClient categories={categories} header={header} navigationPages={navigationPages} />
}
