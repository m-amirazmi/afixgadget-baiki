"use client";

import { useTranslation } from "react-i18next";

import { posTypes, type PosType } from "../pos-types";
import { PagePlaceholder } from "@/modules/shared/components/page-placeholder";

export function PosPagePlaceholder({
  posType,
  hint,
}: {
  posType: PosType;
  hint?: string;
}) {
  const { t } = useTranslation();
  const config = posTypes[posType];

  return (
    <PagePlaceholder
      hint={hint}
      icon={config.icon}
      title={t(`posTypes.${config.label}.label`)}
      description={t(`posTypes.${config.description}.description`)}
    />
  );
}
