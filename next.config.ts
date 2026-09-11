import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const S3_BUCKET = process.env.S3_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'images'

const getRemotePattern = (value: string | undefined, pathname?: string) => {
  if (!value) return null

  try {
    const url = new URL(value)

    return {
      hostname: url.hostname,
      pathname,
      port: url.port,
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
    }
  } catch {
    return null
  }
}

const getStoragePathname = (value: string | undefined, bucket: string) => {
  if (!value) return undefined

  try {
    const url = new URL(value)
    const pathname = url.pathname.replace(/\/$/, '')

    return `${pathname}/${bucket}/**`
  } catch {
    return undefined
  }
}

const remotePatterns = [
  getRemotePattern(NEXT_PUBLIC_SERVER_URL),
  getRemotePattern(
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PUBLIC_URL,
    getStoragePathname(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PUBLIC_URL, S3_BUCKET),
  ),
  getRemotePattern(process.env.S3_ENDPOINT, getStoragePathname(process.env.S3_ENDPOINT, S3_BUCKET)),
].filter((pattern): pattern is NonNullable<typeof pattern> => Boolean(pattern))

const nextConfig: NextConfig = {
  // Temporarily required on Windows until Next.js fixes Turbopack Sass resolution.
  // See: https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    qualities: [90, 100],
    remotePatterns,
  },
  reactStrictMode: true,
  redirects,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig)
