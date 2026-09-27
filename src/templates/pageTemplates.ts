import type { ComponentType } from 'react'

import type { Page } from '@/payload-types'

import { LookbookTemplate } from './lookbook'

export const pageTemplates: Record<string, ComponentType<{ page: Page }>> = {
  lookbook: LookbookTemplate,
}
