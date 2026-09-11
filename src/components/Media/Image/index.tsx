'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/cn'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { cssVariables } from '@/cssVariables'

const { breakpoints } = cssVariables

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
    const s3BucketPathIndex = parsedURL.pathname.indexOf(s3BucketPath)

    if (s3BucketPathIndex === -1) return null

    const objectPath = parsedURL.pathname.slice(s3BucketPathIndex + s3BucketPath.length)

    if (!objectPath) return null

    return `${supabaseStoragePublicURL}/${supabaseStorageBucket}/${objectPath}${parsedURL.search}`
  } catch {
    return null
  }
}

const getMediaURL = (url: string): string => {
  if (/^https?:\/\//i.test(url)) {
    return getSupabasePublicURL(url) || url
  }

  if (url.startsWith('/')) {
    return url
  }

  return serverURL ? `${serverURL}/${url}` : url
}

export const Image: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    height: heightFromProps,
    imgClassName,
    onClick,
    onLoad: onLoadFromProps,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    width: widthFromProps,
  } = props

  const [isLoading, setIsLoading] = React.useState(true)

  let width: number | undefined | null
  let height: number | undefined | null
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const {
      alt: altFromResource,
      filename: fullFilename,
      height: fullHeight,
      url,
      width: fullWidth,
    } = resource

    width = widthFromProps ?? fullWidth
    height = heightFromProps ?? fullHeight
    alt = altFromResource

    if (url) {
      src = getMediaURL(url)
    }
  }

  // NOTE: this is used by the browser to determine which image to download at different screen sizes
  const sizes = sizeFromProps
    ? sizeFromProps
    : Object.entries(breakpoints)
        .map(([, value]) => `(max-width: ${value}px) ${value}px`)
        .join(', ')

  return (
    <NextImage
      alt={alt || ''}
      className={cn(imgClassName)}
      fill={fill}
      height={!fill ? height || heightFromProps : undefined}
      onClick={onClick}
      onLoad={() => {
        setIsLoading(false)
        if (typeof onLoadFromProps === 'function') {
          onLoadFromProps()
        }
      }}
      priority={priority}
      quality={90}
      sizes={sizes}
      src={src}
      width={!fill ? width || widthFromProps : undefined}
    />
  )
}
