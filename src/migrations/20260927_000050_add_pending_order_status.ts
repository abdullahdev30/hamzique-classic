import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_orders_status"
    ADD VALUE IF NOT EXISTS 'pending';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // PostgreSQL does not support removing an enum value directly.
}