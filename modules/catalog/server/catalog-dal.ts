"server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  catalogBrands,
  catalogCategories,
  catalogCategoryScopes,
  catalogItems,
  catalogModels,
  repairTickets,
} from "@/db/schema";
import { getCatalogContext } from "./catalog-context";

export type CatalogScope = "REPAIR" | "PRODUCT";

export type CatalogCategoryView = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  scopes: CatalogScope[];
};

export type CatalogBrandView = {
  id: string;
  name: string;
  isActive: boolean;
  modelCount: number;
};

export type CatalogModelView = {
  id: string;
  name: string;
  isActive: boolean;
};

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function namesEqual(left: string, right: string) {
  return left.trim().toLocaleLowerCase() === right.trim().toLocaleLowerCase();
}

async function ensureOwnerContext() {
  return getCatalogContext({ ownerOnly: true });
}

export async function getCatalogWorkspace() {
  const { shopId } = await ensureOwnerContext();

  const categories = await db
    .select()
    .from(catalogCategories)
    .where(eq(catalogCategories.shopId, shopId))
    .orderBy(asc(catalogCategories.sortOrder), asc(catalogCategories.name));

  const categoryIds = categories.map((category) => category.id);
  const scopeRows =
    categoryIds.length === 0
      ? []
      : await db
          .select()
          .from(catalogCategoryScopes)
          .where(inArray(catalogCategoryScopes.categoryId, categoryIds));

  const brands = await db
    .select()
    .from(catalogBrands)
    .where(eq(catalogBrands.shopId, shopId))
    .orderBy(asc(catalogBrands.name));

  const modelRows = await db
    .select({
      id: catalogModels.id,
      categoryId: catalogModels.categoryId,
      brandId: catalogModels.brandId,
      name: catalogModels.name,
      isActive: catalogModels.isActive,
    })
    .from(catalogModels)
    .where(eq(catalogModels.shopId, shopId));

  const categoryView: CatalogCategoryView[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    scopes: scopeRows
      .filter((scope) => scope.categoryId === category.id)
      .map((scope) => scope.scope),
  }));

  const brandView: CatalogBrandView[] = brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    isActive: brand.isActive,
    modelCount: modelRows.filter(
      (model) => model.brandId === brand.id,
    ).length,
  }));

  const items = await db
    .select()
    .from(catalogItems)
    .where(eq(catalogItems.shopId, shopId))
    .orderBy(asc(catalogItems.name));

  return {
    categories: categoryView,
    brands: brandView,
    models: modelRows.map((model) => ({
      id: model.id,
      categoryId: model.categoryId,
      brandId: model.brandId,
      name: model.name,
      isActive: model.isActive,
    })),
    items,
  };
}

export async function createCategory(input: {
  name: string;
  scopes: CatalogScope[];
}) {
  const { shopId } = await ensureOwnerContext();
  const name = normalizeName(input.name);
  if (!name) return { ok: false, message: "Category name is required." };
  const scopes = [...new Set(input.scopes)];
  if (scopes.length === 0) {
    return { ok: false, message: "Select at least one category scope." };
  }

  const existing = await db
    .select({ name: catalogCategories.name })
    .from(catalogCategories)
    .where(eq(catalogCategories.shopId, shopId));
  if (existing.some((category) => namesEqual(category.name, name))) {
    return { ok: false, message: "A category with this name already exists." };
  }

  const id = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(catalogCategories).values({
      id,
      shopId,
      name,
    });
    await tx.insert(catalogCategoryScopes).values(
      scopes.map((scope) => ({
        id: crypto.randomUUID(),
        categoryId: id,
        scope,
      })),
    );
  });

  return { ok: true, id, message: "Category created." };
}

