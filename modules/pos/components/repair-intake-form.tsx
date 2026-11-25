"use client";

import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createRepairTicketAction,
  findReturningRepairCustomerAction,
  getRepairBrandsAction,
  getRepairModelsAction,
} from "@/modules/catalog/catalog-actions";

type Option = { id: string; name: string };

const stepKeys = ["category", "model", "customer", "issue"] as const;

export function RepairIntakeForm({
  categories,
}: {
  categories: Array<Option & { sortOrder: number }>;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState(0);
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
  const [returningPhone, setReturningPhone] = useState("");
  const [returningStatus, setReturningStatus] = useState("");
  const [returningSearchOpen, setReturningSearchOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [lookupPending, startLookupTransition] = useTransition();

  const selectedCategory = categories.find((item) => item.id === categoryId);
  const selectedBrand = brands.find((item) => item.id === brandId);
  const selectedModel =
    modelId === "other"
      ? manualModel
      : models.find((item) => item.id === modelId)?.name;

  const canContinue =
    (step === 0 && Boolean(categoryId)) ||
    (step === 1 &&
      Boolean(brandId) &&
      Boolean(modelId) &&
      (modelId !== "other" || Boolean(manualModel.trim()))) ||
    (step === 2 && Boolean(customerName.trim()) && Boolean(customerPhone.trim()));

  const selectCategory = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    setBrandId("");
    setModelId("");
    setBrands([]);
    setModels([]);
    setManualModel("");
    if (nextCategoryId) {
      void getRepairBrandsAction(nextCategoryId).then(setBrands);
    }
  };

  const selectBrand = (brand: Option) => {
    setBrandId(brand.id);
    setModelId("");
    setManualModel("");
    setModels([]);
    if (categoryId) {
      void getRepairModelsAction(categoryId, brand.id).then(setModels);
    }
  };

  const findReturningCustomer = () => {
    startLookupTransition(async () => {
      const result = await findReturningRepairCustomerAction(returningPhone);
      setReturningStatus(result.message);
      if (!result.ok) return;

      setCustomerName(result.customerName);
      setCustomerPhone(result.customerPhone);
      setCategoryId(result.categoryId);
      setBrandId(result.brandId);
      setModelId(result.modelId);
      setBrands([{ id: result.brandId, name: result.brandName }]);
      setModels(
        result.modelId === "other"
          ? []
          : [{ id: result.modelId, name: result.modelName }],
      );
      setManualModel(result.modelId === "other" ? result.modelName : "");
      setSerialOrImei(result.serialOrImei);
      setStep(3);
    });
  };

  const submit = () => {
    startTransition(async () => {
      const result = await createRepairTicketAction({
        customerName,
        customerPhone,
        reportedIssue,
        categoryId,
        brandId,
        modelId,
        manualModelName: modelId === "other" ? manualModel : undefined,
        serialOrImei,
      });
      setNotice(result.message);
    });
  };

  const deviceDescription = [
    selectedCategory?.name,
    selectedBrand?.name,
    selectedModel,
  ]
    .filter(Boolean)
    .join(" · ");

  const stepTitle = [
    t("repairWizard.chooseCategory"),
    t("repairWizard.identifyDevice"),
    t("repairWizard.customerDetails"),
    t("repairWizard.issueSummary"),
  ][step] ?? t("repairWizard.chooseCategory");

  const stepDescription = [
    t("repairWizard.stepDescriptions.category"),
    t("repairWizard.stepDescriptions.model"),
    t("repairWizard.stepDescriptions.customer"),
    t("repairWizard.stepDescriptions.issue"),
  ][step] ?? "";

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100dvh-4.5rem)] min-h-0 flex-none flex-col overflow-hidden bg-background md:h-[calc(100dvh-5.5rem)] sm:-mx-6 lg:-mx-10">
      <ol
        aria-label={t("repairWizard.progress")}
        className="hidden h-12 shrink-0 items-center justify-center gap-2 border-b px-3 md:flex"
      >
        {stepKeys.map((key, index) => (
          <li
            key={key}
            aria-current={step === index ? "step" : undefined}
            className="flex items-center gap-2"
          >
            <span
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                step === index
                  ? "bg-primary/15 text-foreground"
                  : step > index
                    ? "text-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step > index ? (
                <Check aria-hidden="true" className="size-3.5" />
              ) : null}
              {t(`repairWizard.steps.${key}`)}
            </span>
            {index < stepKeys.length - 1 ? (
              <ChevronRight
                aria-hidden="true"
                className="size-3.5 text-muted-foreground"
              />
            ) : null}
          </li>
        ))}
      </ol>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-5 text-sm md:hidden">
        <span className="text-muted-foreground">
          {t("repairWizard.stepCounter", {
            current: step + 1,
            total: stepKeys.length,
          })}
        </span>
        <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
        <span className="font-medium">{t(`repairWizard.steps.${stepKeys[step]}`)}</span>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="flex min-h-0 min-w-0 flex-col">
          <details className="shrink-0 border-b px-5 py-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold">
              {t("repairWizard.summaryTitle")}
            </summary>
            <div className="grid gap-3 pt-3 text-sm sm:grid-cols-2">
              <DeviceSummary
                label={t("repairWizard.deviceLabel")}
                brand={selectedBrand?.name}
                model={selectedModel}
              />
              <CustomerSummary
                label={t("repairWizard.customerLabel")}
                name={customerName}
                phone={customerPhone}
              />
              <SummaryLine label={t("repairWizard.issueLabel")}>
                {reportedIssue || "—"}
              </SummaryLine>
            </div>
          </details>

          <section className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("repairWizard.stepCounter", {
                    current: step + 1,
                    total: stepKeys.length,
                  })}
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                  {stepTitle}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stepDescription}
                </p>
              </div>
              {notice ? (
                <p aria-live="polite" className="rounded-md border px-3 py-2 text-sm">
                  {notice}
                </p>
              ) : null}
            </div>

            {step === 0 ? (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => (
                    <Tile
                      key={category.id}
                      selected={categoryId === category.id}
                      title={category.name}
                      onClick={() => selectCategory(category.id)}
                    >
                      <Smartphone
                        aria-hidden="true"
                        className="size-8 text-primary"
                      />
                    </Tile>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-8">
                <section aria-labelledby="brand-tiles-title">
                  <h2
                    id="brand-tiles-title"
                    className="mb-3 text-sm font-semibold"
                  >
                    {t("repairWizard.brand")}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {brands.map((brand) => (
                      <Tile
                        key={brand.id}
                        selected={brandId === brand.id}
                        title={brand.name}
                        onClick={() => selectBrand(brand)}
                      >
                        <Smartphone
                          aria-hidden="true"
                          className="size-8 text-primary"
                        />
                      </Tile>
                    ))}
                  </div>
                </section>

                {brandId ? (
                  <section aria-labelledby="model-tiles-title">
                    <h2
                      id="model-tiles-title"
                      className="mb-3 text-sm font-semibold"
                    >
                      {t("repairWizard.model")}
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {models.map((model) => (
                        <Tile
                          key={model.id}
                          selected={modelId === model.id}
                          title={model.name}
                          onClick={() => setModelId(model.id)}
                        >
                          <Smartphone
                            aria-hidden="true"
                            className="size-8 text-primary"
                          />
                        </Tile>
                      ))}
                      <Tile
                        selected={modelId === "other"}
                        title={t("repairWizard.otherModel")}
                        onClick={() => setModelId("other")}
                      >
                        <Smartphone
                          aria-hidden="true"
                          className="size-8 text-primary"
                        />
                      </Tile>
                    </div>
                    {modelId === "other" ? (
                      <label className="mt-4 grid max-w-xl gap-2 text-sm font-medium">
                        {t("repairWizard.manualModel")}
                        <Input
                          value={manualModel}
                          onChange={(event) => setManualModel(event.target.value)}
                        />
                      </label>
                    ) : null}
                  </section>
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  {t("repairWizard.customerName")}
                  <Input
                    autoComplete="name"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  {t("repairWizard.customerPhone")}
                  <Input
                    autoComplete="tel"
                    inputMode="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                  />
                </label>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid max-w-4xl gap-5 lg:grid-cols-2">
                <div className="rounded-xl border bg-card p-4">
                  <h2 className="font-semibold">{t("repairWizard.deviceLabel")}</h2>
                  <p className="mt-2 text-sm">{deviceDescription || "—"}</p>
                  <label className="mt-4 grid gap-2 text-sm font-medium">
                    {t("repairWizard.serialOrImei")}
                    <Input
                      value={serialOrImei}
                      onChange={(event) => setSerialOrImei(event.target.value)}
                    />
                  </label>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <h2 className="font-semibold">
                    {t("repairWizard.customerLabel")}
                  </h2>
                  <p className="mt-2 text-sm">{customerName || "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {customerPhone || "—"}
                  </p>
                </div>
                <label className="grid gap-2 text-sm font-medium lg:col-span-2">
                  {t("repairWizard.reportedIssue")}
                  <textarea
                    className="min-h-32 rounded-md border bg-background px-3 py-2 text-sm"
                    value={reportedIssue}
                    onChange={(event) => setReportedIssue(event.target.value)}
                  />
                </label>
              </div>
            ) : null}
          </section>

          {step === 0 ? (
            <div className="shrink-0 border-t bg-background px-5 py-3 sm:px-8 lg:px-10">
              <div
                aria-labelledby="returning-customer-heading"
                className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100 sm:px-4"
                role="note"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Info
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-sky-700 dark:text-sky-300"
                    />
                    <div>
                      <p
                        id="returning-customer-heading"
                        className="font-medium"
                      >
                        {t("repairWizard.returningCustomer")}
                      </p>
                      <p className="mt-1 text-sm text-sky-800/80 dark:text-sky-200/80">
                        {t("repairWizard.returningDescription")}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setReturningSearchOpen((open) => !open);
                      setReturningStatus("");
                    }}
                  >
                    {t("repairWizard.returningCustomer")}
                  </Button>
                </div>
                {returningSearchOpen ? (
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <Input
                      className="h-11"
                      autoComplete="tel"
                      inputMode="tel"
                      aria-label={t("repairWizard.customerPhone")}
                      placeholder={t("repairWizard.phonePlaceholder")}
                      value={returningPhone}
                      onChange={(event) =>
                        setReturningPhone(event.target.value)
                      }
                    />
                    <Button
                      type="button"
                      className="h-11"
                      disabled={lookupPending}
                      onClick={findReturningCustomer}
                    >
                      {lookupPending
                        ? t("repairWizard.searching")
                        : t("repairWizard.findCustomer")}
                    </Button>
                  </div>
                ) : null}
                {returningStatus ? (
                  <p
                    aria-live="polite"
                    className="mt-3 text-sm text-sky-800/80 dark:text-sky-200/80"
                  >
                    {returningStatus}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-between gap-3 border-t bg-background px-5 py-4 shadow-[0_-4px_12px_hsl(0_0%_0%_/_0.04)] sm:px-8 lg:px-10">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={step === 0 || pending || lookupPending}
                onClick={() =>
                  setStep((current) => Math.max(0, current - 1))
                }
              >
                <ChevronLeft aria-hidden="true" />
                <span className="hidden sm:inline">
                  {t("repairWizard.previous")}
                </span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={pending}
                onClick={() => router.push("/pos")}
              >
                {t("repairWizard.cancelIntake")}
              </Button>
            </div>
            {step < 3 ? (
              <Button
                type="button"
                disabled={!canContinue || pending || lookupPending}
                onClick={() => setStep((current) => Math.min(3, current + 1))}
              >
                {t("repairWizard.continue")}
                <ChevronRight aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={
                  pending ||
                  !categoryId ||
                  !brandId ||
                  !modelId ||
                  (modelId === "other" && !manualModel.trim()) ||
                  !customerName.trim() ||
                  !customerPhone.trim() ||
                  !reportedIssue.trim()
                }
                onClick={submit}
              >
                {pending
                  ? t("repairWizard.creatingTicket")
                  : t("repairWizard.createTicket")}
              </Button>
            )}
          </footer>
        </main>

        <aside className="sticky top-0 hidden h-full min-h-0 overflow-hidden border-l bg-card p-5 lg:block">
          <h2 className="text-base font-semibold">
            {t("repairWizard.summaryTitle")}
          </h2>
          <div className="mt-5 space-y-4">
            <div className="border-t pt-4">
              <DeviceSummary
                label={t("repairWizard.deviceLabel")}
                brand={selectedBrand?.name}
                model={selectedModel}
              />
              {serialOrImei ? (
                <p className="mt-2 pl-6 text-xs text-muted-foreground">
                  {t("repairWizard.serialOrImei")}: {serialOrImei}
                </p>
              ) : null}
            </div>
            <div className="border-t pt-4">
              <SummaryLine label={t("repairWizard.issueLabel")}>
                {reportedIssue || "—"}
              </SummaryLine>
            </div>
            <div className="border-t pt-4">
              <CustomerSummary
                label={t("repairWizard.customerLabel")}
                name={customerName}
                phone={customerPhone}
              />
            </div>
            <div className="flex items-center justify-between border-t pt-4 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <UserRound aria-hidden="true" className="size-4" />
                {t("repairWizard.technicianLabel")}
              </span>
              <span>—</span>
            </div>
            <div className="flex items-center justify-between border-t pt-4 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span aria-hidden="true" className="text-muted-foreground">
                  RM
                </span>
                {t("repairWizard.estimatedTotal")}
              </span>
              <span className="font-semibold">—</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Tile({
  children,
  onClick,
  selected,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  selected: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-32 w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? "border-primary ring-1 ring-primary" : "border-border"
      }`}
    >
      <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-primary/15">
        {children}
      </span>
      <span className="min-w-0 flex-1 font-semibold">{title}</span>
      <span
        aria-hidden="true"
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/50"
        }`}
      >
        {selected ? <Check className="size-3" /> : null}
      </span>
    </button>
  );
}

function SummaryLine({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] truncate text-right font-medium">{children}</span>
    </div>
  );
}

function DeviceSummary({
  brand,
  label,
  model,
}: {
  brand: string | undefined;
  label: string;
  model: string | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right font-medium">
        {brand || "—"}
        {model ? <span className="block">{model}</span> : null}
      </span>
    </div>
  );
}

function CustomerSummary({
  label,
  name,
  phone,
}: {
  label: string;
  name: string;
  phone: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] min-w-0 text-right font-medium">
        <span className="block truncate">{name || "—"}</span>
        <span className="block text-muted-foreground">{phone || "—"}</span>
      </span>
    </div>
  );
}
