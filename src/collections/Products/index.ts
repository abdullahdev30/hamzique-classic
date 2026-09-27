import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { slugField } from 'payload'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { DefaultDocumentIDType, Field, Where } from 'payload'

import { revalidateProduct, revalidateProductDelete } from './hooks/revalidateProduct'

type RelationshipValue = DefaultDocumentIDType | { id?: DefaultDocumentIDType } | null | undefined

type ProductFormData = {
  categories?: RelationshipValue[]
  pages?: RelationshipValue[]
}

const getRelationshipIDs = (values?: RelationshipValue[]) =>
  [
    ...new Set(
      (values || [])
        .map((value) => (typeof value === 'object' ? value?.id : value))
        .filter(Boolean),
    ),
  ] as DefaultDocumentIDType[]

const hasFieldName = (field: Field, name: string) => 'name' in field && field.name === name

const isVariantField = (field: Field) =>
  ['enableVariants', 'variantTypes', 'variants'].some((name) => hasFieldName(field, name))

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ['title', 'priceTag', 'discountPercent', 'enableVariants', '_status'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    priceInPKR: true,
    priceTag: true,
    discountPercent: true,
    sizes: true,
    colorChart: true,
    inventory: true,
    isTopVariant: true,
    showImageOnHomePage: true,
    showVideoOnHomePage: true,
    meta: true,
  },
  hooks: {
    ...defaultCollection.hooks,
    afterChange: [...(defaultCollection.hooks?.afterChange || []), revalidateProduct],
    afterDelete: [...(defaultCollection.hooks?.afterDelete || []), revalidateProductDelete],
    beforeValidate: [
      ...(defaultCollection.hooks?.beforeValidate || []),
      async ({ data, originalDoc, req }) => {
        if (!data) return data

        const productData = data as ProductFormData
        const categoryIDs = getRelationshipIDs(
          productData.categories || (originalDoc as ProductFormData)?.categories,
        )
        let pageIDs = getRelationshipIDs(
          productData.pages || (originalDoc as ProductFormData)?.pages,
        )

        if (!pageIDs.length && categoryIDs.length) {
          const categories = await req.payload.find({
            collection: 'categories',
            depth: 0,
            limit: categoryIDs.length,
            overrideAccess: false,
            pagination: false,
            where: { id: { in: categoryIDs } },
          })

          pageIDs = getRelationshipIDs(categories.docs.map((category) => category.mainPage))
          productData.pages = pageIDs
        }

        if (!categoryIDs.length) return productData

        if (!pageIDs.length) {
          throw new Error('Choose at least one page before assigning categories.')
        }

        const scopedCategories = await req.payload.find({
          collection: 'categories',
          depth: 0,
          limit: categoryIDs.length,
          overrideAccess: false,
          pagination: false,
          where: {
            and: [{ id: { in: categoryIDs } }, { mainPage: { in: pageIDs } }],
          },
        })

        if (scopedCategories.docs.length !== categoryIDs.length) {
          throw new Error('Each selected category must belong to one of the selected pages.')
        }

        return productData
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: false,
            },
            {
              name: 'gallery',
              type: 'array',
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'variantOption',
                  type: 'relationship',
                  relationTo: 'variantOptions',
                  admin: {
                    condition: (data) => {
                      return data?.enableVariants === true && data?.variantTypes?.length > 0
                    },
                  },
                  filterOptions: ({ data }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      const variantTypeIDs = data.variantTypes.map((item: any) => {
                        if (typeof item === 'object' && item?.id) {
                          return item.id
                        }
                        return item
                      }) as DefaultDocumentIDType[]

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        }

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      }

                      return query
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    }
                  },
                },
              ],
            },

            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock],
            },
            ...defaultCollection.fields.filter((field) => !isVariantField(field)),
            {
              name: 'priceTag',
              type: 'text',
              admin: {
                description:
                  'Optional short label shown with the product price, e.g. Limited deal.',
              },
              label: 'Pricing tag',
            },
            {
              name: 'discountPercent',
              type: 'number',
              admin: {
                description:
                  'Optional percentage discount shown on product cards and detail pages.',
                step: 1,
              },
              defaultValue: 0,
              label: 'Discount percent',
              max: 100,
              min: 0,
            },
            {
              name: 'showImageOnHomePage',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show image on home page',
            },
            {
              name: 'showVideoOnHomePage',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show video on home page',
            },
            {
              name: 'isTopVariant',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show at the top of product listings',
            },
            {
              name: 'sizes',
              type: 'array',
              admin: {
                description: 'Add each available size and any extra charge for that size.',
                initCollapsed: true,
              },
              fields: [
                { name: 'label', type: 'text', label: 'Size', required: true },
                {
                  name: 'extraCharge',
                  type: 'number',
                  admin: { step: 1 },
                  defaultValue: 0,
                  label: 'Extra charge',
                  min: 0,
                },
                { name: 'notes', type: 'text', label: 'Fit notes' },
              ],
              label: 'Sizes',
              labels: { plural: 'Sizes', singular: 'Size' },
            },
            {
              name: 'colorChart',
              type: 'array',
              admin: {
                description: 'Optional colors to display on the product detail page.',
                initCollapsed: true,
              },
              fields: [{ name: 'label', type: 'text', label: 'Color name', required: true }],
              label: 'Color chart',
              labels: { plural: 'Colors', singular: 'Color' },
            },
            {
              name: 'relatedProducts',
              type: 'relationship',
              filterOptions: ({ id }) => (id ? { id: { not_in: [id] } } : { id: { exists: true } }),
              hasMany: true,
              relationTo: 'products',
            },
            {
              name: 'meta',
              type: 'group',
              label: 'SEO',
              fields: [
                OverviewField({
                  titlePath: 'meta.title',
                  descriptionPath: 'meta.description',
                  imagePath: 'meta.image',
                }),
                MetaTitleField({ hasGenerateFn: true }),
                MetaImageField({ relationTo: 'media' }),
                MetaDescriptionField({}),
                PreviewField({
                  hasGenerateFn: true,
                  titlePath: 'meta.title',
                  descriptionPath: 'meta.description',
                }),
              ],
            },
          ],
          label: 'Details',
        },
        {
          fields: defaultCollection.fields.filter(isVariantField),
          label: 'Variants',
        },
        {
          fields: [
            {
              name: 'pages',
              type: 'relationship',
              hasMany: true,
              relationTo: 'pages',
              admin: { sortOptions: 'title' },
            },
          ],
          label: 'Pages',
        },
        {
          fields: [
            {
              name: 'categories',
              type: 'relationship',
              hasMany: true,
              relationTo: 'categories',
              admin: { sortOptions: '-isTopVariant' },
              filterOptions: ({ siblingData }) => {
                const pageIDs = getRelationshipIDs((siblingData as ProductFormData)?.pages)

                return pageIDs.length ? { mainPage: { in: pageIDs } } : false
              },
            },
          ],
          label: 'Categories',
        },
        {
          fields: [],
          label: 'Publish',
        },
      ],
    },
    slugField(),
  ],
})
