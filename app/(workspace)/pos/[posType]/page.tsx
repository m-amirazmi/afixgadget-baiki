import { Suspense } from "react";
import { notFound } from "next/navigation";

import { isPosType, PosEnum, posTypes } from "@/modules/pos/pos-types";
import { PagePlaceholder } from "@/modules/shared/components/page-placeholder";
import { RepairIntakeForm } from "@/modules/pos/components/repair-intake-form";
import { ProductSalesWorkspace } from "@/modules/pos/components/product-sales-workspace";
import { PosPagePlaceholder } from "@/modules/pos/components/pos-page-placeholder";
import {
  getProductCatalogItems,
  getProductLookupCategories,
  getRepairLookupCategories,
} from "@/modules/catalog/server/catalog-dal";

export function generateStaticParams() {
  return Object.keys(posTypes).map((posType) => ({ posType }));
}

export default async function PosTypePage({
  params,
}: PageProps<"/pos/[posType]">) {
  return (
    <Suspense
      fallback={
        <PagePlaceholder
          description="Preparing the selected POS workflow."
          title="Loading POS"
        />
      }
    >
      <PosTypeContent params={params} />
    </Suspense>
  );
}

async function PosTypeContent({
  params,
}: {
  params: PageProps<"/pos/[posType]">["params"];
}) {
  const { posType } = await params;
  if (!isPosType(posType)) notFound();

  if (posType === PosEnum.TradeIn) {
    return (
      <PosPagePlaceholder
        posType={posType}
        hint="Trade-in taxonomy can reuse the PRODUCT and future trade-in category scopes."
      />
    );
  }

  if (posType === PosEnum.RepairIntake) {
    let categories: Awaited<ReturnType<typeof getRepairLookupCategories>> | null =
      null;
    let posError: Error | null = null;
    try {
      categories = await getRepairLookupCategories();
    } catch (error) {
      posError =
        error instanceof Error ? error : new Error("Authentication required.");
    }
    if (posError || !categories) {
      return (
        <PagePlaceholder
          description="Sign in with a staff or owner session and a valid shop context."
          title="POS unavailable"
          hint={posError?.message ?? "Authentication required."}
        />
      );
    }
    return <RepairIntakeForm categories={categories} />;
  }

  if (posType === PosEnum.ProductSales) {
    let categories: Awaited<ReturnType<typeof getProductLookupCategories>> | null =
      null;
    let items: Awaited<ReturnType<typeof getProductCatalogItems>> | null = null;
    let posError: Error | null = null;
    try {
      [categories, items] = await Promise.all([
        getProductLookupCategories(),
        getProductCatalogItems(),
      ]);
    } catch (error) {
      posError =
        error instanceof Error ? error : new Error("Authentication required.");
    }
    if (posError || !categories || !items) {
      return (
        <PagePlaceholder
          description="Sign in with a staff or owner session and a valid shop context."
          title="POS unavailable"
          hint={posError?.message ?? "Authentication required."}
        />
      );
    }
    return <ProductSalesWorkspace categories={categories} items={items} />;
  }

  return notFound();
}
