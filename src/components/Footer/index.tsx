import type { Footer } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { LogoIcon } from '@/components/icons/logo'

const { SITE_NAME } = process.env

const defaultInfoItems: NonNullable<Footer['infoItems']> = [
  {
    link: {
      type: 'custom',
      label: 'About Us',
      url: '/about-us',
    },
  },
  {
    link: {
      type: 'custom',
      label: 'Privacy Policy',
      url: '/privacy-policy',
    },
  },
  {
    link: {
      type: 'custom',
      label: 'Terms and Conditions',
      url: '/terms-and-conditions',
    },
  },
  {
    link: {
      type: 'custom',
      label: 'FAQs',
      url: '/#faq',
    },
  },
]

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()
  const pageLinks = footer.navItems || []
  const infoLinks = footer.infoItems?.length ? footer.infoItems : defaultInfoItems
  const addressLines = (footer.address || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')

  const copyrightName = 'Hamzique Classic'

  return (
    <footer className="bg-[var(--color-bg-dominant)] text-sm text-[var(--color-text-secondary)]">
      <div className="container">
        <div className="grid w-full gap-10 border-t border-[var(--color-border-subtle)] py-12 text-sm md:grid-cols-[1.2fr_1fr_1fr] md:gap-12">
          <div className="space-y-5">
            <Link
              aria-label="Hamzique Classic home"
              className="flex items-center gap-2 text-[var(--color-text-primary)] md:pt-1"
              href="/"
            >
              <LogoIcon className="scale-90 origin-left" />
              <span className="sr-only">{SITE_NAME}</span>
            </Link>
            {addressLines.length ? (
              <address className="not-italic leading-7 text-[var(--color-text-secondary)]">
                {addressLines.map((line) => (
                  <span className="block" key={line}>
                    {line}
                  </span>
                ))}
              </address>
            ) : null}
          </div>
          <div>
            <h2 className="mb-4 font-accent text-base font-bold uppercase tracking-wide text-[var(--color-text-primary)]">
              Pages
            </h2>
            <FooterMenu menu={pageLinks} />
          </div>
          <div>
            <h2 className="mb-4 font-accent text-base font-bold uppercase tracking-wide text-[var(--color-text-primary)]">
              Info
            </h2>
            <FooterMenu menu={infoLinks} />
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-border-subtle)] py-6 text-sm">
        <div className="container mx-auto flex w-full flex-col items-center gap-1 md:flex-row md:gap-0">
          <p>
            &copy; {copyrightDate} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''} All rights reserved.
          </p>
          <hr className="mx-4 hidden h-4 w-px border-l border-[var(--color-border-subtle)] md:inline-block" />
          <p>Curated classic essentials</p>
        </div>
      </div>
    </footer>
  )
}
