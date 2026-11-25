"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, WalletCards } from "lucide-react";
import { useTranslation } from "react-i18next";

import { posTypes } from "../pos-types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PosSwitcher() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const activePosType = pathname.split("/")[2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="ml-1 rounded-xl"
            size="default"
            variant="outline"
          />
        }
      >
        <WalletCards aria-hidden="true" />
        <span className="hidden sm:inline">{t("switchPos")}</span>
        <ChevronDown aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("pointOfSale")}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {Object.entries(posTypes).map(([type, pos]) => {
          const Icon = pos.icon;
          return (
            <DropdownMenuItem
              key={type}
              disabled={"comingSoon" in pos && pos.comingSoon}
              render={
                <Link
                  aria-current={activePosType === type ? "page" : undefined}
                  href={`/pos/${type}`}
                />
              }
            >
              <Icon aria-hidden="true" />
              <span>
                {t(pos.labelKey)}
              </span>
              {"comingSoon" in pos && pos.comingSoon && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {t("soon")}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
