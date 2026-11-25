"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BatteryCharging,
  Bell,
  Cable,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  Headphones,
  Minus,
  Package,
  Plus,
  ReceiptText,
  ScanLine,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Ticket,
  Trash2,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Separator } from "../../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { ThemeSwitcher } from "./theme-switcher";

const categories = [
  { value: "Repairs", icon: Wrench },
  { value: "Unlocking", icon: ShieldCheck },
  { value: "Products", icon: Package },
  { value: "Trade-in", icon: ArrowLeftRight },
  { value: "Miscellaneous", icon: Settings2 },
] as const;

type CatalogCategory = (typeof categories)[number]["value"];

type CatalogItem = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: CatalogCategory;
  icon: LucideIcon;
  label?: string;
};

type CartLine = {
  item: CatalogItem;
  quantity: number;
};

const screenReplacement: CatalogItem = {
  id: "screen-replacement",
  sku: "REP-IP12-SCREEN",
  name: "Screen replacement",
  description: "iPhone 12 · quality part",
  price: 289,
  category: "Repairs",
  icon: Smartphone,
  label: "Popular",
};

const temperedGlass: CatalogItem = {
  id: "tempered-glass",
  sku: "ACC-GLASS-01",
  name: "Tempered glass",
  description: "iPhone 12 · clear",
  price: 39,
  category: "Products",
  icon: ShieldCheck,
};

const catalogItems: CatalogItem[] = [
  screenReplacement,
  {
    id: "battery-replacement",
    sku: "REP-IP12-BATTERY",
    name: "Battery replacement",
    description: "iPhone 12 · premium cell",
    price: 189,
    category: "Repairs",
    icon: BatteryCharging,
  },
  {
    id: "charging-port",
    sku: "REP-IP12-PORT",
    name: "Charging port",
    description: "iPhone 12 · clean or replace",
    price: 149,
    category: "Repairs",
    icon: Cable,
  },
  {
    id: "camera-replacement",
    sku: "REP-IP12-CAMERA",
    name: "Back camera",
    description: "iPhone 12 · replacement",
    price: 229,
    category: "Repairs",
    icon: Camera,
  },
  {
    id: "diagnostic",
    sku: "REP-DIAG-01",
    name: "Device diagnostic",
    description: "Inspection and estimate",
    price: 35,
    category: "Repairs",
    icon: Settings2,
  },
  {
    id: "water-damage",
    sku: "REP-WATER-01",
    name: "Water damage check",
    description: "Internal inspection",
    price: 59,
    category: "Repairs",
    icon: ShieldCheck,
  },
  {
    id: "carrier-unlock",
    sku: "UNLOCK-CARRIER",
    name: "Carrier unlock",
    description: "Eligibility check included",
    price: 89,
    category: "Unlocking",
    icon: Smartphone,
  },
  {
    id: "sim-setup",
    sku: "UNLOCK-SIM-SETUP",
    name: "SIM setup",
    description: "Transfer and activation help",
    price: 25,
    category: "Unlocking",
    icon: Settings2,
  },
  temperedGlass,
  {
    id: "usb-c-cable",
    sku: "ACC-CABLE-USBC",
    name: "USB-C cable",
    description: "1 m · braided",
    price: 29,
    category: "Products",
    icon: Cable,
  },
  {
    id: "wall-adapter",
    sku: "ACC-ADAPTER-20W",
    name: "20W wall adapter",
    description: "USB-C fast charger",
    price: 59,
    category: "Products",
    icon: BatteryCharging,
  },
  {
    id: "phone-case",
    sku: "ACC-CASE-IP12",
    name: "Protective case",
    description: "iPhone 12 · matte black",
    price: 49,
    category: "Products",
    icon: Smartphone,
  },
  {
    id: "trade-in-check",
    sku: "TRADE-IN-CHECK",
    name: "Trade-in assessment",
    description: "Condition and value check",
    price: 0,
    category: "Trade-in",
    icon: Package,
  },
  {
    id: "data-transfer",
    sku: "MISC-DATA-TRANSFER",
    name: "Data transfer",
    description: "Move data to a new device",
    price: 49,
    category: "Miscellaneous",
    icon: ArrowLeftRight,
  },
  {
    id: "device-cleaning",
    sku: "MISC-CLEAN-01",
    name: "Device cleaning",
    description: "Exterior clean and check",
    price: 19,
    category: "Miscellaneous",
    icon: Headphones,
  },
];