export async function setCategoryScope(input: {
  categoryId: string;
  scope: CatalogScope;
  enabled: boolean;
}) {
  const { shopId } = await ensureOwnerContext();
  const [category] = await db
    .select({ id: catalogCategories.id })
    .from(catalogCategories)
    .where(
      and(
        eq(catalogCategories.id, input.categoryId),
        eq(catalogCategories.shopId, shopId),
      ),
    )
    .limit(1);
  if (!category) return { ok: false, message: "Category not found." };

  const scopes = await db
    .select()
    .from(catalogCategoryScopes)
    .where(eq(catalogCategoryScopes.categoryId, category.id));

  if (!input.enabled) {
    if (scopes.length <= 1) {
      return {
        ok: false,
        message: "A category must remain assigned to at least one scope.",
      };
    }
    await db
      .delete(catalogCategoryScopes)
      .where(
        and(
          eq(catalogCategoryScopes.categoryId, category.id),
          eq(catalogCategoryScopes.scope, input.scope),
        ),
      );
  } else if (!scopes.some((scope) => scope.scope === input.scope)) {
    await db.insert(catalogCategoryScopes).values({
      id: crypto.randomUUID(),
      categoryId: category.id,
      scope: input.scope,
    });
  }

  return { ok: true, message: "Category scopes updated." };
}

export async function setCategoryActive(input: {
  categoryId: string;
  isActive: boolean;
}) {
  const { shopId } = await ensureOwnerContext();
  const result = await db
    .update(catalogCategories)
    .set({ isActive: input.isActive })
    .where(
      and(
        eq(catalogCategories.id, input.categoryId),
        eq(catalogCategories.shopId, shopId),
      ),
    )
    .returning({ id: catalogCategories.id });
  return result.length
    ? { ok: true, message: input.isActive ? "Category activated." : "Category archived." }
    : { ok: false, message: "Category not found." };
}

export async function createBrand(input: { name: string }) {
  const { shopId } = await ensureOwnerContext();
  const name = normalizeName(input.name);
  if (!name) return { ok: false, message: "Brand name is required." };
  const existing = await db
    .select({ id: catalogBrands.id, name: catalogBrands.name })
    .from(catalogBrands)
    .where(eq(catalogBrands.shopId, shopId));
  const duplicate = existing.find((brand) => namesEqual(brand.name, name));
  if (duplicate) return { ok: true, id: duplicate.id, message: "Existing brand reused." };

  const id = crypto.randomUUID();
  await db.insert(catalogBrands).values({ id, shopId, name });
  return { ok: true, id, message: "Brand created." };
}

export async function setBrandActive(input: {
  brandId: string;
  isActive: boolean;
}) {
  const { shopId } = await ensureOwnerContext();
  const result = await db
    .update(catalogBrands)
    .set({ isActive: input.isActive })
    .where(
      and(
        eq(catalogBrands.id, input.brandId),
        eq(catalogBrands.shopId, shopId),
      ),
    )
    .returning({ id: catalogBrands.id });
  return result.length
    ? { ok: true, message: input.isActive ? "Brand activated." : "Brand archived." }
    : { ok: false, message: "Brand not found." };
}

export async function bulkAddModels(input: {
  categoryId: string;
  brandId: string;
  names: string[];
}) {
  const { shopId } = await ensureOwnerContext();
  const [category] = await db
    .select({ id: catalogCategories.id })
    .from(catalogCategories)
    .where(
      and(
        eq(catalogCategories.id, input.categoryId),
        eq(catalogCategories.shopId, shopId),
      ),
    )
    .limit(1);
  const [brand] = await db
    .select({ id: catalogBrands.id })
    .from(catalogBrands)
    .where(
      and(
        eq(catalogBrands.id, input.brandId),
        eq(catalogBrands.shopId, shopId),
      ),
    )
    .limit(1);
  if (!category || !brand) {
    return { ok: false, inserted: 0, message: "Category or brand not found." };
  }

  const normalized = [
    ...new Map(
      input.names
        .map(normalizeName)
        .filter(Boolean)
        .map((name) => [name.toLocaleLowerCase(), name]),
    ).values(),
  ];
  if (normalized.length === 0) {
    return { ok: true, inserted: 0, message: "No model names were provided." };
  }

  const existing = await db
    .select({ name: catalogModels.name })
    .from(catalogModels)
    .where(
      and(
        eq(catalogModels.shopId, shopId),
        eq(catalogModels.categoryId, category.id),
        eq(catalogModels.brandId, brand.id),
      ),
    );

  const novel = normalized.filter(
    (name) => !existing.some((model) => namesEqual(model.name, name)),
  );
  if (novel.length > 0) {
    await db.insert(catalogModels).values(
      novel.map((name) => ({
        id: crypto.randomUUID(),
        shopId,
        categoryId: category.id,
        brandId: brand.id,
        name,
      })),
    );
  }

  return {
    ok: true,
    inserted: novel.length,
    message: `${novel.length} model${novel.length === 1 ? "" : "s"} inserted.`,
  };
}

