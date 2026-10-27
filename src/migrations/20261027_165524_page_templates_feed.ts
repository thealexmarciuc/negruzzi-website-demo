import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_template" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_pages_template" ADD VALUE 'directory';
  ALTER TYPE "public"."enum__pages_v_version_template" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__pages_v_version_template" ADD VALUE 'directory';
  ALTER TABLE "pages" ADD COLUMN "feed_category_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_feed_category_id" integer;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_feed_category_id_categories_id_fk" FOREIGN KEY ("feed_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_feed_category_id_categories_id_fk" FOREIGN KEY ("version_feed_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_feed_category_idx" ON "pages" USING btree ("feed_category_id");
  CREATE INDEX "_pages_v_version_version_feed_category_idx" ON "_pages_v" USING btree ("version_feed_category_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP CONSTRAINT "pages_feed_category_id_categories_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_feed_category_id_categories_id_fk";
  
  ALTER TABLE "pages" ALTER COLUMN "template" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "template" SET DEFAULT 'standard'::text;
  DROP TYPE "public"."enum_pages_template";
  CREATE TYPE "public"."enum_pages_template" AS ENUM('standard', 'section', 'history', 'admission', 'results', 'project', 'contact');
  ALTER TABLE "pages" ALTER COLUMN "template" SET DEFAULT 'standard'::"public"."enum_pages_template";
  ALTER TABLE "pages" ALTER COLUMN "template" SET DATA TYPE "public"."enum_pages_template" USING "template"::"public"."enum_pages_template";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DEFAULT 'standard'::text;
  DROP TYPE "public"."enum__pages_v_version_template";
  CREATE TYPE "public"."enum__pages_v_version_template" AS ENUM('standard', 'section', 'history', 'admission', 'results', 'project', 'contact');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DEFAULT 'standard'::"public"."enum__pages_v_version_template";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_template" SET DATA TYPE "public"."enum__pages_v_version_template" USING "version_template"::"public"."enum__pages_v_version_template";
  DROP INDEX "pages_feed_category_idx";
  DROP INDEX "_pages_v_version_version_feed_category_idx";
  ALTER TABLE "pages" DROP COLUMN "feed_category_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_feed_category_id";`)
}
