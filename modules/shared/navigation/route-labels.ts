export function getRouteLabelKey(pathname: string) {
  if (pathname === "/dashboard") return "routes.dashboard";
  if (pathname === "/pos/product") return "routes.productSales";
  if (pathname === "/pos/repair") return "routes.repairIntake";
  if (pathname === "/pos/tradein") return "routes.tradeIn";
  if (pathname === "/inventory/movements") return "routes.movements";
  if (pathname === "/inventory/catalog") return "routes.catalog";
  if (pathname.startsWith("/inventory")) return "routes.liveStock";
  if (pathname.startsWith("/repairs")) return "routes.activeTickets";
  if (pathname.startsWith("/users")) return "routes.users";
  if (pathname.startsWith("/settings")) return "routes.settings";
  return "routes.repairs";
}
