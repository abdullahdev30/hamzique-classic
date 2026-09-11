import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import {
  revalidateCategoryNavigation,
  revalidateCategoryNavigationDelete,
} from './Categories/hooks/revalidateCategories'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'mainPage', 'slug'],
  },
  fields: [
    {
      name: 'mainPage',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      label: 'Main page',
      maxDepth: 1,
      relationTo: 'pages',
      validate: (value: unknown) => Boolean(value) || 'Choose a main page before saving this category.',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      disableUnique: true,
      position: undefined,
    }),
  ],
  hooks: {
    afterChange: [revalidateCategoryNavigation],
    afterDelete: [revalidateCategoryNavigationDelete],
  },
}
