import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { contactFormData } from './contact-form'
import { contactPageData } from './contact-page'
import { productHatData } from './product-hat'
import { productTshirtData, productTshirtVariant } from './product-tshirt'
import { homePageData } from './home'
import { imageHatData } from './image-hat'
import { imageTshirtBlackData } from './image-tshirt-black'
import { imageTshirtWhiteData } from './image-tshirt-white'
import { imageHero1Data } from './image-hero-1'
import { Address, Transaction, VariantOption } from '@/payload-types'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'products',
  'forms',
  'form-submissions',
  'variants',
  'variantOptions',
  'variantTypes',
  'carts',
  'transactions',
  'addresses',
  'orders',
]

const sizeVariantOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'X Large', value: 'xlarge' },
]

const colorVariantOptions = [
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
]

const globals: GlobalSlug[] = ['header', 'footer']

const baseAddressPakistanData: Transaction['billingAddress'] = {
  title: 'Mr.',
  firstName: 'Ali',
  lastName: 'Khan',
  phone: '+923001234567',
  company: 'Store Customer',
  addressLine1: '12 Mall Road',
  addressLine2: 'Gulberg',
  city: 'Lahore',
  state: 'Punjab',
  postalCode: '54000',
  country: 'PK',
}

const secondaryAddressPakistanData: Transaction['billingAddress'] = {
  title: 'Ms.',
  firstName: 'Ayesha',
  lastName: 'Malik',
  phone: '+923331234567',
  addressLine1: '45 Clifton Block 5',
  city: 'Karachi',
  state: 'Sindh',
  postalCode: '75600',
  country: 'PK',
}

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  for (const collection of collections) {
    await payload.db.deleteMany({ collection, req, where: {} })
    if (payload.collections[collection].config.versions) {
      await payload.db.deleteVersions({ collection, req, where: {} })
    }
  }

  payload.logger.info(`— Seeding customer and customer data...`)

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'customer@example.com',
      },
    },
  })

  payload.logger.info(`— Seeding media...`)

  const [imageHatBuffer, imageTshirtBlackBuffer, imageTshirtWhiteBuffer, heroBuffer] =
    await Promise.all([
      fetchFileByURL(
        'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/ecommerce/src/endpoints/seed/hat-logo.png',
      ),
      fetchFileByURL(
        'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/ecommerce/src/endpoints/seed/tshirt-black.png',
      ),
      fetchFileByURL(
        'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/ecommerce/src/endpoints/seed/tshirt-white.png',
      ),
      fetchFileByURL(
        'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-hero1.webp',
      ),
    ])

  const [customer, imageHat, imageTshirtBlack, imageTshirtWhite, imageHero] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'Customer',
        email: 'customer@example.com',
        password: 'password',
        roles: ['customer'],
      },
    }),
    payload.create({
      collection: 'media',
      data: imageHatData,
      file: imageHatBuffer,
    }),
    payload.create({
      collection: 'media',
      data: imageTshirtBlackData,
      file: imageTshirtBlackBuffer,
    }),
    payload.create({
      collection: 'media',
      data: imageTshirtWhiteData,
      file: imageTshirtWhiteBuffer,
    }),
    payload.create({
      collection: 'media',
      data: imageHero1Data,
      file: heroBuffer,
    }),
  ])

  payload.logger.info(`- Seeding navigation pages...`)

  const [menPage, womenPage, childPage, salesPage, newPage] = await Promise.all(
    [
      { navigationLabel: 'MEN', navigationOrder: 10, slug: 'men', title: 'Men' },
      { navigationLabel: 'WOMEN', navigationOrder: 20, slug: 'women', title: 'Women' },
      { navigationLabel: 'CHILD', navigationOrder: 30, slug: 'child', title: 'Child' },
      { navigationLabel: 'SALES', navigationOrder: 40, slug: 'sales', title: 'Sales All' },
      { navigationLabel: 'NEW', navigationOrder: 50, slug: 'new', title: 'New' },
    ].map((page) =>
      payload.create({
        collection: 'pages',
        depth: 0,
        data: {
          _status: 'published',
          hero: {
            type: 'none',
          },
          layout: [],
          meta: {
            title: page.title,
          },
          navigationLabel: page.navigationLabel,
          navigationOrder: page.navigationOrder,
          showInNavigation: true,
          slug: page.slug,
          title: page.title,
        },
      }),
    ),
  )

  const seededCategories = await Promise.all(
    [
      { key: 'menAccessories', mainPage: menPage.id, slug: 'accessories', title: 'Accessories' },
      { key: 'menTopWear', mainPage: menPage.id, slug: 'top-wear', title: 'Top Wear' },
      { key: 'menBottomWear', mainPage: menPage.id, slug: 'bottom-wear', title: 'Bottom Wear' },
      { key: 'menFootwear', mainPage: menPage.id, slug: 'footwear', title: 'Footwear' },
      { key: 'womenSuits', mainPage: womenPage.id, slug: 'suits', title: 'Suits' },
      { key: 'womenLahngas', mainPage: womenPage.id, slug: 'lahngas', title: 'Lahngas' },
      {
        key: 'womenBridalDress',
        mainPage: womenPage.id,
        slug: 'bridal-dress',
        title: 'Bridal Dress',
      },
      { key: 'womenOccasional', mainPage: womenPage.id, slug: 'occasional', title: 'Occasional' },
      { key: 'womenFestivals', mainPage: womenPage.id, slug: 'festivals', title: 'Festivals' },
      { key: 'childBoys', mainPage: childPage.id, slug: 'boys', title: 'Boys' },
      { key: 'childGirls', mainPage: childPage.id, slug: 'girls', title: 'Girls' },
      { key: 'childBaby', mainPage: childPage.id, slug: 'baby', title: 'Baby' },
      {
        key: 'childAccessories',
        mainPage: childPage.id,
        slug: 'accessories',
        title: 'Accessories',
      },
      { key: 'childFootwear', mainPage: childPage.id, slug: 'footwear', title: 'Footwear' },
      { key: 'salesPicks', mainPage: salesPage.id, slug: 'sale-picks', title: 'Sale Picks' },
    ].map(async (category) => ({
      key: category.key,
      value: await payload.create({
        collection: 'categories',
        data: {
          mainPage: category.mainPage,
          slug: category.slug,
          title: category.title,
        },
      }),
    })),
  )

  const getSeededCategory = (key: string) => {
    const category = seededCategories.find((item) => item.key === key)?.value

    if (!category) {
      throw new Error(`Seeded category missing: ${key}`)
    }

    return category
  }

  const [menAccessoriesCategory, menTopWearCategory] = [
    getSeededCategory('menAccessories'),
    getSeededCategory('menTopWear'),
  ]

  payload.logger.info(`— Seeding variant types and options...`)

  const sizeVariantType = await payload.create({
    collection: 'variantTypes',
    data: {
      name: 'size',
      label: 'Size',
    },
  })

  const sizeVariantOptionsResults: VariantOption[] = []

  for (const option of sizeVariantOptions) {
    const result = await payload.create({
      collection: 'variantOptions',
      data: {
        ...option,
        variantType: sizeVariantType.id,
      },
    })
    sizeVariantOptionsResults.push(result)
  }

  const [small, medium, large, xlarge] = sizeVariantOptionsResults

  const colorVariantType = await payload.create({
    collection: 'variantTypes',
    data: {
      name: 'color',
      label: 'Color',
    },
  })

  const [black, white] = await Promise.all(
    colorVariantOptions.map((option) => {
      return payload.create({
        collection: 'variantOptions',
        data: {
          ...option,
          variantType: colorVariantType.id,
        },
      })
    }),
  )

  payload.logger.info(`— Seeding products...`)

  const productHat = await payload.create({
    collection: 'products',
    depth: 0,
    data: productHatData({
      galleryImage: imageHat,
      metaImage: imageHat,
      variantTypes: [colorVariantType],
      categories: [menAccessoriesCategory],
      relatedProducts: [],
    }),
  })

  const productTshirt = await payload.create({
    collection: 'products',
    depth: 0,
    data: productTshirtData({
      galleryImages: [
        { image: imageTshirtBlack, variantOption: black },
        { image: imageTshirtWhite, variantOption: white },
      ],
      metaImage: imageTshirtBlack,
      contentImage: imageHero,
      variantTypes: [colorVariantType, sizeVariantType],
      categories: [menTopWearCategory],
      relatedProducts: [productHat],
    }),
  })

  let hoodieID: number | string = productTshirt.id

  if (payload.db.defaultIDType === 'text') {
    hoodieID = `"${hoodieID}"`
  }

  const [
    smallTshirtHoodieVariant,
    mediumTshirtHoodieVariant,
    largeTshirtHoodieVariant,
    xlargeTshirtHoodieVariant,
  ] = await Promise.all(
    [small, medium, large, xlarge].map((variantOption) =>
      payload.create({
        collection: 'variants',
        depth: 0,
        data: productTshirtVariant({
          product: productTshirt,
          variantOptions: [variantOption, white],
        }),
      }),
    ),
  )

  await Promise.all(
    [small, medium, large, xlarge].map((variantOption) =>
      payload.create({
        collection: 'variants',
        depth: 0,
        data: productTshirtVariant({
          product: productTshirt,
          variantOptions: [variantOption, black],
          ...(variantOption.value === 'medium' ? { inventory: 0 } : {}),
        }),
      }),
    ),
  )

  payload.logger.info(`— Seeding contact form...`)

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData(),
  })

  payload.logger.info(`— Seeding pages...`)

  const [homePage, contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      data: homePageData({
        contentImage: imageHero,
        metaImage: imageHat,
      }),
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({
        contactForm: contactForm,
      }),
    }),
  ])

  payload.logger.info(`— Seeding addresses...`)

  const customerPakistanAddress = await payload.create({
    collection: 'addresses',
    depth: 0,
    data: {
      customer: customer.id,
      ...(baseAddressPakistanData as Address),
    },
  })

  const secondaryCustomerPakistanAddress = await payload.create({
    collection: 'addresses',
    depth: 0,
    data: {
      customer: customer.id,
      ...(secondaryAddressPakistanData as Address),
    },
  })

  payload.logger.info(`— Seeding transactions...`)

  const pendingTransaction = await payload.create({
    collection: 'transactions',
    data: {
      currency: 'PKR',
      customer: customer.id,
      paymentMethod: 'cashOnDelivery',
      cashOnDelivery: {
        note: 'Payment will be collected in cash at delivery.',
      },
      status: 'pending',
      billingAddress: baseAddressPakistanData,
    },
  })

  const succeededTransaction = await payload.create({
    collection: 'transactions',
    data: {
      currency: 'PKR',
      customer: customer.id,
      paymentMethod: 'cashOnDelivery',
      cashOnDelivery: {
        note: 'Payment will be collected in cash at delivery.',
      },
      status: 'succeeded',
      billingAddress: baseAddressPakistanData,
    },
  })

  let succeededTransactionID: number | string = succeededTransaction.id

  if (payload.db.defaultIDType === 'text') {
    succeededTransactionID = `"${succeededTransactionID}"`
  }

  payload.logger.info(`— Seeding carts...`)

  // This cart is open as it's created now
  const openCart = await payload.create({
    collection: 'carts',
    data: {
      customer: customer.id,
      currency: 'PKR',
      items: [
        {
          product: productTshirt.id,
          variant: mediumTshirtHoodieVariant.id,
          quantity: 1,
        },
      ],
    },
  })

  const oldTimestamp = new Date('2023-01-01T00:00:00Z').toISOString()

  // Cart is abandoned because it was created long in the past
  const abandonedCart = await payload.create({
    collection: 'carts',
    data: {
      currency: 'PKR',
      createdAt: oldTimestamp,
      items: [
        {
          product: productHat.id,
          quantity: 1,
        },
      ],
    },
  })

  // Cart is purchased because it has a purchasedAt date
  const completedCart = await payload.create({
    collection: 'carts',
    data: {
      customer: customer.id,
      currency: 'PKR',
      purchasedAt: new Date().toISOString(),
      subtotal: 7499,
      items: [
        {
          product: productTshirt.id,
          variant: smallTshirtHoodieVariant.id,
          quantity: 1,
        },
        {
          product: productTshirt.id,
          variant: mediumTshirtHoodieVariant.id,
          quantity: 1,
        },
      ],
    },
  })

  let completedCartID: number | string = completedCart.id

  if (payload.db.defaultIDType === 'text') {
    completedCartID = `"${completedCartID}"`
  }

  payload.logger.info(`— Seeding orders...`)

  const orderInCompleted = await payload.create({
    collection: 'orders',
    data: {
      amount: 7499,
      currency: 'PKR',
      customer: customer.id,
      shippingAddress: baseAddressPakistanData,
      items: [
        {
          product: productTshirt.id,
          variant: smallTshirtHoodieVariant.id,
          quantity: 1,
        },
        {
          product: productTshirt.id,
          variant: mediumTshirtHoodieVariant.id,
          quantity: 1,
        },
      ],
      status: 'completed',
      transactions: [succeededTransaction.id],
    },
  })

  const orderInProcessing = await payload.create({
    collection: 'orders',
    data: {
      amount: 7499,
      currency: 'PKR',
      customer: customer.id,
      shippingAddress: baseAddressPakistanData,
      items: [
        {
          product: productTshirt.id,
          variant: smallTshirtHoodieVariant.id,
          quantity: 1,
        },
        {
          product: productTshirt.id,
          variant: mediumTshirtHoodieVariant.id,
          quantity: 1,
        },
      ],
      status: 'processing',
      transactions: [succeededTransaction.id],
    },
  })

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              label: 'HOME',
              reference: {
                relationTo: 'pages',
                value: homePage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'MEN',
              reference: {
                relationTo: 'pages',
                value: menPage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'WOMEN',
              reference: {
                relationTo: 'pages',
                value: womenPage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'CHILD',
              reference: {
                relationTo: 'pages',
                value: childPage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'SALES',
              reference: {
                relationTo: 'pages',
                value: salesPage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'NEW',
              reference: {
                relationTo: 'pages',
                value: newPage.id,
              },
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Shop',
              url: '/shop',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Find my order',
              url: '/find-order',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Create account',
              url: '/create-account',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Help',
              url: '/contact',
            },
          },
        ],
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
