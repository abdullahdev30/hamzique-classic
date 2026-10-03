import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { CustomerComments } from '@/collections/CustomerComments'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { getAllowedOrigins, getServerSideURL } from '@/utilities/getURL'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const usesSupabaseTransactionPooler = process.env.USE_SUPABASE_TRANSACTION_POOLER === 'true'
const minimumPoolMax = usesSupabaseTransactionPooler ? 5 : 2
const configuredPoolMax = Number(process.env.DATABASE_POOL_MAX || minimumPoolMax)
const databasePoolMax =
  Number.isFinite(configuredPoolMax) && configuredPoolMax > 0
    ? Math.max(Math.floor(configuredPoolMax), minimumPoolMax)
    : minimumPoolMax

const getDatabaseURL = (): string => {
  const databaseURL = process.env.DATABASE_URL || ''

  if (!usesSupabaseTransactionPooler) return databaseURL

  try {
    const url = new URL(databaseURL)

    if (url.hostname.endsWith('.pooler.supabase.com') && url.port === '5432') {
      url.port = '6543'
    }

    return url.toString()
  } catch {
    return databaseURL
  }
}

const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASSWORD &&
  process.env.SMTP_FROM_EMAIL,
)
const serverURL = getServerSideURL()
const allowedOrigins = getAllowedOrigins()

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
    },
    user: Users.slug,
  },
  collections: [Users, Pages, Categories, CustomerComments, Media],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  db: postgresAdapter({
    pool: {
      connectionString: getDatabaseURL(),
      max: databasePoolMax,
    },
    push: false,
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  email: smtpConfigured
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM_EMAIL || '',
        defaultFromName: process.env.SMTP_FROM_NAME || 'Hamzique Classic',
        // Avoid an SMTP round-trip during every serverless cold start. Delivery errors are
        // still reported by sendEmail and handled by the caller.
        skipVerify: true,
        transportOptions: {
          auth: {
            pass: process.env.SMTP_PASSWORD || '',
            user: process.env.SMTP_USER || '',
          },
          host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
          port: Number.isFinite(smtpPort) ? smtpPort : 587,
          requireTLS: process.env.SMTP_REQUIRE_TLS !== 'false',
          secure: process.env.SMTP_SECURE === 'true',
        },
      })
    : undefined,
  endpoints: [],
  globals: [Header, Footer],
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