const initialCart: CartLine[] = [
  { item: screenReplacement, quantity: 1 },
  { item: temperedGlass, quantity: 1 },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function PosPreview() {
  const [activeCategory, setActiveCategory] =
    useState<CatalogCategory>("Repairs");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanQuery, setScanQuery] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [cart, setCart] = useState(initialCart);
  const [checkoutNotice, setCheckoutNotice] = useState("");

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return catalogItems.filter((item) => {
      const matchesCategory = item.category === activeCategory;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cart.reduce(
    (total, line) => total + line.item.price * line.quantity,
    0,
  );

  function addToCart(item: CatalogItem) {
    setCart((currentCart) => {
      const existingLine = currentCart.find(
        (line) => line.item.id === item.id,
      );

      if (existingLine) {
        return currentCart.map((line) =>
          line.item.id === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }

      return [...currentCart, { item, quantity: 1 }];
    });
    setCheckoutNotice("");
  }

  function changeQuantity(itemId: string, delta: number) {
    setCart((currentCart) =>
      currentCart.flatMap((line) => {
        if (line.item.id !== itemId) return [line];

        const quantity = line.quantity + delta;
        return quantity > 0 ? [{ ...line, quantity }] : [];
      }),
    );
    setCheckoutNotice("");
  }

  function handleScanKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    const query = scanQuery.trim().toLowerCase();
    if (!query) return;

    const item = catalogItems.find(
      (candidate) =>
        candidate.sku.toLowerCase() === query ||
        candidate.name.toLowerCase() === query,
    );

    if (!item) {
      setScanMessage("No matching item. Try a name or demo SKU.");
      return;
    }

    addToCart(item);
    setScanMessage(`${item.name} added to this sale.`);
    setScanQuery("");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex min-h-16 max-w-[1720px] items-center gap-5 px-4 py-2 lg:px-7">
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-heading text-sm font-bold tracking-wide">
                AFIX <span className="text-primary">GADGET</span>
              </p>
              <p className="text-[10px] tracking-[0.18em] text-sidebar-foreground/60 uppercase">
                Repair & retail
              </p>
            </div>
          </div>

          <Separator
            orientation="vertical"
            className="hidden h-8 bg-sidebar-border md:block"
          />

          <nav
            aria-label="Main navigation"
            className="hidden min-w-0 items-center gap-1 overflow-x-auto md:flex"
          >
            {["Repairs", "Inventory", "Customers"].map((item) => (
              <span
                className="rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75"
                key={item}
              >
                {item}
              </span>
            ))}
            <span
              aria-current="page"
              className="rounded-lg bg-sidebar-accent px-3 py-2 text-sm font-semibold text-sidebar-accent-foreground"
            >
              Point of sale
            </span>
            <span className="rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75">
              Reports
            </span>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Badge
              className="hidden border-sidebar-border bg-sidebar-accent text-sidebar-foreground sm:inline-flex"
              variant="outline"
            >
              Kuala Terengganu
            </Badge>
            <ThemeSwitcher
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              variant="ghost"
            />
            <Button
              aria-label="Help"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              size="icon"
              variant="ghost"
            >
              <CircleHelp aria-hidden="true" />
            </Button>
            <Button
              aria-label="Notifications"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              size="icon"
              variant="ghost"
            >
              <Bell aria-hidden="true" />
            </Button>
            <div className="flex size-9 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent text-xs font-semibold text-primary">
              AD
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1720px] flex-1 px-4 py-5 md:px-6 md:py-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Front desk</span>
              <ChevronRight className="size-4" aria-hidden="true" />
              <span className="text-foreground">Point of sale</span>
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              Repair & checkout
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Start a repair intake or add products to a sale.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="gap-1.5" variant="outline">
              <span className="size-2 rounded-full bg-emerald-500" />
              Register open
            </Badge>
            <Badge variant="secondary">Preview data</Badge>
          </div>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(360px,0.88fr)_minmax(0,1.42fr)]">
          <Card className="flex min-h-[680px] flex-col">
            <CardHeader className="border-b border-border/70 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Current sale</CardTitle>
                  <CardDescription className="mt-1">
                    Repair intake and retail items
                  </CardDescription>
                </div>
                <Badge variant="outline">{itemCount} items</Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4 py-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <UserRound className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">Walk-in customer</p>
                  <p className="text-xs text-muted-foreground">
                    Customer details can be added
                  </p>
                </div>
                <Button
                  aria-label="Search customers"
                  className="size-11"
                  size="icon"
                  variant="outline"
                >
                  <Search aria-hidden="true" />
                </Button>
                <Button
                  aria-label="Add customer"
                  className="size-11"
                  size="icon"
                  variant="secondary"
                >
                  <Plus aria-hidden="true" />
                </Button>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="scan-item"
                >
                  Scan or search an item
                </label>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <ScanLine
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      className="h-12 pl-10"
                      id="scan-item"
                      onChange={(event) => {
                        setScanQuery(event.target.value);
                        setScanMessage("");
                      }}
                      onKeyDown={handleScanKeyDown}
                      placeholder="Enter item name or SKU"
                      value={scanQuery}
                    />
                  </div>
                  <Button
                    className="h-12 px-4"
                    onClick={() => {
                      const item = catalogItems.find(
                        (candidate) =>
                          candidate.sku.toLowerCase() ===
                            scanQuery.trim().toLowerCase() ||
                          candidate.name.toLowerCase() ===
                            scanQuery.trim().toLowerCase(),
                      );

                      if (item) {
                        addToCart(item);
                        setScanMessage(`${item.name} added to this sale.`);
                        setScanQuery("");
                      } else if (scanQuery.trim()) {
                        setScanMessage(
                          "No matching item. Try a name or demo SKU.",
                        );
                      }
                    }}
                    type="button"
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {scanMessage && (
                  <p
                    aria-live="polite"
                    className="mt-2 text-xs text-muted-foreground"
                  >
                    {scanMessage}
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Items in this sale</p>
                {cart.length > 0 && (
                  <Button
                    className="h-9 px-2.5 text-muted-foreground"
                    onClick={() => {
                      setCart([]);
                      setCheckoutNotice("");
                    }}
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 text-center">
                    <Package
                      className="mb-3 size-8 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <p className="font-medium">Your sale is empty</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose a repair or product to add it here.
                    </p>
                  </div>
                ) : (
                  cart.map(({ item, quantity }) => {
                    const ItemIcon = item.icon;

                    return (
                      <div
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                        key={item.id}
                      >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                          <ItemIcon className="size-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            aria-label={`Decrease ${item.name} quantity`}
                            className="size-11"
                            onClick={() => changeQuantity(item.id, -1)}
                            size="icon"
                            type="button"
                            variant="outline"
                          >
                            <Minus aria-hidden="true" />
                          </Button>
                          <span className="min-w-8 text-center text-sm font-semibold">
                            {quantity}
                          </span>
                          <Button
                            aria-label={`Increase ${item.name} quantity`}
                            className="size-11"
                            onClick={() => changeQuantity(item.id, 1)}
                            size="icon"
                            type="button"
                            variant="outline"
                          >
                            <Plus aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>

            <CardFooter className="flex-col items-stretch gap-4 p-4">
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Discount</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold tracking-tight">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Demo totals only. Tax and discounts are not configured.
                </p>
              </div>

              {checkoutNotice && (
                <p
                  aria-live="polite"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
                >
                  {checkoutNotice}
                </p>
              )}

              <div className="grid grid-cols-[1fr_1.5fr] gap-3">
                <Button
                  className="min-h-12"
                  onClick={() => {
                    setCheckoutNotice(
                      "Sale held in this preview. Nothing has been saved.",
                    );
                  }}
                  type="button"
                  variant="outline"
                >
                  <Ticket aria-hidden="true" />
                  Hold
                </Button>
                <Button
                  className="min-h-12"
                  disabled={cart.length === 0}
                  onClick={() => {
                    setCheckoutNotice(
                      "Preview only — no payment was processed.",
                    );
                  }}
                  type="button"
                >
                  <CreditCard aria-hidden="true" />
                  Checkout
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="flex min-h-[680px] flex-col">
            <CardHeader className="border-b border-border/70 pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Repair & product catalog</CardTitle>
                  <CardDescription className="mt-1">
                    Select an item to add it to the current sale.
                  </CardDescription>
                </div>
                <Badge className="gap-1.5" variant="outline">
                  <Check className="size-3.5" aria-hidden="true" />
                  Touch-friendly
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4 py-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Mobile repair</span>
                <ChevronRight
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">Apple</span>
                <ChevronRight
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Badge variant="secondary">iPhone 12</Badge>
                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <Tabs
                className="flex flex-1 flex-col"
                onValueChange={(value) => {
                  const selected = categories.find(
                    (category) => category.value === value,
                  );
                  if (selected) setActiveCategory(selected.value);
                  setSearchQuery("");
                }}
                value={activeCategory}
              >
                <TabsList className="grid h-auto w-full grid-cols-5 gap-1 rounded-xl p-1">
                  {categories.map(({ value, icon: Icon }) => (
                    <TabsTrigger
                      className="min-h-12 flex-col gap-1 px-1 py-2 text-[11px] sm:flex-row sm:text-sm"
                      key={value}
                      value={value}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span className="truncate">{value}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[220px] flex-1">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      className="h-12 pl-10"
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={`Search ${activeCategory.toLowerCase()}...`}
                      value={searchQuery}
                    />
                  </div>
                  <Button className="min-h-12" type="button" variant="outline">
                    <ScanLine aria-hidden="true" />
                    Scan barcode
                  </Button>
                </div>

                <TabsContent
                  className="mt-4 flex-1"
                  value={activeCategory}
                >
                  {filteredItems.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                      {filteredItems.map((item) => {
                        const ItemIcon = item.icon;
                        const isInCart = cart.some(
                          (line) => line.item.id === item.id,
                        );

                        return (
                          <Button
                            aria-pressed={isInCart}
                            className={`h-auto min-h-40 w-full flex-col items-stretch justify-between gap-3 rounded-xl p-4 text-left whitespace-normal ${
                              isInCart
                                ? "border-primary bg-primary/10"
                                : "bg-card"
                            }`}
                            key={item.id}
                            onClick={() => addToCart(item)}
                            type="button"
                            variant="outline"
                          >
                            <span className="flex w-full items-start justify-between gap-3">
                              <span
                                className={`flex size-11 items-center justify-center rounded-xl ${
                                  isInCart
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-accent text-accent-foreground"
                                }`}
                              >
                                <ItemIcon
                                  className="size-5"
                                  aria-hidden="true"
                                />
                              </span>
                              {isInCart ? (
                                <Badge className="gap-1" variant="default">
                                  <Check
                                    className="size-3"
                                    aria-hidden="true"
                                  />
                                  Added
                                </Badge>
                              ) : item.label ? (
                                <Badge variant="secondary">{item.label}</Badge>
                              ) : null}
                            </span>
                            <span className="block w-full">
                              <span className="block text-sm font-semibold leading-snug">
                                {item.name}
                              </span>
                              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                {item.description}
                              </span>
                            </span>
                            <span className="flex w-full items-center justify-between gap-2">
                              <span className="text-sm font-bold">
                                {item.price === 0
                                  ? "No charge"
                                  : formatCurrency(item.price)}
                              </span>
                              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground">
                                <Plus className="size-4" aria-hidden="true" />
                              </span>
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
                      <Search
                        className="mb-3 size-7 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <p className="font-medium">No matching items</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try another search or choose a different category.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="size-4" aria-hidden="true" />
                Repair tickets can include parts and labor.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Inventory preview</Badge>
                <Badge variant="secondary">
                  {cart.length} line{cart.length === 1 ? "" : "s"} selected
                </Badge>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ReceiptText className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">Sales summary</p>
              <p className="text-xs text-muted-foreground">
                {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
                {formatCurrency(subtotal)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
              <Ticket className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">Repair intake</p>
              <p className="text-xs text-muted-foreground">
                Device, issue, parts, and notes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
              <CreditCard className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">Payment methods</p>
              <p className="text-xs text-muted-foreground">
                Cash, card, and e-wallet
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
