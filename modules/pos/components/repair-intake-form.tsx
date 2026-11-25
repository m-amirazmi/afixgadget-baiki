"use client";

import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createRepairTicketAction,
  getRepairBrandsAction,
  getRepairModelsAction,
} from "@/modules/catalog/catalog-actions";

type Option = { id: string; name: string };

export function RepairIntakeForm({
  categories,
}: {
  categories: Array<Option & { sortOrder: number }>;
}) {
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [brands, setBrands] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [manualModel, setManualModel] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serialOrImei, setSerialOrImei] = useState("");
  const [reportedIssue, setReportedIssue] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const result = await createRepairTicketAction({
        customerName,
        customerPhone,
        reportedIssue,
        categoryId,
        brandId,
        modelId: modelId || "other",
        manualModelName: modelId === "other" ? manualModel : undefined,
        serialOrImei,
      });
      setNotice(result.message);
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Point of sale</p>
          <h2 className="text-2xl font-semibold tracking-tight">Repair intake</h2>
        </div>
        {notice ? <Badge variant="outline">{notice}</Badge> : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New repair ticket</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Customer name
            <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Customer phone
            <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Category
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={categoryId}
              onChange={(event) => {
                const nextCategoryId = event.target.value;
                setCategoryId(nextCategoryId);
                setBrandId("");
                setModelId("");
                setModels([]);
                if (nextCategoryId) {
                  void getRepairBrandsAction(nextCategoryId).then(setBrands);
                } else {
                  setBrands([]);
                }
              }}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Brand
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={brandId}
              onChange={(event) => {
                const nextBrandId = event.target.value;
                setBrandId(nextBrandId);
                setModelId("");
                if (categoryId && nextBrandId) {
                  void getRepairModelsAction(categoryId, nextBrandId).then(setModels);
                } else {
                  setModels([]);
                }
              }}
            >
              <option value="">Select brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Model
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={modelId}
              onChange={(event) => setModelId(event.target.value)}
              disabled={!brandId}
            >
              <option value="">Select model</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
              <option value="other">Other</option>
            </select>
          </label>
          {modelId === "other" ? (
            <label className="grid gap-2 text-sm font-medium">
              Unlisted model
              <Input value={manualModel} onChange={(event) => setManualModel(event.target.value)} />
            </label>
          ) : (
            <label className="grid gap-2 text-sm font-medium">
              Serial / IMEI
              <Input value={serialOrImei} onChange={(event) => setSerialOrImei(event.target.value)} />
            </label>
          )}

          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Reported issue
            <textarea
              className="min-h-28 rounded-md border bg-background px-3 py-2 text-sm"
              value={reportedIssue}
              onChange={(event) => setReportedIssue(event.target.value)}
            />
          </label>
          {modelId === "other" ? (
            <label className="grid gap-2 text-sm font-medium md:col-span-2">
              Serial / IMEI
              <Input value={serialOrImei} onChange={(event) => setSerialOrImei(event.target.value)} />
            </label>
          ) : null}
          <div className="md:col-span-2">
            <Button
              className="w-full"
              disabled={pending || !categoryId || !brandId || (!modelId || (modelId === "other" && !manualModel))}
              onClick={submit}
            >
              Create repair ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
