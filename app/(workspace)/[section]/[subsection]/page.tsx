import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ClipboardList, PackageSearch } from "lucide-react";

import { PagePlaceholder } from "@/modules/shared/components/page-placeholder";

const subsections = {
  "inventory/movements": {
    title: "Stock movements",
    description:
      "Review the immutable record of stock received, sold, transferred, or adjusted.",
    icon: ClipboardList,
  },
  "inventory/catalog": {
    title: "Catalog & pricing",
    description:
      "Manage spare parts, accessories, and standard repair services.",
    icon: PackageSearch,
  },
} as const;

function isCounterSubsection(
  value: string,
): value is keyof typeof subsections {
  return Object.hasOwn(subsections, value);
}

export default async function CounterSubsectionPage({
  params,
}: PageProps<"/[section]/[subsection]">) {
  return (
    <Suspense
      fallback={
        <PagePlaceholder
          description="Preparing this inventory workflow."
          title="Loading inventory"
        />
      }
    >
      <CounterSubsectionContent params={params} />
    </Suspense>
  );
}

async function CounterSubsectionContent({
  params,
}: {
  params: PageProps<"/[section]/[subsection]">["params"];
}) {
  const { section, subsection } = await params;
  const key = `${section}/${subsection}`;
  if (!isCounterSubsection(key)) notFound();

  const config = subsections[key];
  return (
    <PagePlaceholder
      description={config.description}
      icon={config.icon}
      title={config.title}
    />
  );
}
