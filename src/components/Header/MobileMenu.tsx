'use client'

import { Search } from '@/components/Search'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LogoIcon } from '@/components/icons/logo'
import { useAuth } from '@/providers/Auth'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {
  getCategoryHref,
  getCategoriesForNavItem,
  type HeaderCategory,
  type HeaderNavItem,
} from './navCategories'

interface Props {
  categories: HeaderCategory[]
  navItems: HeaderNavItem[]
}

export function MobileMenu({ categories, navItems }: Props) {
  const { user } = useAuth()

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsOpen(false)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname, searchParams])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-10 w-10 items-center justify-center border border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-cta-accent)]">
        <MenuIcon className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent side="left" className="gap-6 border-[var(--color-border-subtle)] px-4">
        <SheetHeader className="px-0 pb-0 pt-5">
          <SheetTitle>
            <LogoIcon className="scale-90 origin-left" />
          </SheetTitle>

          <SheetDescription />
        </SheetHeader>

        <React.Suspense fallback={null}>
          <Search inputLabel="Search" placeholder="Search" />
        </React.Suspense>

        <div>
          <ul className="flex w-full flex-col divide-y divide-[var(--color-border-subtle)]">
            {navItems.map((item) => {
              const itemCategories = getCategoriesForNavItem(item, categories)
              const newTabProps = item.newTab
                ? { rel: 'noopener noreferrer', target: '_blank' }
                : {}

              return (
                <li className="py-3" key={item.id || item.label}>
                  <Link
                    className="font-accent text-base font-semibold uppercase text-[var(--color-text-primary)] transition-colors hover:text-primary"
                    href={item.href}
                    {...newTabProps}
                  >
                    {item.label}
                  </Link>

                  {itemCategories.length ? (
                    <ul className="mt-3 grid gap-1 border-l border-[var(--color-border-subtle)] pl-3">
                      {itemCategories.map((category) => (
                        <li key={category.id}>
                          <Link
                            className="block py-1.5 font-accent text-sm font-semibold uppercase text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-cta-accent)]"
                            href={getCategoryHref(category)}
                            prefetch={false}
                          >
                            {category.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>

        {user ? (
          <div className="mt-auto">
            <h2 className="mb-4 font-display text-xl">My account</h2>
            <hr className="my-2 border-[var(--color-border-subtle)]" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/orders">Orders</Link>
              </li>
              <li>
                <Link href="/account/addresses">Addresses</Link>
              </li>
              <li>
                <Link href="/account">Manage account</Link>
              </li>
              <li className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/logout">Log out</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mt-auto">
            <h2 className="mb-4 font-display text-xl">My account</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild className="w-full sm:flex-1" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="w-full sm:flex-1">
                <Link href="/create-account">Create an account</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