export async function setModelActive(input: {
  modelId: string;
  isActive: boolean;
}) {
  const { shopId } = await ensureOwnerContext();
  const result = await db
    .update(catalogModels)
    .set({ isActive: input.isActive })
    .where(
      and(
        eq(catalogModels.id, input.modelId),
        eq(catalogModels.shopId, shopId),
      ),
    )
    .returning({ id: catalogModels.id });
  return result.length
    ? { ok: true, message: input.isActive ? "Model activated." : "Model archived." }
    : { ok: false, message: "Model not found." };
}

export async function getRepairLookupCategories() {
  const { shopId } = await getCatalogContext();
  return db
    .selectDistinct({
      id: catalogCategories.id,
      name: catalogCategories.name,
      sortOrder: catalogCategories.sortOrder,
    })
    .from(catalogCategories)
    .innerJoin(
      catalogCategoryScopes,
      eq(catalogCategoryScopes.categoryId, catalogCategories.id),
    )
    .where(
      and(
        eq(catalogCategories.shopId, shopId),
        eq(catalogCategories.isActive, true),
        eq(catalogCategoryScopes.scope, "REPAIR"),
      ),
    )
    .orderBy(asc(catalogCategories.sortOrder), asc(catalogCategories.name));
}

export async function getRepairLookupBrands(categoryId: string) {
  const { shopId } = await getCatalogContext();
  const activeModels = await db
    .selectDistinct({ brandId: catalogModels.brandId })
    .from(catalogModels)
    .innerJoin(
      catalogCategories,
      eq(catalogCategories.id, catalogModels.categoryId),
    )
    .innerJoin(
      catalogCategoryScopes,
      eq(catalogCategoryScopes.categoryId, catalogModels.categoryId),
    )
    .where(
      and(
        eq(catalogModels.shopId, shopId),
        eq(catalogModels.categoryId, categoryId),
        eq(catalogModels.isActive, true),
        eq(catalogCategories.isActive, true),
        eq(catalogCategoryScopes.scope, "REPAIR"),
      ),
    );
  const brandIds = activeModels.map((model) => model.brandId);
  if (brandIds.length === 0) return [];

  return db
    .select({ id: catalogBrands.id, name: catalogBrands.name })
    .from(catalogBrands)
    .where(
      and(
        eq(catalogBrands.shopId, shopId),
        eq(catalogBrands.isActive, true),
        inArray(catalogBrands.id, brandIds),
      ),
    )
    .orderBy(asc(catalogBrands.name));
}

export async function getRepairLookupModels(
  categoryId: string,
  brandId: string,
) {
  const { shopId } = await getCatalogContext();
  return db
    .select({ id: catalogModels.id, name: catalogModels.name })
    .from(catalogModels)
    .innerJoin(
      catalogCategories,
      eq(catalogCategories.id, catalogModels.categoryId),
    )
    .innerJoin(
      catalogBrands,
      eq(catalogBrands.id, catalogModels.brandId),
    )
    .innerJoin(
      catalogCategoryScopes,
      eq(catalogCategoryScopes.categoryId, catalogModels.categoryId),
    )
    .where(
      and(
        eq(catalogModels.shopId, shopId),
        eq(catalogModels.categoryId, categoryId),
        eq(catalogModels.brandId, brandId),
        eq(catalogModels.isActive, true),
        eq(catalogCategories.isActive, true),
        eq(catalogBrands.isActive, true),
        eq(catalogCategoryScopes.scope, "REPAIR"),
      ),
    )
    .orderBy(asc(catalogModels.name));
}

