import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ClipboardList, PackageSearch } from "lucide-react";

import { PagePlaceholder } from "@/modules/shared/components/page-placeholder";
import { CatalogWorkspace } from "@/modules/catalog/components/catalog-workspace";
import { getCatalogWorkspace } from "@/modules/catalog/server/catalog-dal";

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
  if (key === "inventory/catalog") {
    let workspace: Awaited<ReturnType<typeof getCatalogWorkspace>> | null = null;
    let workspaceError: Error | null = null;
    try {
      workspace = await getCatalogWorkspace();
    } catch (error) {
      workspaceError =
        error instanceof Error ? error : new Error("Owner access required.");
    }
    if (workspaceError || !workspace) {
      return (
        <PagePlaceholder
          description="Only an authenticated shop owner can manage the master taxonomy."
          icon={PackageSearch}
          title="Owner access required"
          hint={workspaceError?.message ?? "Owner access required."}
        />
      );
    }
    return (
      <CatalogWorkspace
        categories={workspace.categories}
        brands={workspace.brands}
        models={workspace.models}
        items={workspace.items.map((item) => ({
          id: item.id,
          sku: item.sku,
          name: item.name,
          barcode: item.barcode,
          categoryName: item.categoryName,
          brandName: item.brandName,
          modelName: item.modelName,
          sellPriceMinor: item.sellPriceMinor,
          isActive: item.isActive,
        }))}
      />
    );
  }
  return (
    <PagePlaceholder
      description={config.description}
      icon={config.icon}
      title={config.title}
    />
  );
}
