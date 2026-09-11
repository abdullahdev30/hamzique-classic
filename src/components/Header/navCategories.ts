import type { Category, Header, Page } from '@/payload-types'

export type HeaderCategory = Pick<Category, 'id' | 'slug' | 'title'> & {
  mainPage?: number | Pick<Page, 'id' | 'slug' | 'title'> | null
}

type HeaderLink = NonNullable<Header['navItems']>[number]['link']

export type HeaderNavItem = {
  href: string
  id?: string | null
  label: string
  newTab?: boolean | null
  pageID?: number | string | null
  pageSlug?: string | null
  pageTitle?: string | null
  strong?: boolean
}

export const defaultNavItems: HeaderNavItem[] = [
  { href: '/', label: 'HOME', pageSlug: 'home' },
  { href: '/men', label: 'MEN', pageSlug: 'men', strong: true },
  { href: '/women', label: 'WOMEN', pageSlug: 'women', strong: true },
  { href: '/child', label: 'CHILD', pageSlug: 'child', strong: true },
  { href: '/sales', label: 'SALES', pageSlug: 'sales', strong: true },
  { href: '/new', label: 'NEW', pageSlug: 'new' },
]

export const getPageHref = (page: Pick<Page, 'slug'>): string => {
  return page.slug === 'home' ? '/' : `/${page.slug}`
}

const normalize = (value?: null | string) => {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
}

const getFirstPathSegment = (href: string) => {
  const [path] = href.split('?')
  const segment = path?.split('/').filter(Boolean)[0]

  return segment || (path === '/' ? 'home' : '')
}

export const getCategoryHref = (category: HeaderCategory) => {
  if (category.mainPage && typeof category.mainPage === 'object') {
    return `${getPageHref(category.mainPage)}/${category.slug}`
  }

  return `/shop?category=${category.id}`
}

export const createPageNavItem = (
  page: Pick<Page, 'id' | 'slug' | 'title'> & {
    navigationLabel?: string | null
  },
): HeaderNavItem => {
  return {
    href: getPageHref(page),
    label: (page.navigationLabel || page.title).toUpperCase(),
    pageID: page.id,
    pageSlug: page.slug,
    pageTitle: page.title,
  }
}

export const createHeaderNavItem = (
  link: HeaderLink,
  id?: string | null,
  strong?: boolean,
): HeaderNavItem => {
  const referenceValue = link.reference?.value
  const page = typeof referenceValue === 'object' ? referenceValue : null
  const href = page ? getPageHref(page) : link.url || '/'

  return {
    href,
    id,
    label: link.label,
    newTab: link.newTab,
    pageID: page?.id ?? (typeof referenceValue === 'number' ? referenceValue : null),
    pageSlug: page?.slug || getFirstPathSegment(href),
    pageTitle: page?.title || link.label,
    strong,
  }
}

export const getCategoriesForNavItem = (
  item: HeaderNavItem,
  categories: HeaderCategory[] = [],
): HeaderCategory[] => {
  const itemID = item.pageID ? String(item.pageID) : ''
  const itemMatches = new Set([
    normalize(item.label),
    normalize(item.pageSlug),
    normalize(item.pageTitle),
    normalize(getFirstPathSegment(item.href)),
  ])

  return categories.filter((category) => {
    const mainPage = category.mainPage

    if (!mainPage) return false

    if (typeof mainPage === 'number') {
      return itemID === String(mainPage)
    }

    return (
      itemID === String(mainPage.id) ||
      itemMatches.has(normalize(mainPage.slug)) ||
      itemMatches.has(normalize(mainPage.title))
    )
  })
}

export const mergeNavItems = (
  baseItems: HeaderNavItem[],
  pageItems: HeaderNavItem[],
): HeaderNavItem[] => {
  const seen = new Set<string>()
  const merged: HeaderNavItem[] = []

  for (const item of [...baseItems, ...pageItems]) {
    const key = item.pageID
      ? `id:${item.pageID}`
      : `slug:${item.pageSlug || getFirstPathSegment(item.href)}`

    if (seen.has(key)) continue

    seen.add(key)
    merged.push(item)
  }

  return merged
}
