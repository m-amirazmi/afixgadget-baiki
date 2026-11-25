import { ArrowLeftRight, ShoppingBag, Wrench, type LucideIcon } from "lucide-react";

export const posTypes = {
  "product-sales": {
    label: "Product sales",
    description: "Sell products and settle completed repair tickets.",
    icon: ShoppingBag,
  },
  "repair-intake": {
    label: "Repair intake",
    description: "Register a device and start a repair ticket.",
    icon: Wrench,
  },
  "trade-in": {
    label: "Trade-in",
    description: "Assess and process a device trade-in.",
    icon: ArrowLeftRight,
    comingSoon: true,
  },
} satisfies Record<
  string,
  {
    label: string;
    description: string;
    icon: LucideIcon;
    comingSoon?: boolean;
  }
>;

export type PosType = keyof typeof posTypes;

export function isPosType(value: string): value is PosType {
  return Object.hasOwn(posTypes, value);
}
