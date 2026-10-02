import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import type { Field, Plugin, SelectField } from 'payload'

import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { Media } from '@/collections/Media'
import { ProductsCollection } from '@/collections/Products'
import { CURRENCIES_CONFIG, SUPPORTED_COUNTRIES } from '@/lib/ecommerceDefaults'
import { Page, Product } from '@/payload-types'
import { cashOnDeliveryAdapter } from '@/payments/cashOnDelivery'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Hamzique Classic` : 'Hamzique Classic'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const s3Bucket = process.env.S3_BUCKET || 'images'
const s3Endpoint = process.env.S3_ENDPOINT
const s3StorageEnabled = Boolean(
  s3Endpoint &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY &&
  process.env.S3_REGION,
)

const orderStatusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const plugins: Plugin[] = [
  s3Storage({
    alwaysInsertFields: true,
    bucket: s3Bucket,
    collections: {
      [Media.slug]: true,
    },
    config: {
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
      endpoint: s3Endpoint,
      forcePathStyle: true,
      region: process.env.S3_REGION || 'local',
    },
    disableLocalStorage: true,
    enabled: s3StorageEnabled,
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
      },
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
        create: isAdmin,
      },
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    customers: {
      slug: 'users',
    },
    addresses: {
      supportedCountries: SUPPORTED_COUNTRIES,
    },
    currencies: CURRENCIES_CONFIG,
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: {
          ...defaultCollection.admin,
          defaultColumns: ['createdAt', 'status', 'customerEmail', 'amount'],
        },
        fields: [
          ...defaultCollection.fields.map((field): Field => {
            if ('name' in field && field.name === 'status') {
              const statusField = field as SelectField

              return {
                ...statusField,
                defaultValue: 'pending',
                options: orderStatusOptions,
              } as SelectField
            }

            return field
          }),
          {
            name: 'accessToken',
            type: 'text',
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID()
                  }
                  return value
                },
              ],
            },
          },
        ],
      }),
    },
    payments: {
      paymentMethods: [cashOnDeliveryAdapter()],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
  }),
]
