"use server";

import { revalidatePath } from "next/cache";

import {
  bulkAddModels,
  createBrand,
  createCatalogItem,
  createCategory,
  createRepairTicket,
  getRepairLookupBrands,
  getRepairLookupModels,
  setBrandActive,
  setCategoryActive,
  setCategoryScope,
  setModelActive,
  type CatalogScope,
} from "./server/catalog-dal";

function revalidateCatalog() {
  revalidatePath("/inventory/catalog");
}

export async function createCategoryAction(input: {
  name: string;
  scopes: CatalogScope[];
}) {
  const result = await createCategory(input);
  if (result.ok) revalidateCatalog();
  return result;
}

export async function setCategoryScopeAction(input: {
  categoryId: string;
  scope: CatalogScope;
  enabled: boolean;
}) {
  const result = await setCategoryScope(input);
  if (result.ok) revalidateCatalog();
  return result;
}

export async function setCategoryActiveAction(input: {
  categoryId: string;
  isActive: boolean;
}) {
  const result = await setCategoryActive(input);
  if (result.ok) revalidateCatalog();
  return result;
}

export async function createBrandAction(input: { name: string }) {
  const result = await createBrand(input);
  if (result.ok) revalidateCatalog();
  return result;
}

export async function setBrandActiveAction(input: {
  brandId: string;
  isActive: boolean;
}) {
  const result = await setBrandActive(input);
  if (result.ok) revalidateCatalog();
  return result;
}

export async function bulkAddModelsAction(input: {
  categoryId: string;
  brandId: string;
  names: string[];
}) {
  const result = await bulkAddModels(input);
  if (result.ok) revalidateCatalog();
  return result;
}

export async function setModelActiveAction(input: {
  modelId: string;
  isActive: boolean;
}) {
  const result = await setModelActive(input);
  if (result.ok) revalidateCatalog();
  return result;
}

export async function createCatalogItemAction(input: {
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
  const result = await createCatalogItem(input);
  if (result.ok) revalidateCatalog();
  return result;
}

export async function createRepairTicketAction(input: {
  customerName: string;
  customerPhone: string;
  reportedIssue: string;
  categoryId: string;
  brandId: string;
  modelId: string;
  manualModelName?: string;
  serialOrImei?: string;
}) {
  return createRepairTicket(input);
}

export async function getRepairBrandsAction(categoryId: string) {
  return getRepairLookupBrands(categoryId);
}

export async function getRepairModelsAction(
  categoryId: string,
  brandId: string,
) {
  return getRepairLookupModels(categoryId, brandId);
}