export async function getProductLookupCategories() {
  const { shopId } = await getCatalogContext();
  return db
    .selectDistinct({
      id: catalogCategories.id,
      name: catalogCategories.name,
      sortOrder: catalogCategories.sortOrder,
    })
    .from(catalogCategories)
    .innerJoin(
      catalogCategoryScopes,
      eq(catalogCategoryScopes.categoryId, catalogCategories.id),
    )
    .where(
      and(
        eq(catalogCategories.shopId, shopId),
        eq(catalogCategories.isActive, true),
        eq(catalogCategoryScopes.scope, "PRODUCT"),
      ),
    )
    .orderBy(asc(catalogCategories.sortOrder), asc(catalogCategories.name));
}

export async function getProductCatalogItems() {
  const { shopId } = await getCatalogContext();
  return db
    .select()
    .from(catalogItems)
    .where(
      and(
        eq(catalogItems.shopId, shopId),
        eq(catalogItems.isActive, true),
      ),
    )
    .orderBy(asc(catalogItems.name));
}

export async function createCatalogItem(input: {
  sku: string;
  barcode?: string;
  name: string;
  categoryId?: string;
  brandId?: string;
  modelId?: string;
  costPriceMinor: number;
  sellPriceMinor: number;
  isTrackStock: boolean;
}) {
  const { shopId } = await ensureOwnerContext();
  const sku = normalizeName(input.sku);
  const name = normalizeName(input.name);
  if (!sku || !name) {
    return { ok: false, message: "SKU and item name are required." };
  }

  const [existing] = await db
    .select({ id: catalogItems.id })
    .from(catalogItems)
    .where(
      and(
        eq(catalogItems.shopId, shopId),
        eq(catalogItems.sku, sku),
      ),
    )
    .limit(1);
  if (existing) {
    return { ok: false, message: "A catalog item with this SKU already exists." };
  }

  let categoryName: string | null = null;
  let brandName: string | null = null;
  let modelName: string | null = null;
  if (input.categoryId) {
    const [category] = await db
      .select({ name: catalogCategories.name })
      .from(catalogCategories)
      .where(
        and(
          eq(catalogCategories.id, input.categoryId),
          eq(catalogCategories.shopId, shopId),
        ),
      )
      .limit(1);
    if (!category) return { ok: false, message: "Category not found." };
    categoryName = category.name;
  }
  if (input.brandId) {
    const [brand] = await db
      .select({ name: catalogBrands.name })
      .from(catalogBrands)
      .where(
        and(
          eq(catalogBrands.id, input.brandId),
          eq(catalogBrands.shopId, shopId),
        ),
      )
      .limit(1);
    if (!brand) return { ok: false, message: "Brand not found." };
    brandName = brand.name;
  }
  if (input.modelId) {
    const [model] = await db
      .select({ name: catalogModels.name })
      .from(catalogModels)
      .where(
        and(
          eq(catalogModels.id, input.modelId),
          eq(catalogModels.shopId, shopId),
        ),
      )
      .limit(1);
    if (!model) return { ok: false, message: "Model not found." };
    modelName = model.name;
  }

  const id = crypto.randomUUID();
  await db.insert(catalogItems).values({
    id,
    shopId,
    sku,
    barcode: input.barcode ? normalizeName(input.barcode) : null,
    name,
    categoryId: input.categoryId ?? null,
    brandId: input.brandId ?? null,
    modelId: input.modelId ?? null,
    categoryName,
    brandName,
    modelName,
    costPriceMinor: Math.max(0, Math.round(input.costPriceMinor)),
    sellPriceMinor: Math.max(0, Math.round(input.sellPriceMinor)),
    isTrackStock: input.isTrackStock,
  });
  return { ok: true, id, message: "Catalog item created." };
}

