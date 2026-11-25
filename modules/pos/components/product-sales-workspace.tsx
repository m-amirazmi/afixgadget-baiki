"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; sortOrder: number };
type Item = {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  brandId: string | null;
  modelId: string | null;
  categoryName: string | null;
  brandName: string | null;
  modelName: string | null;
  sellPriceMinor: number;
};

export function ProductSalesWorkspace({
  categories,
  items,
}: {
  categories: Category[];
  items: Item[];
}) {
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (!categoryId || item.categoryId === categoryId) &&
          (item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
            item.sku.toLocaleLowerCase().includes(search.toLocaleLowerCase())),
      ),
    [categoryId, items, search],
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Point of sale</p>
        <h2 className="text-2xl font-semibold tracking-tight">Product sales</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product catalog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or SKU"
            />
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">All product categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="secondary">RM {(item.sellPriceMinor / 100).toFixed(2)}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">SKU {item.sku}</p>
                {[item.categoryName, item.brandName, item.modelName].filter(Boolean).length ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {[item.categoryName, item.brandName, item.modelName].filter(Boolean).join(" → ")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
