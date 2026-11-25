import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ShoppingBag, Wrench } from "lucide-react";

import { isPosType, posTypes } from "@/modules/pos/pos-types";
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

  const config = posTypes[posType];
  const icon =
    posType === "repair-intake"
      ? Wrench
      : posType === "product-sales"
        ? ShoppingBag
        : config.icon;

  return (
    <PagePlaceholder
      description={config.description}
      hint={
        posType === "product-sales"
          ? "Retail checkout and completed repair-ticket settlement will share one cart."
          : undefined
      }
      icon={icon}
      title={config.label}
    />
  );
}
