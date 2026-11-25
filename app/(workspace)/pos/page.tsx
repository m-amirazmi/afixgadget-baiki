import { redirect } from "next/navigation";

import { PosEnum } from "@/modules/pos/pos-types";

export default function PosIndexPage() {
  redirect(`/pos/${PosEnum.ProductSales}`);
}
