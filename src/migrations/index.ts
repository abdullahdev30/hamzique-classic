import * as migration_20260909_141632_pkr_cod_storefront from './20260909_141632_pkr_cod_storefront'

export const migrations = [
  {
    up: migration_20260909_141632_pkr_cod_storefront.up,
    down: migration_20260909_141632_pkr_cod_storefront.down,
    name: '20260909_141632_pkr_cod_storefront',
  },
]
