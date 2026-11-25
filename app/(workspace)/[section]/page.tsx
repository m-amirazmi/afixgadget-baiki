import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ClipboardList, PackageSearch, Settings, UsersRound } from "lucide-react";

import { PagePlaceholder } from "@/modules/shared/components/page-placeholder";

const sections = {
  dashboard: {
    title: "Dashboard",
    description:
      "A quick view of today's sales, active repair tickets, and branch activity.",
  },
  inventory: {
    title: "Live branch stock",
    description:
      "Check stock across configured branches and find parts before promising a repair.",
    icon: PackageSearch,
  },
  repairs: {
    title: "Active repair tickets",
    description:
      "Review repair tickets, diagnostics, assigned technicians, and customer updates.",
    icon: ClipboardList,
  },
  users: {
    title: "Users & roles",
    description:
      "Manage staff, PIN access, and paired devices.",
    icon: UsersRound,
  },
  settings: {
    title: "Shop settings",
    description:
      "Configure shop details, branches, receipt footer, and terms and conditions.",
    icon: Settings,
  },
} as const;

function isCounterSection(value: string): value is keyof typeof sections {
  return Object.hasOwn(sections, value);
}

export default async function CounterSectionPage({
  params,
}: PageProps<"/[section]">) {
  return (
    <Suspense
      fallback={
        <PagePlaceholder
          description="Preparing this workspace section."
          title="Loading section"
        />
      }
    >
      <CounterSectionContent params={params} />
    </Suspense>
  );
}

async function CounterSectionContent({
  params,
}: {
  params: PageProps<"/[section]">["params"];
}) {
  const { section } = await params;
  if (!isCounterSection(section)) notFound();

  const config = sections[section];
  return (
    <PagePlaceholder
      description={config.description}
      icon={"icon" in config ? config.icon : undefined}
      title={config.title}
    />
  );
}
