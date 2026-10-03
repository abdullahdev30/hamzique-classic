import { canUseDOM } from './canUseDOM'

const LOCAL_SERVER_URL = 'http://localhost:3000'
const PRODUCTION_SERVER_URL =
  process.env.PRODUCTION_SERVER_URL || 'https://hamzique-classic.vercel.app'

const normalizeURL = (value: string | undefined): string | null => {
  if (!value) return null

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

const getVercelURL = (value: string | undefined): string | null => {
  if (!value) return null

  return normalizeURL(value.startsWith('http') ? value : `https://${value}`)
}

export const getServerSideURL = () => {
  if (process.env.VERCEL) {
    return (
      getVercelURL(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
      normalizeURL(PRODUCTION_SERVER_URL) ||
      PRODUCTION_SERVER_URL
    )
  }

  return (
    normalizeURL(process.env.PAYLOAD_PUBLIC_SERVER_URL) ||
    normalizeURL(process.env.NEXT_PUBLIC_SERVER_URL) ||
    LOCAL_SERVER_URL
  )
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  return getServerSideURL()
}

export const getAllowedOrigins = (): string[] => {
  const origins = [
    LOCAL_SERVER_URL,
    PRODUCTION_SERVER_URL,
    process.env.PAYLOAD_PUBLIC_SERVER_URL,
    process.env.NEXT_PUBLIC_SERVER_URL,
    getVercelURL(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    getVercelURL(process.env.VERCEL_URL),
  ]
    .map((value) => normalizeURL(value || undefined))
    .filter((value): value is string => Boolean(value))

  return [...new Set(origins)]
}
