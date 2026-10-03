import type { ReactNode } from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Providers } from '@/providers'
import { GeistMono } from 'geist/font/mono'
import { Playfair_Display, Plus_Jakarta_Sans, Poppins, Tangerine } from 'next/font/google'
import React from 'react'
import './globals.css'

// The storefront depends on live Payload content and is rendered with SSR. This keeps
// database work out of Vercel's build phase and serves the current published content.
export const dynamic = 'force-dynamic'

/* const { SITE_NAME, TWITTER_CREATOR, TWITTER_SITE } = process.env
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000'
const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined
 */
/* export const metadata = {
  metadataBase: new URL(baseUrl),
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: 'summary_large_image',
        creator: twitterCreator,
        site: twitterSite,
      },
    }),
} */

const plusJakarta = Plus_Jakarta_Sans({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})

const playfair = Playfair_Display({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-playfair',
})

const poppins = Poppins({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
})

const tangerine = Tangerine({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-tangerine',
  weight: ['400', '700'],
})

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={[
        plusJakarta.variable,
        playfair.variable,
        poppins.variable,
        tangerine.variable,
        GeistMono.variable,
      ]
        .filter(Boolean)
        .join(' ')}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link href="/api/media/file/hat-logo.png" rel="icon" type="image/png" />
      </head>
      <body>
        <Providers>
          <LivePreviewListener />

          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
