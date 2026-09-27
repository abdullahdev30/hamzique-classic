import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`

    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "is_top_variant" boolean DEFAULT false;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "show_image_on_home_page" boolean DEFAULT false;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "show_video_on_home_page" boolean DEFAULT false;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_top_variant" boolean DEFAULT false;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_show_image_on_home_page" boolean DEFAULT false;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_show_video_on_home_page" boolean DEFAULT false;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_is_top_variant" boolean DEFAULT false;

    ALTER TABLE "products_rels" ADD COLUMN IF NOT EXISTS "pages_id" integer;
    ALTER TABLE "_products_v_rels" ADD COLUMN IF NOT EXISTS "pages_id" integer;
    CREATE INDEX IF NOT EXISTS "products_rels_pages_id_idx" ON "products_rels" USING btree ("pages_id");
    CREATE INDEX IF NOT EXISTS "_products_v_rels_pages_id_idx" ON "_products_v_rels" USING btree ("pages_id");

    INSERT INTO "products_rels" ("parent_id", "path", "pages_id", "order")
    SELECT DISTINCT category_rel."parent_id", 'pages', category."main_page_id", 0
    FROM "products_rels" AS category_rel
    INNER JOIN "categories" AS category ON category_rel."categories_id" = category."id"
    WHERE category_rel."path" = 'categories'
      AND category."main_page_id" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "products_rels" AS page_rel
        WHERE page_rel."parent_id" = category_rel."parent_id"
          AND page_rel."path" = 'pages'
          AND page_rel."pages_id" = category."main_page_id"
      );

    INSERT INTO "_products_v_rels" ("parent_id", "path", "pages_id", "order")
    SELECT DISTINCT category_rel."parent_id", 'pages', category."main_page_id", 0
    FROM "_products_v_rels" AS category_rel
    INNER JOIN "categories" AS category ON category_rel."categories_id" = category."id"
    WHERE category_rel."path" = 'categories'
      AND category."main_page_id" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "_products_v_rels" AS page_rel
        WHERE page_rel."parent_id" = category_rel."parent_id"
          AND page_rel."path" = 'pages'
          AND page_rel."pages_id" = category."main_page_id"
      );

    ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';
    UPDATE "orders" SET "status" = 'pending' WHERE "status" = 'processing';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'processing';
    ALTER TABLE "_products_v_rels" DROP COLUMN IF EXISTS "pages_id";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "pages_id";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_is_top_variant";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_show_video_on_home_page";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_show_image_on_home_page";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "is_top_variant";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "show_video_on_home_page";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "show_image_on_home_page";
    ALTER TABLE "categories" DROP COLUMN IF EXISTS "is_top_variant";
  `)
}
