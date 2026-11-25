import { Suspense } from "react";
import { notFound } from "next/navigation";

import { isPosType, PosEnum, posTypes } from "@/modules/pos/pos-types";
import { PosPagePlaceholder } from "@/modules/pos/components/pos-page-placeholder";
import { PagePlaceholder } from "@/modules/shared/components/page-placeholder";

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

  return (
    <PosPagePlaceholder
      posType={posType}
      hint={
        posType === PosEnum.ProductSales
          ? "Retail checkout and completed repair-ticket settlement will share one cart."
          : undefined
      }
    />
  );
}
