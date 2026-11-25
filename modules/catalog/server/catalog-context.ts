"server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/auth-schema";
import { getSession } from "@/modules/auth/server/session";

export type CatalogContext = {
  userId: string;
  shopId: string;
};

export async function getCatalogContext(options?: {
  ownerOnly?: boolean;
}): Promise<CatalogContext> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const [user] = await db
    .select({
      shopId: users.shopId,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user?.shopId) {
    throw new Error("No shop context is available");
  }

  if (options?.ownerOnly && user.role !== "OWNER") {
    throw new Error("Owner access required");
  }

  return {
    userId: session.user.id,
    shopId: user.shopId,
  };
}
