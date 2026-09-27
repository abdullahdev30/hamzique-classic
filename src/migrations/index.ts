import * as migration_20260909_141632_pkr_cod_storefront from './20260909_141632_pkr_cod_storefront';
import * as migration_20260927_000050_add_pending_order_status from './20260927_000050_add_pending_order_status';
import * as migration_20260927_000100_product_pages_home_order_status from './20260927_000100_product_pages_home_order_status';

export const migrations = [
  {
    up: migration_20260909_141632_pkr_cod_storefront.up,
    down: migration_20260909_141632_pkr_cod_storefront.down,
    name: '20260909_141632_pkr_cod_storefront',
  },
  {
    up: migration_20260927_000050_add_pending_order_status.up,
    down: migration_20260927_000050_add_pending_order_status.down,
    name: '20260927_000050_add_pending_order_status',
  },
  {
    up: migration_20260927_000100_product_pages_home_order_status.up,
    down: migration_20260927_000100_product_pages_home_order_status.down,
    name: '20260927_000100_product_pages_home_order_status',
  },
 
];
