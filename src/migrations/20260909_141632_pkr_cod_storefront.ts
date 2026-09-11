import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_addresses_country" ADD VALUE IF NOT EXISTS 'PK';
    ALTER TYPE "public"."enum_carts_currency" ADD VALUE IF NOT EXISTS 'PKR';
    ALTER TYPE "public"."enum_orders_currency" ADD VALUE IF NOT EXISTS 'PKR';
    ALTER TYPE "public"."enum_transactions_currency" ADD VALUE IF NOT EXISTS 'PKR';
    ALTER TYPE "public"."enum_transactions_payment_method" ADD VALUE IF NOT EXISTS 'cashOnDelivery';

    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_in_p_k_r_enabled" boolean;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_in_p_k_r" numeric;
    ALTER TABLE "variants" ADD COLUMN IF NOT EXISTS "price_in_p_k_r_enabled" boolean;
    ALTER TABLE "variants" ADD COLUMN IF NOT EXISTS "price_in_p_k_r" numeric;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_price_in_p_k_r_enabled" boolean;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_price_in_p_k_r" numeric;
    ALTER TABLE "_variants_v" ADD COLUMN IF NOT EXISTS "version_price_in_p_k_r_enabled" boolean;
    ALTER TABLE "_variants_v" ADD COLUMN IF NOT EXISTS "version_price_in_p_k_r" numeric;
    ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "cash_on_delivery_note" varchar DEFAULT 'Payment will be collected in cash at delivery.';

    UPDATE "products"
    SET
      "price_in_p_k_r_enabled" = COALESCE("price_in_p_k_r_enabled", "price_in_u_s_d_enabled"),
      "price_in_p_k_r" = COALESCE("price_in_p_k_r", "price_in_u_s_d");

    UPDATE "variants"
    SET
      "price_in_p_k_r_enabled" = COALESCE("price_in_p_k_r_enabled", "price_in_u_s_d_enabled"),
      "price_in_p_k_r" = COALESCE("price_in_p_k_r", "price_in_u_s_d");

    UPDATE "_products_v"
    SET
      "version_price_in_p_k_r_enabled" = COALESCE(
        "version_price_in_p_k_r_enabled",
        "version_price_in_u_s_d_enabled"
      ),
      "version_price_in_p_k_r" = COALESCE(
        "version_price_in_p_k_r",
        "version_price_in_u_s_d"
      );

    UPDATE "_variants_v"
    SET
      "version_price_in_p_k_r_enabled" = COALESCE(
        "version_price_in_p_k_r_enabled",
        "version_price_in_u_s_d_enabled"
      ),
      "version_price_in_p_k_r" = COALESCE(
        "version_price_in_p_k_r",
        "version_price_in_u_s_d"
      );

    ALTER TABLE "addresses" ALTER COLUMN "country" SET DEFAULT 'PK';
    ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'PKR';
    ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'PKR';
    ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'PKR';

    UPDATE "addresses" SET "country" = 'PK' WHERE "country" IS DISTINCT FROM 'PK';
    UPDATE "carts" SET "currency" = 'PKR' WHERE "currency" IS DISTINCT FROM 'PKR';
    UPDATE "orders" SET "currency" = 'PKR' WHERE "currency" IS DISTINCT FROM 'PKR';
    UPDATE "transactions"
    SET
      "currency" = 'PKR',
      "payment_method" = 'cashOnDelivery',
      "cash_on_delivery_note" = COALESCE(
        "cash_on_delivery_note",
        'Payment will be collected in cash at delivery.'
      )
    WHERE
      "currency" IS DISTINCT FROM 'PKR'
      OR "payment_method" IS DISTINCT FROM 'cashOnDelivery';

    ALTER TABLE "products_color_chart" DROP COLUMN IF EXISTS "hex";
    ALTER TABLE "_products_v_version_color_chart" DROP COLUMN IF EXISTS "hex";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_color_chart" ADD COLUMN IF NOT EXISTS "hex" varchar;
    ALTER TABLE "_products_v_version_color_chart" ADD COLUMN IF NOT EXISTS "hex" varchar;

    ALTER TABLE "transactions" DROP COLUMN IF EXISTS "cash_on_delivery_note";
    ALTER TABLE "_variants_v" DROP COLUMN IF EXISTS "version_price_in_p_k_r";
    ALTER TABLE "_variants_v" DROP COLUMN IF EXISTS "version_price_in_p_k_r_enabled";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_price_in_p_k_r";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_price_in_p_k_r_enabled";
    ALTER TABLE "variants" DROP COLUMN IF EXISTS "price_in_p_k_r";
    ALTER TABLE "variants" DROP COLUMN IF EXISTS "price_in_p_k_r_enabled";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "price_in_p_k_r";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "price_in_p_k_r_enabled";
  `)
}
