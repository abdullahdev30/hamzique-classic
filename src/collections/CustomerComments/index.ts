import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'

import {
  revalidateCustomerComments,
  revalidateCustomerCommentsDelete,
} from './hooks/revalidateCustomerComments'

export const CustomerComments: CollectionConfig = {
  slug: 'customer-comments',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  admin: {
    defaultColumns: ['customerName', 'rating', 'sortOrder', '_status'],
    group: 'Content',
    useAsTitle: 'customerName',
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      label: 'Customer name',
      required: true,
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      admin: {
        description: 'Shown as stars on the storefront.',
        step: 1,
      },
      defaultValue: 5,
      max: 5,
      min: 1,
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
        step: 1,
      },
      defaultValue: 50,
      label: 'Sort order',
    },
  ],
  hooks: {
    afterChange: [revalidateCustomerComments],
    afterDelete: [revalidateCustomerCommentsDelete],
  },
  versions: {
    drafts: true,
  },
}
