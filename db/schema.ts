export * from "./auth-schema";

import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { shops, users } from "./auth-schema";

export const catalogScope = pgEnum("catalog_scope", ["REPAIR", "PRODUCT"]);

export const catalogCategories = pgTable(
  "catalog_categories",
  {
    id: text("id").primaryKey(),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("catalog_categories_shop_name_uidx").on(table.shopId, table.name),
    index("catalog_categories_shop_active_idx").on(table.shopId, table.isActive),
  ],
);

export const catalogCategoryScopes = pgTable(
  "catalog_category_scopes",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => catalogCategories.id, { onDelete: "cascade" }),
    scope: catalogScope("scope").notNull(),
  },
  (table) => [
    uniqueIndex("catalog_category_scope_uidx").on(table.categoryId, table.scope),
  ],
);

export const catalogBrands = pgTable(
  "catalog_brands",
  {
    id: text("id").primaryKey(),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("catalog_brands_shop_name_uidx").on(table.shopId, table.name),
    index("catalog_brands_shop_active_idx").on(table.shopId, table.isActive),
  ],
);

export const catalogModels = pgTable(
  "catalog_models",
  {
    id: text("id").primaryKey(),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => catalogCategories.id, { onDelete: "restrict" }),
    brandId: text("brand_id")
      .notNull()
      .references(() => catalogBrands.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("catalog_models_shop_category_brand_name_uidx").on(
      table.shopId,
      table.categoryId,
      table.brandId,
      table.name,
    ),
    index("catalog_models_lookup_idx").on(
      table.shopId,
      table.categoryId,
      table.brandId,
      table.isActive,
    ),
  ],
);

export const catalogItems = pgTable(
  "catalog_items",
  {
    id: text("id").primaryKey(),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    barcode: text("barcode"),
    name: text("name").notNull(),
    categoryId: text("category_id").references(() => catalogCategories.id),
    brandId: text("brand_id").references(() => catalogBrands.id),
    modelId: text("model_id").references(() => catalogModels.id),
    categoryName: text("category_name"),
    brandName: text("brand_name"),
    modelName: text("model_name"),
    costPriceMinor: integer("cost_price_minor").default(0).notNull(),
    sellPriceMinor: integer("sell_price_minor").default(0).notNull(),
    isTrackStock: boolean("is_track_stock").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("catalog_items_shop_sku_uidx").on(table.shopId, table.sku),
    index("catalog_items_shop_active_idx").on(table.shopId, table.isActive),
  ],
);

export const repairTickets = pgTable(
  "repair_tickets",
  {
    id: text("id").primaryKey(),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    ticketNumber: text("ticket_number").notNull(),
    ticketToken: text("ticket_token").notNull(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    reportedIssue: text("reported_issue").notNull(),
    deviceCategoryId: text("device_category_id").references(
      () => catalogCategories.id,
    ),
    deviceBrandId: text("device_brand_id").references(() => catalogBrands.id),
    deviceModelId: text("device_model_id").references(() => catalogModels.id),
    deviceCategoryName: text("device_category_name").notNull(),
    deviceBrandName: text("device_brand_name").notNull(),
    deviceModelName: text("device_model_name").notNull(),
    serialOrImei: text("serial_or_imei"),
    createdById: text("created_by_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("repair_tickets_shop_ticket_uidx").on(
      table.shopId,
      table.ticketNumber,
    ),
    uniqueIndex("repair_tickets_token_uidx").on(table.ticketToken),
  ],
);

export const catalogCategoryRelations = relations(
  catalogCategories,
  ({ many }) => ({
    scopes: many(catalogCategoryScopes),
  }),
);
