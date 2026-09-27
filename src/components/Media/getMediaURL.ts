const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || ''
const supabaseStoragePublicURL = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PUBLIC_URL?.replace(
  /\/$/,
  '',
)
const supabaseStorageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'images'

const getSupabasePublicURL = (url: string): string | null => {
  if (!supabaseStoragePublicURL) return null

  try {
    const parsedURL = new URL(url)
    const s3BucketPath = `/storage/v1/s3/${supabaseStorageBucket}/`
    const objectPath = parsedURL.pathname.split(s3BucketPath)[1]

    return objectPath
      ? `${supabaseStoragePublicURL}/${supabaseStorageBucket}/${objectPath}${parsedURL.search}`
      : null
  } catch {
    return null
  }
}

export const getMediaURL = (url: string): string => {
  if (/^https?:\/\//i.test(url)) return getSupabasePublicURL(url) || url
  if (url.startsWith('/')) return url

  return serverURL ? `${serverURL}/${url}` : url
}
