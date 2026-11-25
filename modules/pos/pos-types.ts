import { ArrowLeftRight, ShoppingBag, Wrench, type LucideIcon } from "lucide-react";

export const PosEnum = {
  ProductSales: "pos-product",
  RepairIntake: "pos-repair",
  TradeIn: "pos-tradein",
} as const;

export type PosType = (typeof PosEnum)[keyof typeof PosEnum];

type PosTypeDefinition = {
  label: string;
  labelKey: PosType;
  description: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

export const posTypes = {
  [PosEnum.ProductSales]: {
    label: "Product sales",
    labelKey: PosEnum.ProductSales,
    description: "Sell products and settle completed repair tickets.",
    icon: ShoppingBag,
  },
  [PosEnum.RepairIntake]: {
    label: "Repair intake",
    labelKey: PosEnum.RepairIntake,
    description: "Register a device and start a repair ticket.",
    icon: Wrench,
  },
  [PosEnum.TradeIn]: {
    label: "Trade-in",
    labelKey: PosEnum.TradeIn,
    description: "Assess and process a device trade-in.",
    icon: ArrowLeftRight,
    comingSoon: true,
  },
} satisfies Record<PosType, PosTypeDefinition>;

export function isPosType(value: string): value is PosType {
  return Object.hasOwn(posTypes, value);
}
