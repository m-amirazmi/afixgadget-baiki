"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Archive,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  PackageSearch,
  Settings,
  Shield,
  UsersRound,
  WalletCards,
  Wrench,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "cn";

const links = {
  dashboard: "/dashboard",
  productSales: "/pos/product",
  repairIntake: "/pos/repair",
  liveStock: "/inventory",
  movements: "/inventory/movements",
  catalog: "/inventory/catalog",
  activeTickets: "/repairs",
  users: "/users",
  settings: "/settings",
} as const;

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { setOpenMobile } = useSidebar();
  const closeMobileSidebar = () => setOpenMobile(false);

  const posIsActive = pathname.startsWith("/pos/");
  const inventoryIsActive = pathname.startsWith("/inventory");
  const repairsIsActive = pathname.startsWith("/repairs");

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="px-4 pt-5 pb-3 group-data-[collapsible=icon]:px-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group-data-[collapsible=icon]:translate-x-2"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wrench className="size-6" aria-hidden="true" />
          </div>
          <div className="grid min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="truncate font-heading text-base font-bold tracking-wide">
              AFIX GADGET
            </span>
            <span className="truncate text-sm text-sidebar-foreground/60">
              {t("workspace")}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname === links.dashboard}
                onClick={closeMobileSidebar}
                render={<Link href={links.dashboard} />}
                size="lg"
                tooltip={t("dashboard")}
                className="text-base [&_svg]:size-5"
              >
                <LayoutDashboard aria-hidden="true" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {t("dashboard")}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">{t("pointOfSale")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <Collapsible
              key={posIsActive ? "active" : "inactive"}
              defaultOpen={posIsActive}
              className="group/section"
            >
              <SidebarMenu>
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    className="flex h-12 w-full items-center gap-2 rounded-md px-2 text-base font-medium outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 [&>svg]:size-5"
                  >
                    <WalletCards className="size-5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                      {t("pointOfSale")}
                    </span>
                    <ChevronDown className="size-5 shrink-0 transition-transform group-data-[panel-open]/section:rotate-180 group-data-[collapsible=icon]:hidden" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={pathname === links.productSales}
                          onClick={closeMobileSidebar}
                          render={<Link href={links.productSales} />}
                          className="text-base"
                        >
                          <PackageSearch aria-hidden="true" />
                          <span>{t("productSales")}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={pathname === links.repairIntake}
                          onClick={closeMobileSidebar}
                          render={<Link href={links.repairIntake} />}
                          className="text-base"
                        >
                          <Wrench aria-hidden="true" />
                          <span>{t("repairIntake")}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </SidebarMenu>
            </Collapsible>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">{t("inventory")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <Collapsible
              key={inventoryIsActive ? "active" : "inactive"}
              defaultOpen={inventoryIsActive}
              className="group/section"
            >
              <SidebarMenu>
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    className="flex h-12 w-full items-center gap-2 rounded-md px-2 text-base font-medium outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 [&>svg]:size-5"
                  >
                    <Archive className="size-5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                      {t("inventory")}
                    </span>
                    <ChevronDown className="size-5 shrink-0 transition-transform group-data-[panel-open]/section:rotate-180 group-data-[collapsible=icon]:hidden" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={pathname === links.liveStock}
                          onClick={closeMobileSidebar}
                          render={<Link href={links.liveStock} />}
                          className="text-base"
                        >
                          <PackageSearch aria-hidden="true" />
                          <span>{t("liveStock")}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={pathname === links.movements}
                          onClick={closeMobileSidebar}
                          render={<Link href={links.movements} />}
                          className="text-base"
                        >
                          <ClipboardList aria-hidden="true" />
                          <span>{t("movements")}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={pathname === links.catalog}
                          onClick={closeMobileSidebar}
                          render={<Link href={links.catalog} />}
                          className="text-base"
                        >
                          <PackageSearch aria-hidden="true" />
                          <span>{t("catalog")}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </SidebarMenu>
            </Collapsible>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">{t("repairs")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={repairsIsActive}
                  onClick={closeMobileSidebar}
                  render={<Link href={links.activeTickets} />}
                  size="lg"
                  tooltip={t("activeTickets")}
                  className="text-base [&_svg]:size-5"
                >
                  <ClipboardList aria-hidden="true" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t("activeTickets")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname.startsWith("/users")}
                onClick={closeMobileSidebar}
                render={<Link href={links.users} />}
                size="lg"
                tooltip={t("users")}
                className="text-base [&_svg]:size-5"
              >
                <UsersRound aria-hidden="true" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {t("users")}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname.startsWith("/settings")}
                onClick={closeMobileSidebar}
                render={<Link href={links.settings} />}
                size="lg"
                tooltip={t("settings")}
                className="text-base [&_svg]:size-5"
              >
                <Settings aria-hidden="true" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {t("settings")}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-4">
        <div
          className={cn(
            "rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 text-sm text-sidebar-foreground/70",
            "group-data-[collapsible=icon]:hidden",
          )}
        >
          <div className="flex items-center gap-2 font-medium text-sidebar-foreground">
            <Shield className="size-4 text-primary" aria-hidden="true" />
            {t("staffWorkspace")}
          </div>
          <p className="mt-1 leading-relaxed">
            {t("staffWorkspaceDescription")}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
