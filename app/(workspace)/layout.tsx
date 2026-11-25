import { Suspense, type ReactNode } from "react";

import { PosSwitcher } from "@/modules/pos/components/pos-switcher";
import { WorkspaceHeader } from "@/modules/shared/components/workspace-header";
import { WorkspacePreferencesProvider } from "@/modules/shared/components/workspace-preferences";
import { WorkspaceSidebar } from "@/modules/shared/components/workspace-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <WorkspacePreferencesProvider>
        <SidebarProvider defaultOpen>
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="hidden w-64 shrink-0 md:block"
              />
            }
          >
            <WorkspaceSidebar />
          </Suspense>
          <SidebarInset className="min-h-svh">
            <Suspense
              fallback={
                <header
                  aria-hidden="true"
                  className="h-18 shrink-0 border-b bg-background"
                />
              }
            >
              <WorkspaceHeader actions={<PosSwitcher />} />
            </Suspense>
            <main className="flex flex-1 flex-col p-10">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </WorkspacePreferencesProvider>
    </TooltipProvider>
  );
}
