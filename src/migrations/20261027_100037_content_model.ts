import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_blocks_cards_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_pages_blocks_document_list_doc_types" AS ENUM('anunt', 'hotarare-ca', 'regulament', 'orar', 'rezultate', 'achizitie', 'raport', 'formular', 'metodologie', 'declaratie', 'altul');
  CREATE TYPE "public"."enum_pages_blocks_document_list_mode" AS ENUM('manual', 'library');
  CREATE TYPE "public"."enum_pages_blocks_people_group" AS ENUM('conducere', 'consiliu', 'fosti-directori', 'sefi-promotie', 'catedre');
  CREATE TYPE "public"."enum_pages_blocks_callout_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_pages_template" AS ENUM('standard', 'section', 'history', 'admission', 'results', 'project', 'contact');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_document_list_doc_types" AS ENUM('anunt', 'hotarare-ca', 'regulament', 'orar', 'rezultate', 'achizitie', 'raport', 'formular', 'metodologie', 'declaratie', 'altul');
  CREATE TYPE "public"."enum__pages_v_blocks_document_list_mode" AS ENUM('manual', 'library');
  CREATE TYPE "public"."enum__pages_v_blocks_people_group" AS ENUM('conducere', 'consiliu', 'fosti-directori', 'sefi-promotie', 'catedre');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__pages_v_version_template" AS ENUM('standard', 'section', 'history', 'admission', 'results', 'project', 'contact');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_documents_doc_type" AS ENUM('anunt', 'hotarare-ca', 'regulament', 'orar', 'rezultate', 'achizitie', 'raport', 'formular', 'metodologie', 'declaratie', 'altul');
  CREATE TYPE "public"."enum_people_groups" AS ENUM('conducere', 'consiliu', 'fosti-directori', 'sefi-promotie');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_homepage_hero_actions_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_homepage_audience_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_homepage_highlights_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_navigation_main_columns_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_navigation_main_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_navigation_quick_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_site_settings_social_network" AS ENUM('facebook', 'instagram', 'youtube', 'tiktok', 'linkedin');
  CREATE TYPE "public"."enum_site_settings_footer_columns_items_link_type" AS ENUM('internal', 'external');
  CREATE TABLE "articles_attachment_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"embedded_document_id" integer,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"category_id" integer,
  	"featured" boolean,
  	"legacy_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "_articles_v_version_attachment_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_embedded_document_id" integer,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_category_id" integer,
  	"version_featured" boolean,
  	"version_legacy_path" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum_pages_blocks_cards_items_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean
  );
  
  CREATE TABLE "pages_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_document_list_doc_types" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_document_list_doc_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_document_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum_pages_blocks_document_list_mode" DEFAULT 'manual',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"group" "enum_pages_blocks_people_group",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_embedded_document" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"document_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"link_type" "enum_pages_blocks_callout_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_article_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"category_id" integer,
  	"limit" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"hero_image_id" integer,
  	"slug" varchar,
  	"template" "enum_pages_template" DEFAULT 'standard',
  	"order" numeric DEFAULT 0,
  	"legacy_path" varchar,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"articles_id" integer,
  	"categories_id" integer,
  	"documents_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum__pages_v_blocks_cards_items_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_document_list_doc_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_document_list_doc_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_document_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum__pages_v_blocks_document_list_mode" DEFAULT 'manual',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"group" "enum__pages_v_blocks_people_group",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_embedded_document" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"document_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"link_type" "enum__pages_v_blocks_callout_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_article_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"category_id" integer,
  	"limit" numeric DEFAULT 6,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_version_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_hero_image_id" integer,
  	"version_slug" varchar,
  	"version_template" "enum__pages_v_version_template" DEFAULT 'standard',
  	"version_order" numeric DEFAULT 0,
  	"version_legacy_path" varchar,
  	"version_parent_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"articles_id" integer,
  	"categories_id" integer,
  	"documents_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"order" numeric DEFAULT 0,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"doc_type" "enum_documents_doc_type" DEFAULT 'altul',
  	"school_year" varchar,
  	"category_id" integer,
  	"external_url" varchar,
  	"source_url" varchar,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "people_groups" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_people_groups",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"department_id" integer,
  	"years" varchar,
  	"photo_id" integer,
  	"email" varchar,
  	"bio" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "departments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"head_id" integer,
  	"description" jsonb,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"type" "enum_redirects_type" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"articles_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "homepage_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_homepage_hero_actions_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean
  );
  
  CREATE TABLE "homepage_audience_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"link_type" "enum_homepage_audience_links_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean
  );
  
  CREATE TABLE "homepage_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum_homepage_highlights_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_title" varchar DEFAULT 'Colegiul Național „Costache Negruzzi” Iași' NOT NULL,
  	"hero_text" varchar,
  	"hero_image_id" integer,
  	"news_category_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"articles_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "navigation_main_columns_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_navigation_main_columns_items_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean
  );
  
  CREATE TABLE "navigation_main_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar
  );
  
  CREATE TABLE "navigation_main" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_navigation_main_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean
  );
  
  CREATE TABLE "navigation_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_navigation_quick_links_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"articles_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "site_settings_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"network" "enum_site_settings_social_network" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_columns_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_site_settings_footer_columns_items_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean
  );
  
  CREATE TABLE "site_settings_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"school_name" varchar DEFAULT 'Colegiul Național „Costache Negruzzi” Iași',
  	"contact_address" varchar,
  	"contact_phone" varchar,
  	"contact_fax" varchar,
  	"contact_email" varchar,
  	"contact_hours" varchar,
  	"contact_map_embed_url" varchar,
  	"legal_text" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"articles_id" integer,
  	"categories_id" integer
  );
  
  ALTER TABLE "users" ADD COLUMN "name" varchar;
  ALTER TABLE "media" ADD COLUMN "caption" varchar;
  ALTER TABLE "media" ADD COLUMN "source_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filename" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "departments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  ALTER TABLE "articles_attachment_groups" ADD CONSTRAINT "articles_attachment_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_embedded_document_id_documents_id_fk" FOREIGN KEY ("embedded_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_attachment_groups" ADD CONSTRAINT "_articles_v_version_attachment_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_embedded_document_id_documents_id_fk" FOREIGN KEY ("version_embedded_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items" ADD CONSTRAINT "pages_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items" ADD CONSTRAINT "pages_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_document_list_doc_types" ADD CONSTRAINT "pages_blocks_document_list_doc_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_document_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_document_list" ADD CONSTRAINT "pages_blocks_document_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_people" ADD CONSTRAINT "pages_blocks_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline" ADD CONSTRAINT "pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items" ADD CONSTRAINT "pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_embedded_document" ADD CONSTRAINT "pages_blocks_embedded_document_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_embedded_document" ADD CONSTRAINT "pages_blocks_embedded_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout" ADD CONSTRAINT "pages_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_feed" ADD CONSTRAINT "pages_blocks_article_feed_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_feed" ADD CONSTRAINT "pages_blocks_article_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_breadcrumbs" ADD CONSTRAINT "pages_breadcrumbs_doc_id_pages_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_breadcrumbs" ADD CONSTRAINT "pages_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_items" ADD CONSTRAINT "_pages_v_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_items" ADD CONSTRAINT "_pages_v_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_document_list_doc_types" ADD CONSTRAINT "_pages_v_blocks_document_list_doc_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_document_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_document_list" ADD CONSTRAINT "_pages_v_blocks_document_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_people" ADD CONSTRAINT "_pages_v_blocks_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline" ADD CONSTRAINT "_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_items" ADD CONSTRAINT "_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats" ADD CONSTRAINT "_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_embedded_document" ADD CONSTRAINT "_pages_v_blocks_embedded_document_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_embedded_document" ADD CONSTRAINT "_pages_v_blocks_embedded_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout" ADD CONSTRAINT "_pages_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_feed" ADD CONSTRAINT "_pages_v_blocks_article_feed_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_feed" ADD CONSTRAINT "_pages_v_blocks_article_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_breadcrumbs" ADD CONSTRAINT "_pages_v_version_breadcrumbs_doc_id_pages_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_breadcrumbs" ADD CONSTRAINT "_pages_v_version_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_groups" ADD CONSTRAINT "people_groups_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments" ADD CONSTRAINT "departments_head_id_people_id_fk" FOREIGN KEY ("head_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_hero_actions" ADD CONSTRAINT "homepage_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_audience_links" ADD CONSTRAINT "homepage_audience_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_stats" ADD CONSTRAINT "homepage_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_highlights" ADD CONSTRAINT "homepage_highlights_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_highlights" ADD CONSTRAINT "homepage_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_news_category_id_categories_id_fk" FOREIGN KEY ("news_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_columns_items" ADD CONSTRAINT "navigation_main_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_main_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_columns" ADD CONSTRAINT "navigation_main_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_main"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main" ADD CONSTRAINT "navigation_main_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_quick_links" ADD CONSTRAINT "navigation_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social" ADD CONSTRAINT "site_settings_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_columns_items" ADD CONSTRAINT "site_settings_footer_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_columns" ADD CONSTRAINT "site_settings_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_attachment_groups_order_idx" ON "articles_attachment_groups" USING btree ("_order");
  CREATE INDEX "articles_attachment_groups_parent_id_idx" ON "articles_attachment_groups" USING btree ("_parent_id");
  CREATE INDEX "articles_hero_image_idx" ON "articles" USING btree ("hero_image_id");
  CREATE INDEX "articles_embedded_document_idx" ON "articles" USING btree ("embedded_document_id");
  CREATE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_id");
  CREATE INDEX "articles_legacy_path_idx" ON "articles" USING btree ("legacy_path");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_documents_id_idx" ON "articles_rels" USING btree ("documents_id");
  CREATE INDEX "articles_rels_media_id_idx" ON "articles_rels" USING btree ("media_id");
  CREATE INDEX "_articles_v_version_attachment_groups_order_idx" ON "_articles_v_version_attachment_groups" USING btree ("_order");
  CREATE INDEX "_articles_v_version_attachment_groups_parent_id_idx" ON "_articles_v_version_attachment_groups" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_hero_image_idx" ON "_articles_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_articles_v_version_version_embedded_document_idx" ON "_articles_v" USING btree ("version_embedded_document_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "_articles_v" USING btree ("version_category_id");
  CREATE INDEX "_articles_v_version_version_legacy_path_idx" ON "_articles_v" USING btree ("version_legacy_path");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_documents_id_idx" ON "_articles_v_rels" USING btree ("documents_id");
  CREATE INDEX "_articles_v_rels_media_id_idx" ON "_articles_v_rels" USING btree ("media_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_items_order_idx" ON "pages_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_items_parent_id_idx" ON "pages_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_items_image_idx" ON "pages_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_cards_order_idx" ON "pages_blocks_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_parent_id_idx" ON "pages_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_path_idx" ON "pages_blocks_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_document_list_doc_types_order_idx" ON "pages_blocks_document_list_doc_types" USING btree ("order");
  CREATE INDEX "pages_blocks_document_list_doc_types_parent_idx" ON "pages_blocks_document_list_doc_types" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_document_list_order_idx" ON "pages_blocks_document_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_document_list_parent_id_idx" ON "pages_blocks_document_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_document_list_path_idx" ON "pages_blocks_document_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_people_order_idx" ON "pages_blocks_people" USING btree ("_order");
  CREATE INDEX "pages_blocks_people_parent_id_idx" ON "pages_blocks_people" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_people_path_idx" ON "pages_blocks_people" USING btree ("_path");
  CREATE INDEX "pages_blocks_timeline_items_order_idx" ON "pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_items_parent_id_idx" ON "pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_items_image_idx" ON "pages_blocks_timeline_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_timeline_order_idx" ON "pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_parent_id_idx" ON "pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_path_idx" ON "pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_items_order_idx" ON "pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_items_parent_id_idx" ON "pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_embedded_document_order_idx" ON "pages_blocks_embedded_document" USING btree ("_order");
  CREATE INDEX "pages_blocks_embedded_document_parent_id_idx" ON "pages_blocks_embedded_document" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_embedded_document_path_idx" ON "pages_blocks_embedded_document" USING btree ("_path");
  CREATE INDEX "pages_blocks_embedded_document_document_idx" ON "pages_blocks_embedded_document" USING btree ("document_id");
  CREATE INDEX "pages_blocks_callout_order_idx" ON "pages_blocks_callout" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_parent_id_idx" ON "pages_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_path_idx" ON "pages_blocks_callout" USING btree ("_path");
  CREATE INDEX "pages_blocks_article_feed_order_idx" ON "pages_blocks_article_feed" USING btree ("_order");
  CREATE INDEX "pages_blocks_article_feed_parent_id_idx" ON "pages_blocks_article_feed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_article_feed_path_idx" ON "pages_blocks_article_feed" USING btree ("_path");
  CREATE INDEX "pages_blocks_article_feed_category_idx" ON "pages_blocks_article_feed" USING btree ("category_id");
  CREATE INDEX "pages_breadcrumbs_order_idx" ON "pages_breadcrumbs" USING btree ("_order");
  CREATE INDEX "pages_breadcrumbs_parent_id_idx" ON "pages_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "pages_breadcrumbs_doc_idx" ON "pages_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "pages_hero_image_idx" ON "pages" USING btree ("hero_image_id");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_legacy_path_idx" ON "pages" USING btree ("legacy_path");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_articles_id_idx" ON "pages_rels" USING btree ("articles_id");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "pages_rels_documents_id_idx" ON "pages_rels" USING btree ("documents_id");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cards_items_order_idx" ON "_pages_v_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_items_parent_id_idx" ON "_pages_v_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_items_image_idx" ON "_pages_v_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_cards_order_idx" ON "_pages_v_blocks_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_parent_id_idx" ON "_pages_v_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_path_idx" ON "_pages_v_blocks_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_document_list_doc_types_order_idx" ON "_pages_v_blocks_document_list_doc_types" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_document_list_doc_types_parent_idx" ON "_pages_v_blocks_document_list_doc_types" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_document_list_order_idx" ON "_pages_v_blocks_document_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_document_list_parent_id_idx" ON "_pages_v_blocks_document_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_document_list_path_idx" ON "_pages_v_blocks_document_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_people_order_idx" ON "_pages_v_blocks_people" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_people_parent_id_idx" ON "_pages_v_blocks_people" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_people_path_idx" ON "_pages_v_blocks_people" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_timeline_items_order_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_items_parent_id_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_items_image_idx" ON "_pages_v_blocks_timeline_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_timeline_order_idx" ON "_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_parent_id_idx" ON "_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_path_idx" ON "_pages_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_stats_items_order_idx" ON "_pages_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_items_parent_id_idx" ON "_pages_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_order_idx" ON "_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_parent_id_idx" ON "_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_path_idx" ON "_pages_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_embedded_document_order_idx" ON "_pages_v_blocks_embedded_document" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_embedded_document_parent_id_idx" ON "_pages_v_blocks_embedded_document" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_embedded_document_path_idx" ON "_pages_v_blocks_embedded_document" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_embedded_document_document_idx" ON "_pages_v_blocks_embedded_document" USING btree ("document_id");
  CREATE INDEX "_pages_v_blocks_callout_order_idx" ON "_pages_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_parent_id_idx" ON "_pages_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_path_idx" ON "_pages_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_article_feed_order_idx" ON "_pages_v_blocks_article_feed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_article_feed_parent_id_idx" ON "_pages_v_blocks_article_feed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_article_feed_path_idx" ON "_pages_v_blocks_article_feed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_article_feed_category_idx" ON "_pages_v_blocks_article_feed" USING btree ("category_id");
  CREATE INDEX "_pages_v_version_breadcrumbs_order_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_order");
  CREATE INDEX "_pages_v_version_breadcrumbs_parent_id_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_breadcrumbs_doc_idx" ON "_pages_v_version_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_hero_image_idx" ON "_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_legacy_path_idx" ON "_pages_v" USING btree ("version_legacy_path");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_articles_id_idx" ON "_pages_v_rels" USING btree ("articles_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_rels_documents_id_idx" ON "_pages_v_rels" USING btree ("documents_id");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "documents_category_idx" ON "documents" USING btree ("category_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE INDEX "people_groups_order_idx" ON "people_groups" USING btree ("order");
  CREATE INDEX "people_groups_parent_idx" ON "people_groups" USING btree ("parent_id");
  CREATE INDEX "people_department_idx" ON "people" USING btree ("department_id");
  CREATE INDEX "people_photo_idx" ON "people" USING btree ("photo_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "departments_slug_idx" ON "departments" USING btree ("slug");
  CREATE INDEX "departments_head_idx" ON "departments" USING btree ("head_id");
  CREATE INDEX "departments_updated_at_idx" ON "departments" USING btree ("updated_at");
  CREATE INDEX "departments_created_at_idx" ON "departments" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_articles_id_idx" ON "redirects_rels" USING btree ("articles_id");
  CREATE INDEX "redirects_rels_categories_id_idx" ON "redirects_rels" USING btree ("categories_id");
  CREATE INDEX "homepage_hero_actions_order_idx" ON "homepage_hero_actions" USING btree ("_order");
  CREATE INDEX "homepage_hero_actions_parent_id_idx" ON "homepage_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "homepage_audience_links_order_idx" ON "homepage_audience_links" USING btree ("_order");
  CREATE INDEX "homepage_audience_links_parent_id_idx" ON "homepage_audience_links" USING btree ("_parent_id");
  CREATE INDEX "homepage_stats_order_idx" ON "homepage_stats" USING btree ("_order");
  CREATE INDEX "homepage_stats_parent_id_idx" ON "homepage_stats" USING btree ("_parent_id");
  CREATE INDEX "homepage_highlights_order_idx" ON "homepage_highlights" USING btree ("_order");
  CREATE INDEX "homepage_highlights_parent_id_idx" ON "homepage_highlights" USING btree ("_parent_id");
  CREATE INDEX "homepage_highlights_image_idx" ON "homepage_highlights" USING btree ("image_id");
  CREATE INDEX "homepage_hero_hero_image_idx" ON "homepage" USING btree ("hero_image_id");
  CREATE INDEX "homepage_news_category_idx" ON "homepage" USING btree ("news_category_id");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_pages_id_idx" ON "homepage_rels" USING btree ("pages_id");
  CREATE INDEX "homepage_rels_articles_id_idx" ON "homepage_rels" USING btree ("articles_id");
  CREATE INDEX "homepage_rels_categories_id_idx" ON "homepage_rels" USING btree ("categories_id");
  CREATE INDEX "navigation_main_columns_items_order_idx" ON "navigation_main_columns_items" USING btree ("_order");
  CREATE INDEX "navigation_main_columns_items_parent_id_idx" ON "navigation_main_columns_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_main_columns_order_idx" ON "navigation_main_columns" USING btree ("_order");
  CREATE INDEX "navigation_main_columns_parent_id_idx" ON "navigation_main_columns" USING btree ("_parent_id");
  CREATE INDEX "navigation_main_order_idx" ON "navigation_main" USING btree ("_order");
  CREATE INDEX "navigation_main_parent_id_idx" ON "navigation_main" USING btree ("_parent_id");
  CREATE INDEX "navigation_quick_links_order_idx" ON "navigation_quick_links" USING btree ("_order");
  CREATE INDEX "navigation_quick_links_parent_id_idx" ON "navigation_quick_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_rels_order_idx" ON "navigation_rels" USING btree ("order");
  CREATE INDEX "navigation_rels_parent_idx" ON "navigation_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_rels_path_idx" ON "navigation_rels" USING btree ("path");
  CREATE INDEX "navigation_rels_pages_id_idx" ON "navigation_rels" USING btree ("pages_id");
  CREATE INDEX "navigation_rels_articles_id_idx" ON "navigation_rels" USING btree ("articles_id");
  CREATE INDEX "navigation_rels_categories_id_idx" ON "navigation_rels" USING btree ("categories_id");
  CREATE INDEX "site_settings_social_order_idx" ON "site_settings_social" USING btree ("_order");
  CREATE INDEX "site_settings_social_parent_id_idx" ON "site_settings_social" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_columns_items_order_idx" ON "site_settings_footer_columns_items" USING btree ("_order");
  CREATE INDEX "site_settings_footer_columns_items_parent_id_idx" ON "site_settings_footer_columns_items" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_columns_order_idx" ON "site_settings_footer_columns" USING btree ("_order");
  CREATE INDEX "site_settings_footer_columns_parent_id_idx" ON "site_settings_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_pages_id_idx" ON "site_settings_rels" USING btree ("pages_id");
  CREATE INDEX "site_settings_rels_articles_id_idx" ON "site_settings_rels" USING btree ("articles_id");
  CREATE INDEX "site_settings_rels_categories_id_idx" ON "site_settings_rels" USING btree ("categories_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_departments_id_idx" ON "payload_locked_documents_rels" USING btree ("departments_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_attachment_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_attachment_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_document_list_doc_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_document_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_embedded_document" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_article_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_document_list_doc_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_document_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_embedded_document" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_article_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_hero_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_audience_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_main_columns_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_main_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_main" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_quick_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_social" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_footer_columns_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articles_attachment_groups" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v_version_attachment_groups" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_cards_items" CASCADE;
  DROP TABLE "pages_blocks_cards" CASCADE;
  DROP TABLE "pages_blocks_document_list_doc_types" CASCADE;
  DROP TABLE "pages_blocks_document_list" CASCADE;
  DROP TABLE "pages_blocks_people" CASCADE;
  DROP TABLE "pages_blocks_timeline_items" CASCADE;
  DROP TABLE "pages_blocks_timeline" CASCADE;
  DROP TABLE "pages_blocks_stats_items" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_embedded_document" CASCADE;
  DROP TABLE "pages_blocks_callout" CASCADE;
  DROP TABLE "pages_blocks_article_feed" CASCADE;
  DROP TABLE "pages_breadcrumbs" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_items" CASCADE;
  DROP TABLE "_pages_v_blocks_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_document_list_doc_types" CASCADE;
  DROP TABLE "_pages_v_blocks_document_list" CASCADE;
  DROP TABLE "_pages_v_blocks_people" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_items" CASCADE;
  DROP TABLE "_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_embedded_document" CASCADE;
  DROP TABLE "_pages_v_blocks_callout" CASCADE;
  DROP TABLE "_pages_v_blocks_article_feed" CASCADE;
  DROP TABLE "_pages_v_version_breadcrumbs" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "people_groups" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "departments" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "homepage_hero_actions" CASCADE;
  DROP TABLE "homepage_audience_links" CASCADE;
  DROP TABLE "homepage_stats" CASCADE;
  DROP TABLE "homepage_highlights" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "navigation_main_columns_items" CASCADE;
  DROP TABLE "navigation_main_columns" CASCADE;
  DROP TABLE "navigation_main" CASCADE;
  DROP TABLE "navigation_quick_links" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_rels" CASCADE;
  DROP TABLE "site_settings_social" CASCADE;
  DROP TABLE "site_settings_footer_columns_items" CASCADE;
  DROP TABLE "site_settings_footer_columns" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_articles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_documents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_people_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_departments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";
  
  DROP INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx";
  DROP INDEX "media_sizes_card_sizes_card_filename_idx";
  DROP INDEX "media_sizes_hero_sizes_hero_filename_idx";
  DROP INDEX "payload_locked_documents_rels_articles_id_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_documents_id_idx";
  DROP INDEX "payload_locked_documents_rels_people_id_idx";
  DROP INDEX "payload_locked_documents_rels_departments_id_idx";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  ALTER TABLE "media" DROP COLUMN "caption";
  ALTER TABLE "media" DROP COLUMN "source_url";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_card_url";
  ALTER TABLE "media" DROP COLUMN "sizes_card_width";
  ALTER TABLE "media" DROP COLUMN "sizes_card_height";
  ALTER TABLE "media" DROP COLUMN "sizes_card_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_url";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_width";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_height";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filename";
  ALTER TABLE "users" DROP COLUMN "name";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "articles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "documents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "people_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "departments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_pages_blocks_cards_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_document_list_doc_types";
  DROP TYPE "public"."enum_pages_blocks_document_list_mode";
  DROP TYPE "public"."enum_pages_blocks_people_group";
  DROP TYPE "public"."enum_pages_blocks_callout_link_type";
  DROP TYPE "public"."enum_pages_template";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_cards_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_document_list_doc_types";
  DROP TYPE "public"."enum__pages_v_blocks_document_list_mode";
  DROP TYPE "public"."enum__pages_v_blocks_people_group";
  DROP TYPE "public"."enum__pages_v_blocks_callout_link_type";
  DROP TYPE "public"."enum__pages_v_version_template";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_documents_doc_type";
  DROP TYPE "public"."enum_people_groups";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_homepage_hero_actions_link_type";
  DROP TYPE "public"."enum_homepage_audience_links_link_type";
  DROP TYPE "public"."enum_homepage_highlights_link_type";
  DROP TYPE "public"."enum_navigation_main_columns_items_link_type";
  DROP TYPE "public"."enum_navigation_main_link_type";
  DROP TYPE "public"."enum_navigation_quick_links_link_type";
  DROP TYPE "public"."enum_site_settings_social_network";
  DROP TYPE "public"."enum_site_settings_footer_columns_items_link_type";`)
}
