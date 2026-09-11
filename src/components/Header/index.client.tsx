'use client'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { Search } from '@/components/Search'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { MobileMenu } from './MobileMenu'
import type { Header } from 'src/payload-types'

import { LogoIcon } from '@/components/icons/logo'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'
import { Heart, UserRound } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import {
  createHeaderNavItem,
  defaultNavItems,
  getCategoriesForNavItem,
  getCategoryHref,
  mergeNavItems,
  type HeaderCategory,
  type HeaderNavItem,
} from './navCategories'

type Props = {
  categories: HeaderCategory[]
  header: Header
  navigationPages: HeaderNavItem[]
}

const isActiveNavItem = (pathname: string, href: string) => {
  const hrefPath = href.split('?')[0] || '/'

  if (hrefPath === '/') return pathname === '/'

  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`)
}

export function HeaderClient({ categories, header, navigationPages }: Props) {
  const menu = header.navItems || []
  const pathname = usePathname()
  const { user } = useAuth()
  const isSeedMenu =
    menu.length === 3 &&
    menu.every((item) => ['Home', 'Shop', 'Account'].includes(item.link.label || ''))
  const useCmsMenu = menu.length > 0 && !isSeedMenu
  const baseNavItems: HeaderNavItem[] = useCmsMenu
    ? menu.map((item) => createHeaderNavItem(item.link, item.id))
    : navigationPages.length
      ? navigationPages
      : defaultNavItems
  const navItems = useCmsMenu ? mergeNavItems(baseNavItems, navigationPages) : baseNavItems

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-dominant)] text-[var(--color-text-primary)]">
      <nav aria-label="Primary navigation" className="container flex h-16 items-center gap-4">
        <div className="flex flex-none items-center gap-3">
          <div className="block md:hidden">
            <Suspense fallback={null}>
              <MobileMenu categories={categories} navItems={navItems} />
            </Suspense>
          </div>

          <Link aria-label="Hamzique Classic home" className="flex h-14 items-center" href="/">
            <LogoIcon className="scale-[0.82] sm:scale-100" />
          </Link>
        </div>

        <div className="hidden min-w-0 flex-1 items-end justify-center md:flex">
          <ul className="flex items-center gap-7 text-[0.92rem]">
            {navItems.map((item) => {
              const itemCategories = getCategoriesForNavItem(item, categories)
              const newTabProps = item.newTab
                ? { rel: 'noopener noreferrer', target: '_blank' }
                : {}

              return (
                <li className="group relative" key={item.id || item.label}>
                  <Link
                    className={cn(
                      'relative navLink block pb-4 pt-3 font-accent text-[0.92rem] leading-none text-[var(--color-text-primary)] transition-colors hover:text-primary',
                      item.strong ? 'font-bold' : 'font-medium',
                      isActiveNavItem(pathname, item.href) ? 'active' : '',
                    )}
                    href={item.href}
                    {...newTabProps}
                  >
                    {item.label}
                  </Link>

                  {itemCategories.length ? (
                    <div className="invisible absolute left-1/2 top-full w-56 -translate-x-1/2 translate-y-2 border border-[var(--color-border-subtle)] bg-[var(--color-bg-dominant)] p-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      <ul className="grid gap-1">
                        {itemCategories.map((category) => (
                          <li key={category.id}>
                            <Link
                              className="block px-3 py-2 font-accent text-xs font-semibold uppercase text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-cta-accent)]"
                              href={getCategoryHref(category)}
                              prefetch={false}
                            >
                              {category.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="ml-auto flex min-w-0 flex-none items-center justify-end gap-2 sm:gap-3">
          <Suspense fallback={null}>
            <Search
              className="hidden w-[15rem] lg:block"
              inputLabel="Search"
              placeholder="Search"
            />
          </Suspense>

          <Link
            aria-label={user ? 'My account' : 'Log in'}
            className="relative flex h-10 w-10 items-center justify-center text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-cta-accent)]"
            href={user ? '/account' : '/login'}
          >
            <UserRound className="h-6 w-6 stroke-[1.6]" />
            {user ? (
              <span className="absolute -right-1 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-cta-accent)] px-1 text-[0.7rem] font-semibold leading-none text-[var(--color-text-primary)]">
                1
              </span>
            ) : null}
          </Link>

          <Link
            aria-label="Wishlist"
            className="hidden h-10 w-10 items-center justify-center text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-cta-accent)] sm:flex"
            href="/shop?wishlist=true"
          >
            <Heart className="h-6 w-6 stroke-[1.6]" />
          </Link>

          <ThemeToggle />

          <Suspense fallback={<OpenCartButton />}>
            <Cart />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}
