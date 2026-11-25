"use client";

import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Languages,
  LockKeyhole,
  Moon,
  Sun,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { getRouteLabelKey } from "../navigation/route-labels";
import { useWorkspacePreferences } from "./workspace-preferences";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function WorkspaceHeader({ actions }: { actions?: ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, isDark, setIsDark } = useWorkspacePreferences();
  const { t } = useTranslation();
  const [isLockNoticeOpen, setIsLockNoticeOpen] = useState(false);
  const pageTitle = t(getRouteLabelKey(pathname));

  return (
    <>
      <header className="sticky top-0 z-20 flex h-18 shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/8 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger
            aria-label={t("menu")}
            className="size-12 rounded-xl [&_svg]:size-5"
          />
          <div className="hidden h-8 w-px bg-border sm:block" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-6 sm:text-xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden h-11 items-center gap-2 rounded-xl border bg-card px-3 lg:flex">
            <div className="size-2 animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none" />
            <span className="text-sm font-semibold">HQ</span>
            <div className="mx-1 h-6 w-px bg-border" />
            <span className="text-sm font-medium">{t("staff")}</span>
          </div>

          {actions}

          <Button
            aria-label={t("lockStaff")}
            className="h-12 gap-2 rounded-xl px-3 [&_svg]:size-5"
            onClick={() => setIsLockNoticeOpen(true)}
            title={t("lockStaff")}
            type="button"
            variant="destructive"
          >
            <LockKeyhole aria-hidden="true" />
            <span className="hidden xl:inline">{t("lockStaff")}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={t("account")}
              render={
                <Button
                  className="h-12 gap-2 rounded-xl px-2 [&_svg]:size-5"
                  size="sm"
                  variant="ghost"
                />
              }
            >
              <Avatar>
                <AvatarFallback className="bg-primary/20 font-semibold text-foreground">
                  CS
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden size-4 sm:block" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="font-semibold">{t("staff")}</div>
                  <div className="mt-0.5 font-normal text-muted-foreground">
                    {t("demoWorkspace")}
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Languages className="size-4" aria-hidden="true" />
                  {t("language")}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuRadioGroup
                value={locale}
                onValueChange={(value) => {
                  if (value === "en" || value === "ms") setLocale(value);
                }}
              >
                <DropdownMenuRadioItem value="ms">
                  Bahasa Melayu <span className="ml-auto text-muted-foreground">MS</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en">
                  English <span className="ml-auto text-muted-foreground">EN</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={isDark}
                onCheckedChange={setIsDark}
              >
                {isDark ? (
                  <Sun aria-hidden="true" />
                ) : (
                  <Moon aria-hidden="true" />
                )}
                {t("darkMode")}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {isLockNoticeOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsLockNoticeOpen(false);
            }
          }}
        >
          <section
            aria-labelledby="lock-notice-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl"
            role="dialog"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/20 text-foreground">
              <LockKeyhole aria-hidden="true" />
            </div>
            <h2 id="lock-notice-title" className="text-lg font-semibold">
              {t("lockTitle")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("lockDescription")}
            </p>
            <Button
              className="mt-5 h-11 w-full rounded-xl"
              onClick={() => setIsLockNoticeOpen(false)}
              type="button"
            >
              {t("returnToWorkspace")}
            </Button>
          </section>
        </div>
      )}
    </>
  );
}
