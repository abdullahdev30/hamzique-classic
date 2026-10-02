import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'
import { revalidateTag } from 'next/cache'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'address',
      type: 'textarea',
      admin: {
        description: 'Shown below the logo in the first footer column.',
      },
      defaultValue:
        'Andaaz Fashion\nUnit 10 Watchmoor Trade Centre\nWatchmoor rd, Camberley\nSurrey GU15 3AJ\nUnited Kingdom',
      label: 'Footer address',
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Pages column links',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
    {
      name: 'infoItems',
      type: 'array',
      label: 'Info column links',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 8,
    },
  ],
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidateTag('global_footer', 'max')

        return doc
      },
    ],
  },
}
