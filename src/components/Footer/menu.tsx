import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import React from 'react'

interface Props {
  menu: Footer['navItems']
}

export function FooterMenu({ menu }: Props) {
  if (!menu?.length) return null

  return (
    <nav>
      <ul className="grid gap-2">
        {menu.map((item, index) => {
          return (
            <li key={item.id || item.link.url || `${item.link.label || 'footer-link'}-${index}`}>
              <CMSLink
                appearance="link"
                className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-cta-accent)]"
                {...item.link}
              />
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
