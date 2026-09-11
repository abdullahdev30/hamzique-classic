import type {
  CurrenciesConfig,
  Currency,
  PaymentAdapterClient,
} from '@payloadcms/plugin-ecommerce/types'

export const PKR: Currency = {
  code: 'PKR',
  decimals: 0,
  label: 'Pakistani Rupee',
  symbol: 'Rs',
  symbolDisplay: 'symbol',
}

export const CURRENCIES_CONFIG: CurrenciesConfig = {
  defaultCurrency: PKR.code,
  supportedCurrencies: [PKR],
}

export const PAKISTAN_COUNTRY = {
  label: 'Pakistan',
  value: 'PK',
}

export const SUPPORTED_COUNTRIES = [PAKISTAN_COUNTRY]

export const CASH_ON_DELIVERY_PAYMENT_METHOD: PaymentAdapterClient = {
  confirmOrder: true,
  initiatePayment: true,
  label: 'Cash on delivery',
  name: 'cashOnDelivery',
}
