CREATE TYPE "public"."catalog_scope" AS ENUM('REPAIR', 'PRODUCT');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('OWNER', 'STAFF');--> statement-breakpoint
CREATE TABLE "catalog_brands" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_category_scopes" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"scope" "catalog_scope" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_items" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"sku" text NOT NULL,
	"barcode" text,
	"name" text NOT NULL,
	"category_id" text,
	"brand_id" text,
	"model_id" text,
	"category_name" text,
	"brand_name" text,
	"model_name" text,
	"cost_price_minor" integer DEFAULT 0 NOT NULL,
	"sell_price_minor" integer DEFAULT 0 NOT NULL,
	"is_track_stock" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_models" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"category_id" text NOT NULL,
	"brand_id" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"ticket_number" text NOT NULL,
	"ticket_token" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"reported_issue" text NOT NULL,
	"device_category_id" text,
	"device_brand_id" text,
	"device_model_id" text,
	"device_category_name" text NOT NULL,
	"device_brand_name" text NOT NULL,
	"device_model_name" text NOT NULL,
	"serial_or_imei" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "shop_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'STAFF' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pin_hash" text;--> statement-breakpoint
ALTER TABLE "catalog_brands" ADD CONSTRAINT "catalog_brands_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_categories" ADD CONSTRAINT "catalog_categories_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_category_scopes" ADD CONSTRAINT "catalog_category_scopes_category_id_catalog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_category_id_catalog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."catalog_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_brand_id_catalog_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."catalog_brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_model_id_catalog_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."catalog_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_models" ADD CONSTRAINT "catalog_models_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_models" ADD CONSTRAINT "catalog_models_category_id_catalog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."catalog_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_models" ADD CONSTRAINT "catalog_models_brand_id_catalog_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."catalog_brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_device_category_id_catalog_categories_id_fk" FOREIGN KEY ("device_category_id") REFERENCES "public"."catalog_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_device_brand_id_catalog_brands_id_fk" FOREIGN KEY ("device_brand_id") REFERENCES "public"."catalog_brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_device_model_id_catalog_models_id_fk" FOREIGN KEY ("device_model_id") REFERENCES "public"."catalog_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_brands_shop_name_uidx" ON "catalog_brands" USING btree ("shop_id","name");--> statement-breakpoint
CREATE INDEX "catalog_brands_shop_active_idx" ON "catalog_brands" USING btree ("shop_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_categories_shop_name_uidx" ON "catalog_categories" USING btree ("shop_id","name");--> statement-breakpoint
CREATE INDEX "catalog_categories_shop_active_idx" ON "catalog_categories" USING btree ("shop_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_category_scope_uidx" ON "catalog_category_scopes" USING btree ("category_id","scope");--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_items_shop_sku_uidx" ON "catalog_items" USING btree ("shop_id","sku");--> statement-breakpoint
CREATE INDEX "catalog_items_shop_active_idx" ON "catalog_items" USING btree ("shop_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_models_shop_category_brand_name_uidx" ON "catalog_models" USING btree ("shop_id","category_id","brand_id","name");--> statement-breakpoint
CREATE INDEX "catalog_models_lookup_idx" ON "catalog_models" USING btree ("shop_id","category_id","brand_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "repair_tickets_shop_ticket_uidx" ON "repair_tickets" USING btree ("shop_id","ticket_number");--> statement-breakpoint
CREATE UNIQUE INDEX "repair_tickets_token_uidx" ON "repair_tickets" USING btree ("ticket_token");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE set null ON UPDATE no action;