export async function createRepairTicket(input: {
  customerName: string;
  customerPhone: string;
  reportedIssue: string;
  categoryId: string;
  brandId: string;
  modelId: string;
  manualModelName?: string;
  serialOrImei?: string;
}) {
  const context = await getCatalogContext();
  const customerName = normalizeName(input.customerName);
  const customerPhone = normalizeName(input.customerPhone);
  const reportedIssue = normalizeName(input.reportedIssue);
  if (!customerName || !customerPhone || !reportedIssue) {
    return { ok: false, message: "Customer details and reported issue are required." };
  }

  const [category] = await db
    .select({ id: catalogCategories.id, name: catalogCategories.name })
    .from(catalogCategories)
    .innerJoin(
      catalogCategoryScopes,
      eq(catalogCategoryScopes.categoryId, catalogCategories.id),
    )
    .where(
      and(
        eq(catalogCategories.id, input.categoryId),
        eq(catalogCategories.shopId, context.shopId),
        eq(catalogCategories.isActive, true),
        eq(catalogCategoryScopes.scope, "REPAIR"),
      ),
    )
    .limit(1);
  if (!category) return { ok: false, message: "Category not found." };

  let brandName = "";
  let modelName = normalizeName(input.manualModelName ?? "");
  let brandId: string | null = null;
  let modelId: string | null = null;

  if (input.modelId !== "other") {
    const [brand] = await db
      .select({ id: catalogBrands.id, name: catalogBrands.name })
      .from(catalogBrands)
      .where(
        and(
          eq(catalogBrands.id, input.brandId),
          eq(catalogBrands.shopId, context.shopId),
          eq(catalogBrands.isActive, true),
        ),
      )
      .limit(1);
    if (!brand) return { ok: false, message: "Brand not found." };
    brandId = brand.id;
    brandName = brand.name;

    const [model] = await db
      .select({ id: catalogModels.id, name: catalogModels.name })
      .from(catalogModels)
      .where(
        and(
          eq(catalogModels.id, input.modelId),
          eq(catalogModels.categoryId, category.id),
          eq(catalogModels.brandId, brand.id),
          eq(catalogModels.shopId, context.shopId),
          eq(catalogModels.isActive, true),
        ),
      )
      .limit(1);
    if (!model) return { ok: false, message: "Model not found." };
    modelId = model.id;
    modelName = model.name;
  } else {
    const [brand] = await db
      .select({ id: catalogBrands.id, name: catalogBrands.name })
      .from(catalogBrands)
      .where(
        and(
          eq(catalogBrands.id, input.brandId),
          eq(catalogBrands.shopId, context.shopId),
          eq(catalogBrands.isActive, true),
        ),
      )
      .limit(1);
    if (!brand) return { ok: false, message: "Brand not found." };
    brandId = brand.id;
    brandName = brand.name;
  }

  if (!brandName || !modelName) {
    return { ok: false, message: "Brand and model are required." };
  }

  const now = new Date();
  const prefix = `R-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const existing = await db
    .select({ id: repairTickets.id })
    .from(repairTickets)
    .where(eq(repairTickets.shopId, context.shopId));
  const ticketNumber = `${prefix}-${String(existing.length + 1).padStart(4, "0")}`;
  const id = crypto.randomUUID();
  await db.insert(repairTickets).values({
    id,
    shopId: context.shopId,
    ticketNumber,
    ticketToken: crypto.randomUUID().replaceAll("-", ""),
    customerName,
    customerPhone,
    reportedIssue,
    deviceCategoryId: category.id,
    deviceBrandId: brandId,
    deviceModelId: modelId,
    deviceCategoryName: category.name,
    deviceBrandName: brandName,
    deviceModelName: modelName,
    serialOrImei: input.serialOrImei ? normalizeName(input.serialOrImei) : null,
    createdById: context.userId,
  });
  return { ok: true, id, ticketNumber, message: "Repair ticket created." };
}
