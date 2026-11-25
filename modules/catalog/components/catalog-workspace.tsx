"use client";

import { useMemo, useState, useTransition } from "react";
import { Archive, Check, Plus, RotateCcw, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  bulkAddModelsAction,
  createBrandAction,
  createCatalogItemAction,
  createCategoryAction,
  setBrandActiveAction,
  setCategoryActiveAction,
  setCategoryScopeAction,
  setModelActiveAction,
} from "@/modules/catalog/catalog-actions";
import type {
  CatalogBrandView,
  CatalogCategoryView,
  CatalogModelView,
  CatalogScope,
} from "@/modules/catalog/server/catalog-dal";

type CatalogItemView = {
  id: string;
  sku: string;
  name: string;
  barcode: string | null;
  categoryName: string | null;
  brandName: string | null;
  modelName: string | null;
  sellPriceMinor: number;
  isActive: boolean;
};

type ModelView = CatalogModelView & {
  categoryId: string;
  brandId: string;
};

export function CatalogWorkspace({
  categories,
  brands,
  models,
  items,
}: {
  categories: CatalogCategoryView[];
  brands: CatalogBrandView[];
  models: ModelView[];
  items: CatalogItemView[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories[0]?.id ?? "",
  );
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [brandFilter, setBrandFilter] = useState<"linked" | "all">("linked");
  const [modelMode, setModelMode] = useState<"single" | "bulk">("single");
  const [modelSearch, setModelSearch] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryRepair, setCategoryRepair] = useState(true);
  const [categoryProduct, setCategoryProduct] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [bulkNames, setBulkNames] = useState("");
  const [itemSku, setItemSku] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemBarcode, setItemBarcode] = useState("");
  const [itemCost, setItemCost] = useState("0");
  const [itemSell, setItemSell] = useState("0");
  const [itemTrackStock, setItemTrackStock] = useState(true);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );

  const visibleBrands = useMemo(() => {
    if (brandFilter === "all") return brands;
    const linkedIds = new Set(
      models
        .filter((model) => model.categoryId === selectedCategoryId)
        .map((model) => model.brandId),
    );
    return brands.filter((brand) => linkedIds.has(brand.id));
  }, [brandFilter, brands, models, selectedCategoryId]);

  const visibleModels = useMemo(
    () =>
      models
        .filter(
          (model) =>
            model.categoryId === selectedCategoryId &&
            model.brandId === selectedBrandId &&
            model.name.toLocaleLowerCase().includes(modelSearch.toLocaleLowerCase()),
        )
        .sort((left, right) => left.name.localeCompare(right.name)),
    [models, selectedCategoryId, selectedBrandId, modelSearch],
  );

  const run = (action: () => Promise<unknown>) => {
    startTransition(async () => {
      const result = (await action()) as
        | { ok: boolean; message?: string; inserted?: number }
        | undefined;
      setNotice(result?.message ?? "");
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Inventory & stock</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Catalog & pricing
          </h2>
        </div>
        {notice ? (
          <Badge variant="outline" className="h-8 max-w-lg px-3 text-sm">
            {notice}
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.9fr)_minmax(260px,0.8fr)_minmax(360px,1.3fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Categories & scopes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setSelectedBrandId("");
                    setModelSearch("");
                  }}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selectedCategoryId === category.id
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted/50"
                  } ${category.isActive ? "" : "opacity-60"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{category.name}</span>
                    <Badge variant={category.isActive ? "secondary" : "outline"}>
                      {category.isActive ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {category.scopes.map((scope) => (
                      <Badge key={scope} variant="outline">
                        {scope === "REPAIR" ? "Repair Intake" : "Product Selling"}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {(["REPAIR", "PRODUCT"] as CatalogScope[]).map((scope) => {
                      const enabled = category.scopes.includes(scope);
                      return (
                        <Button
                          key={scope}
                          type="button"
                          size="sm"
                          variant={enabled ? "secondary" : "outline"}
                          disabled={pending}
                          onClick={(event) => {
                            event.stopPropagation();
                            run(() =>
                              setCategoryScopeAction({
                                categoryId: category.id,
                                scope,
                                enabled: !enabled,
                              }),
                            );
                          }}
                        >
                          {enabled ? "Remove" : "Add"} {scope}
                        </Button>
                      );
                    })}
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label={category.isActive ? "Archive category" : "Activate category"}
                      disabled={pending}
                      onClick={(event) => {
                        event.stopPropagation();
                        run(() =>
                          setCategoryActiveAction({
                            categoryId: category.id,
                            isActive: !category.isActive,
                          }),
                        );
                      }}
                    >
                      {category.isActive ? <Archive /> : <RotateCcw />}
                    </Button>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t pt-3">
              <label className="grid gap-2 text-sm font-medium">
                Category name
                <Input
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="e.g. Smartphone"
                />
              </label>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={categoryRepair}
                    onChange={(event) => setCategoryRepair(event.target.checked)}
                  />
                  Repair Intake
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={categoryProduct}
                    onChange={(event) => setCategoryProduct(event.target.checked)}
                  />
                  Product Selling
                </label>
              </div>
              <Button
                className="mt-3 w-full"
                disabled={pending || (!categoryRepair && !categoryProduct)}
                onClick={() =>
                  run(() =>
                    createCategoryAction({
                      name: categoryName,
                      scopes: [
                        ...(categoryRepair ? (["REPAIR"] as CatalogScope[]) : []),
                        ...(categoryProduct ? (["PRODUCT"] as CatalogScope[]) : []),
                      ],
                    }),
                  )
                }
              >
                <Plus /> Add category
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brands</CardTitle>
            {selectedCategory ? (
              <p className="text-sm text-muted-foreground">{selectedCategory.name}</p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={brandFilter === "linked" ? "secondary" : "outline"}
                onClick={() => setBrandFilter("linked")}
              >
                Linked
              </Button>
              <Button
                size="sm"
                variant={brandFilter === "all" ? "secondary" : "outline"}
                onClick={() => setBrandFilter("all")}
              >
                All brands
              </Button>
            </div>
            <div className="grid gap-2">
              {visibleBrands.map((brand) => {
                const linkedCount = models.filter(
                  (model) =>
                    model.categoryId === selectedCategoryId &&
                    model.brandId === brand.id,
                ).length;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => {
                      setSelectedBrandId(brand.id);
                      setModelSearch("");
                    }}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left ${
                      selectedBrandId === brand.id
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted/50"
                    } ${brand.isActive ? "" : "opacity-60"}`}
                  >
                    <span>
                      <span className="font-medium">{brand.name}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {linkedCount} models
                      </span>
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label={brand.isActive ? "Archive brand" : "Activate brand"}
                      disabled={pending}
                      onClick={(event) => {
                        event.stopPropagation();
                        run(() =>
                          setBrandActiveAction({
                            brandId: brand.id,
                            isActive: !brand.isActive,
                          }),
                        );
                      }}
                    >
                      {brand.isActive ? <Archive /> : <RotateCcw />}
                    </Button>
                  </button>
                );
              })}
            </div>
            <div className="border-t pt-3">
              <label className="grid gap-2 text-sm font-medium">
                Brand name
                <Input
                  value={brandName}
                  onChange={(event) => setBrandName(event.target.value)}
                  placeholder="e.g. Samsung"
                />
              </label>
              <Button
                className="mt-3 w-full"
                disabled={pending}
                onClick={() => run(() => createBrandAction({ name: brandName }))}
              >
                <Plus /> Add brand
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Models</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedCategory?.name ?? "Select a category"}
              {selectedBrandId
                ? ` → ${brands.find((brand) => brand.id === selectedBrandId)?.name ?? "Brand"}`
                : " → Select a brand"}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedCategoryId && selectedBrandId ? (
              <>
                <label className="relative block">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={modelSearch}
                    onChange={(event) => setModelSearch(event.target.value)}
                    placeholder="Search models"
                  />
                </label>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={modelMode === "single" ? "secondary" : "outline"}
                    onClick={() => setModelMode("single")}
                  >
                    Single entry
                  </Button>
                  <Button
                    size="sm"
                    variant={modelMode === "bulk" ? "secondary" : "outline"}
                    onClick={() => setModelMode("bulk")}
                  >
                    Bulk paste
                  </Button>
                </div>

                {modelMode === "single" ? (
                  <div className="flex gap-2">
                    <Input
                      value={modelName}
                      onChange={(event) => setModelName(event.target.value)}
                      placeholder="Model name"
                    />
                    <Button
                      disabled={pending}
                      onClick={() =>
                        run(() =>
                          bulkAddModelsAction({
                            categoryId: selectedCategoryId,
                            brandId: selectedBrandId,
                            names: [modelName],
                          }),
                        )
                      }
                    >
                      <Plus />
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <textarea
                      className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={bulkNames}
                      onChange={(event) => setBulkNames(event.target.value)}
                      placeholder={"iPhone 13 Pro\niPhone 14\niPhone 15"}
                    />
                    <Button
                      disabled={pending}
                      onClick={() =>
                        run(() =>
                          bulkAddModelsAction({
                            categoryId: selectedCategoryId,
                            brandId: selectedBrandId,
                            names: bulkNames.split("\n"),
                          }),
                        )
                      }
                    >
                      Add models
                    </Button>
                  </div>
                )}

                <div className="grid gap-2">
                  {visibleModels.map((model) => (
                    <div
                      key={model.id}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        model.isActive ? "" : "opacity-60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {model.isActive ? <Check className="size-4" /> : null}
                        {model.name}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label={model.isActive ? "Archive model" : "Activate model"}
                        disabled={pending}
                        onClick={() =>
                          run(() =>
                            setModelActiveAction({
                              modelId: model.id,
                              isActive: !model.isActive,
                            }),
                          )
                        }
                      >
                        {model.isActive ? <Archive /> : <RotateCcw />}
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Select a category and brand to manage models.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalog items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-1 text-sm font-medium">
              SKU
              <Input value={itemSku} onChange={(event) => setItemSku(event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Item name
              <Input value={itemName} onChange={(event) => setItemName(event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Barcode
              <Input value={itemBarcode} onChange={(event) => setItemBarcode(event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Category
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Cost (RM)
              <Input
                type="number"
                min="0"
                step="0.01"
                value={itemCost}
                onChange={(event) => setItemCost(event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Sell price (RM)
              <Input
                type="number"
                min="0"
                step="0.01"
                value={itemSell}
                onChange={(event) => setItemSell(event.target.value)}
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={itemTrackStock}
                onChange={(event) => setItemTrackStock(event.target.checked)}
              />
              Track stock
            </label>
            <Button
              className="self-end"
              disabled={pending}
              onClick={() =>
                run(() =>
                  createCatalogItemAction({
                    sku: itemSku,
                    barcode: itemBarcode,
                    name: itemName,
                    categoryId: selectedCategoryId || undefined,
                    brandId: selectedBrandId || undefined,
                    modelId: undefined,
                    costPriceMinor: Math.round(Number(itemCost) * 100),
                    sellPriceMinor: Math.round(Number(itemSell) * 100),
                    isTrackStock: itemTrackStock,
                  }),
                )
              }
            >
              <Plus /> Add item
            </Button>
          </div>

          {items.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    SKU {item.sku} · RM {(item.sellPriceMinor / 100).toFixed(2)}
                  </div>
                  {(item.categoryName || item.brandName || item.modelName) ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {[item.categoryName, item.brandName, item.modelName]
                        .filter(Boolean)
                        .join(" → ")}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No catalog items yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
