import Link from 'next/link'

import { getCategoryHref, type HeaderCategory } from './navCategories'

type Props = {
  categories: HeaderCategory[]
}

export function NavDropdown({ categories }: Props) {
  if (!categories.length) return null

  return (
    <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 translate-y-2 border border-[var(--color-border-subtle)] bg-[var(--color-bg-dominant)] p-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
      <ul className="grid gap-1">
        {categories.map((category) => (
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
  )
}
