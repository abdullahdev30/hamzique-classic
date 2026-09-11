import type { Block } from 'payload'

const positionOptions = [
  {
    label: 'Left',
    value: 'left',
  },
  {
    label: 'Right',
    value: 'right',
  },
]

export const HeroCarousel: Block = {
  slug: 'heroCarousel',
  interfaceName: 'HeroCarouselBlock',
  labels: {
    plural: 'Hero Carousels',
    singular: 'Hero Carousel',
  },
  fields: [
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'allMedia',
      label: 'Images to show',
      options: [
        {
          label: 'All uploaded media images',
          value: 'allMedia',
        },
        {
          label: 'Individual poster selection',
          value: 'selection',
        },
      ],
      required: true,
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'allMedia',
        step: 1,
      },
      defaultValue: 5,
      label: 'Maximum posters',
      min: 1,
    },
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Fallback eyebrow',
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Fallback heading',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Fallback description',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'Fallback button label',
    },
    {
      name: 'ctaUrl',
      type: 'text',
      label: 'Fallback button URL',
    },
    {
      name: 'contentPosition',
      type: 'select',
      defaultValue: 'left',
      label: 'Fallback content position',
      options: positionOptions,
    },
    {
      name: 'countdownEnd',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      label: 'Fallback countdown end time',
    },
    {
      name: 'countdownPosition',
      type: 'select',
      defaultValue: 'right',
      label: 'Fallback countdown position',
      options: positionOptions,
    },
    {
      name: 'slides',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'altOverride',
          type: 'text',
          label: 'Alt text override',
        },
        {
          name: 'eyebrow',
          type: 'text',
          label: 'Eyebrow',
        },
        {
          name: 'heading',
          type: 'text',
          label: 'Heading',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
        {
          name: 'ctaLabel',
          type: 'text',
          label: 'Button label',
        },
        {
          name: 'ctaUrl',
          type: 'text',
          label: 'Button URL',
        },
        {
          name: 'contentPosition',
          type: 'select',
          defaultValue: 'left',
          label: 'Content position',
          options: positionOptions,
        },
        {
          name: 'countdownEnd',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
          label: 'Countdown end time',
        },
        {
          name: 'countdownPosition',
          type: 'select',
          defaultValue: 'right',
          label: 'Countdown position',
          options: positionOptions,
        },
      ],
      label: 'Posters',
      minRows: 1,
    },
  ],
}
