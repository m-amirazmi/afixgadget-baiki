import { ArrowLeftRight, ShoppingBag, Wrench, type LucideIcon } from "lucide-react";

export const PosEnum = {
  ProductSales: "product",
  RepairIntake: "repair",
  TradeIn: "tradein",
} as const;

export type PosType = (typeof PosEnum)[keyof typeof PosEnum];

type PosTypeDefinition = {
  label: PosType;
  description: PosType;
  icon: LucideIcon;
  comingSoon?: boolean;
};

export const posTypes = {
  [PosEnum.ProductSales]: {
    label: PosEnum.ProductSales,
    description: PosEnum.ProductSales,
    icon: ShoppingBag,
  },
  [PosEnum.RepairIntake]: {
    label: PosEnum.RepairIntake,
    description: PosEnum.RepairIntake,
    icon: Wrench,
  },
  [PosEnum.TradeIn]: {
    label: PosEnum.TradeIn,
    description: PosEnum.TradeIn,
    icon: ArrowLeftRight,
    comingSoon: true,
  },
} satisfies Record<PosType, PosTypeDefinition>;

export function isPosType(value: string): value is PosType {
  return Object.hasOwn(posTypes, value);
}
