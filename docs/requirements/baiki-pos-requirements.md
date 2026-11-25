# Baiki POS — Unified POS & Repair Intake System (GitHub Copilot Requirements)

You are building **Baiki POS**, a unified Point-of-Sale (POS), Multi-Branch Inventory, and Device Repair Intake web application designed for multi-branch repair shops in Malaysia (initial deployment: **Farah's Repair Shops**).

Follow every architectural decision, scope boundary, database invariant, and security rule in this document strictly.

---

## 1. Business Context, Volume & Delivery Milestones

* **Target Operational Scale:** ~300 repairs/month average across branches, architected to comfortably handle **500+ repairs/month** during peak periods without performance degradation.
* **Currency & Locale:** Malaysian Ringgit (`MYR` / `RM`), English/Bahasa Melayu counter terminology, supporting Malaysian payment flows (Cash, DuitNow QR, Card, Bank Transfer).
* **Legacy System Replaced:** Replaces **Deepsky POS**, directly solving two critical operational pain points:
  1. **Stock-tally drift:** Unaudited manual stock edits causing physical vs. system inventory discrepancies.
  2. **Blind cross-branch stock:** Counter staff unable to check live part/product stock across other branches on the spot.
* **Delivery Roadmap:**
  * **Milestone 1 (End of December):** Working demo build tested on counter hardware (80mm thermal receipt printer, USB/Bluetooth barcode scanner).
  * **Milestone 2 (January – February):** Full POS + Repair Intake implementation, legacy Deepsky catalog CSV import, and staff UAT.
  * **Milestone 3 (March / Bulan 3):** Full production cutover prior to Deepsky POS license renewal.

---

## 2. Strict V1 Scope Boundaries (DO NOT BUILD)

To keep V1 fast, reliable, and maintainable, **DO NOT** implement any of the following features:

1. **NO WhatsApp API / External Messaging Queues:** Do NOT build Meta WhatsApp Cloud API integrations, webhook endpoints, SMS gateways, or background job queues. Customers check repair status independently by scanning the QR code printed on their 80mm thermal receipt (`/r/[ticketToken]`).
2. **NO Complex Outlet Admin / Relational Branch Tables:** Do NOT create an `Outlet` database table or branch CRUD management UI. Branches are configured as a simple `String[]` array (`outletNames`, e.g., `["HQ", "Branch B"]`) on the `Shop` model and stored as a plain `outletName` string on tickets, sales, paired devices, and branch stock records.
3. **NO Object Storage / Image Uploads in V1:** Do NOT integrate Cloudflare R2, AWS S3, or before/after device photo uploads.
4. **Embedded Digital Signatures Only:** Customer Terms & Conditions (TnC) signatures are captured on an HTML5 `<canvas>` pad and saved directly in PostgreSQL on `RepairTicket` (`signatureData` as a compact PNG data URL or SVG path string) paired with an immutable `tncSnapshot` text copy.

---

## 3. Tech Stack, Deployment & Architectural Boundaries

* **Framework:** Next.js (App Router, TypeScript, React Server Components, Server Actions & Route Handlers).
* **UI & Styling:** Tailwind CSS + Shadcn/UI, built with touch-first ergonomics for counter iPads/tablets and desktop POS terminals.
* **Database & ORM:** PostgreSQL (NeonDB) + Prisma ORM.
* **Authentication & Security:** Custom dual-cookie session architecture (`HttpOnly`, `Secure`, `SameSite=Lax`) signed with `jose` (JWT) and password/PIN hashing via `bcryptjs` or `argon2`.
* **Thermal Printing & QR:** Browser `@media print` CSS formatted specifically for **80mm thermal receipt printers**, generating QR codes via `qrcode` or `qrcode.react`.
* **Hosting Strategy:**
  * *Demo / Staging:* Vercel Free + NeonDB Free.
  * *Production Launch:* Single Node.js server process/container on a Singapore VPS (~$5–$6/mo) connected to NeonDB Free (1 GB PostgreSQL storage) for low-latency Malaysian counter responsiveness without serverless cold starts or Vercel Pro costs.
* **Backend Portability Rule:** Keep all business logic, stock ledger transactions, and authorization checks encapsulated inside `src/server/dal/*` (Data Access Layer). UI components and Next.js Route Handlers must be thin wrappers over the DAL so the backend can optionally be ported to Go (Golang) in the future without altering the PostgreSQL schema.

---

## 4. Navigation Structure & Core Functional Modules

### Collapsible Sidebar Navigation Hierarchy

```text
📁 DASHBOARD / OVERVIEW (Today's sales, active repairs by status, branch cash summary)
🛒 1. Unified POS
   ├── Product & Accessory Selling (Walk-in retail + barcode scan)
   └── Repair Intake & Checkout (New repair intake + 1-tap ticket settlement)
📦 2. Inventory & Stock
   ├── Live Branch Stock (Instant cross-branch view: HQ vs Branch B)
   ├── Stock Movements / Audit Trail (Immutable ledger of every stock change)
   └── Catalog & Pricing (Spare parts, accessories, standard repair services)
🔧 3. Repair Management
   ├── Active Tickets & Queue (Filter by status, branch, technician)
   ├── Status & Diagnostic Updates (Technician notes, quote updates)
   └── TnC Templates & Signatures (Owner editable TnC + signed customer records)
👥 4. Users & Roles
   ├── Staff PIN & Terminal Management
   └── Counter Device Pairing (One-time QR generator for counter tablets/PCs)
⚙️ 5. Shop Settings (Owner Only — Shop profile, outletNames list, receipt footer)
```

### Detailed Module Specifications

#### A. Unified POS (Walk-In Retail + Repair Settlement)
* **Single Unified Cart:** Counter staff can ring up walk-in retail items (e.g., tempered glass, charging cables) via barcode scan or quick search **and** pull in one or more completed `RepairTicket` records into the exact same checkout cart.
* **Payment Methods:** Supports **Cash**, **DuitNow QR**, **Card**, and **Bank Transfer**. For Cash payments, calculate cash tendered and change due.
* **Atomic Settlement:** Completing payment inside a single database transaction:
  1. Creates `Sale` and `SaleItem` records tagged with the terminal's `outletName` and active `cashierId`.
  2. Transitions linked `RepairTicket` records to `COMPLETED` and sets `paidAt = now()`.
  3. Deducts stock for sold retail items (where `isTrackStock === true`) and any un-deducted repair parts from the terminal's `outletName` via immutable `StockMovement` entries.
* **End-of-Day Cash Summary:** Aggregates total `CASH` sales (minus cash refunds/voids) per `outletName` and date so staff/owners can reconcile the physical cash drawer at closing.

#### B. Repair Intake & Digital TnC Signature
* **Fast Intake Form:** Captures Customer Name, Customer Phone, Device Model, Serial/IMEI (optional), Reported Issue, Branch (`outletName`, defaulted from the paired terminal's locked branch), Quoted/Estimated Price, Deposit Paid (optional), and initial itemized parts/services.
* **Digital TnC Capture:**
  * Displays the shop's active `Shop.tncContent`.
  * Customer signs on an HTML5 `<canvas>` signature pad at intake (or defers signature to `/r/[ticketToken]` if the job requires diagnosis before quoting).
  * Stores `signatureData` (compact PNG data URL or SVG path), `signedAt`, and copies `Shop.tncContent` verbatim into `RepairTicket.tncSnapshot` so future TnC template edits never mutate historical signed agreements.
* **80mm Thermal Intake Receipt:** Immediately opens a print-ready 80mm receipt displaying Shop details, Ticket Number (e.g., `R-202611-0042`), Customer & Device info, Agreed Price/Deposit, TnC summary, and a scannable QR code pointing to `https://<APP_URL>/r/<ticketToken>`.

#### C. Public Customer Repair Tracker (`/r/[ticketToken]`)
* **Zero-Login Access:** Public route keyed by an unguessable random `ticketToken` (`cuid()` or 24+ char URL-safe random token).
* **Live Status Timeline:** Visual progress indicator (`RECEIVED` → `DIAGNOSING` → `WAITING_APPROVAL` → `IN_PROGRESS` → `READY_FOR_PICKUP` → `COMPLETED` / `CANCELLED`).
* **Remote Diagnostic Quote Approval:** When a technician updates a diagnostic ticket to `WAITING_APPROVAL` with revised parts/pricing, the customer can view the itemized quote on `/r/[ticketToken]`, sign the HTML5 `<canvas>` TnC pad directly on their smartphone, and approve the repair (which automatically moves status to `IN_PROGRESS`).
* **Legal Record View:** Displays read-only copy of `tncSnapshot`, `signedAt` timestamp, and rendered signature.

#### D. Live Multi-Branch Stock & Immutable Audit Trail
* **Instant Cross-Branch Stock Lookup:** Searching by SKU, barcode, or item name displays live stock counts across **all** configured `outletNames` side-by-side (e.g., `HQ: 4 | Branch B: 1`).
* **Strict Ledger Invariant:** Direct `UPDATE` or `INCREMENT/DECREMENT` on `BranchStock.quantity` outside the stock ledger helper is **forbidden**. Every stock change (`STOCK_IN`, `SALE`, `REPAIR_PART`, `TRANSFER`, `ADJUSTMENT`) must run inside `prisma.$transaction()` and simultaneously:
  1. Upsert/update `BranchStock.quantity` for `(shopId, catalogItemId, outletName)`.
  2. Create an immutable `StockMovement` row recording `type`, `delta` (signed integer), `balanceAfter`, `outletName`, `referenceId`, `notes`, `staffId`, and `approvedById` (if manager override was required).
* **Inter-Branch Stock Transfer (`TRANSFER`):** Atomically decrements `BranchStock` at `fromOutlet` (`delta: -qty`) and increments `BranchStock` at `toOutlet` (`delta: +qty`), creating two linked `StockMovement` rows in one transaction.

#### E. Legacy Deepsky Catalog CSV Importer
* Owner-only CSV upload utility in **Inventory & Stock → Catalog & Pricing** to import legacy Deepsky POS product/part exports (`sku`, `barcode`, `name`, `category`, `costPrice`, `sellPrice`, and optional initial `HQ` / `Branch B` stock quantities via initial `STOCK_IN` ledger entries).

---

## 5. Authentication & Authorization Architecture

Baiki POS uses a **Dual-Layer Session Model** separating **Physical Terminal Trust** from **Active Staff Identity**.

### Layer 1: `device_token` (Long-Lived Terminal Cookie — 365 days)
* **Cookie Attributes:** `HttpOnly`, `Secure` (in production), `SameSite=Lax`, `Max-Age=31536000`.
* **Pairing Workflow:**
  1. Owner logs in via Email + Password (`/login`), navigates to **Users & Roles → Counter Device Pairing**, selects an `outletName` (e.g., `"HQ"`), enters a `deviceName` (e.g., `"HQ Front Counter iPad"`), and generates a single-use `PairingToken` (15-minute expiry) rendered as a QR code and clickable URL (`/pair/[setupToken]`).
  2. Opening `/pair/[setupToken]` on the counter browser validates the token hash, marks `PairingToken.usedAt = now()`, creates a `PairedDevice` record, and sets the `device_token` cookie—permanently binding that browser to `shopId` and `outletName`.
  3. Owner can revoke compromised/lost terminals at any time (`PairedDevice.revokedAt = now()`).

### Layer 2: `staff_session` (Short-Lived Shift Cookie — 8 hours)
* **Cookie Attributes:** `HttpOnly`, `Secure` (in production), `SameSite=Lax`, `Max-Age=28800`.
* **4-Digit PIN Unlock:**
  * On any paired terminal, staff unlock the counter screen by entering their **4-digit PIN** (unique per `shopId`). No staff email addresses are required.
  * Tapping **Lock / Switch Staff** clears `staff_session` and immediately displays the PIN lock screen without unpairing the terminal from its branch.

### Counter Security & Access Control Rules

1. **Route & Action Gating (Middleware + Server DAL):**
   * `/r/[ticketToken]` — Public (no cookies required).
   * `/login`, `/pair/[setupToken]` — Public authentication/pairing endpoints.
   * `/dashboard`, `/pos`, `/intake`, `/repairs`, `/stock` — Requires valid, non-revoked `device_token` **AND** active `staff_session` (`OWNER` or `STAFF`).
   * `/admin/*`, `/settings/*`, `/users/*` — Requires `role === 'OWNER'` (via Owner Email/Password login OR Owner PIN session on a paired device).
2. **Server-Enforced Outlet Scoping:** Never trust `outletName` from client request payloads for sales, ticket creation defaults, or stock deductions. Always resolve `shopId` and `outletName` from the verified server-side `device_token`. Cross-branch stock reads are allowed across the same `shopId`.
3. **Manager PIN Override:** When a `STAFF` user initiates any sensitive action:
   * Voiding a completed `Sale`
   * Applying a custom line-item or cart discount
   * Issuing a refund
   * Performing a manual stock `ADJUSTMENT`
   The UI must prompt for an `OWNER` 4-digit PIN. The server verifies the Owner PIN and records **both** `staffId` (cashier/operator) and `approvedById` (authorizing owner) on the `Sale` or `StockMovement` record.
4. **PIN Brute-Force Rate Limiting:** Track `failedAttempts` and `lockedUntil` on `PairedDevice`. After **5 consecutive failed PIN attempts**, lock PIN verification on that terminal for **60 seconds**.

---

## 6. Database Schema (`prisma/schema.prisma`)

Use this exact PostgreSQL schema as the source of truth:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  OWNER
  STAFF
}

enum RepairStatus {
  RECEIVED
  DIAGNOSING
  WAITING_APPROVAL
  IN_PROGRESS
  READY_FOR_PICKUP
  COMPLETED
  CANCELLED
}

enum StockMovementType {
  STOCK_IN
  SALE
  REPAIR_PART
  TRANSFER
  ADJUSTMENT
}

enum PaymentMethod {
  CASH
  DUITNOW_QR
  CARD
  BANK_TRANSFER
}

model Shop {
  id            String   @id @default(cuid())
  name          String
  phone         String?
  address       String?
  receiptFooter String?
  tncContent    String   @db.Text
  outletNames   String[] // e.g., ["HQ", "Branch B"]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  users          User[]
  devices        PairedDevice[]
  pairingTokens  PairingToken[]
  catalogItems   CatalogItem[]
  branchStocks   BranchStock[]
  stockMovements StockMovement[]
  repairTickets  RepairTicket[]
  sales          Sale[]
}

model User {
  id           String   @id @default(cuid())
  shopId       String
  shop         Shop     @relation(fields: [shopId], references: [id])
  name         String
  role         Role     @default(STAFF)
  email        String?  @unique // Required for OWNER web login
  passwordHash String?  // bcrypt/argon2 hash (OWNER)
  pinHash      String   // Hashed 4-digit PIN (unique per shop; used by STAFF and OWNER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  createdTickets    RepairTicket[]  @relation("TicketCreatedBy")
  assignedTickets   RepairTicket[]  @relation("TicketTechnician")
  sales             Sale[]          @relation("SaleCashier")
  approvedSales     Sale[]          @relation("SaleApprovedBy")
  stockMovements    StockMovement[] @relation("MovementStaff")
  approvedMovements StockMovement[] @relation("MovementApprovedBy")

  @@index([shopId])
}

model PairedDevice {
  id             String    @id @default(cuid())
  shopId         String
  shop           Shop      @relation(fields: [shopId], references: [id])
  outletName     String    // Locks terminal to e.g. "HQ" or "Branch B"
  deviceName     String    // e.g., "HQ Front Counter iPad"
  tokenHash      String    @unique
  failedAttempts Int       @default(0)
  lockedUntil    DateTime?
  lastSeenAt     DateTime  @default(now())
  revokedAt      DateTime?
  createdAt      DateTime  @default(now())

  @@index([shopId])
}

model PairingToken {
  id         String    @id @default(cuid())
  shopId     String
  shop       Shop      @relation(fields: [shopId], references: [id])
  outletName String
  deviceName String
  tokenHash  String    @unique
  expiresAt  DateTime
  usedAt     DateTime?
  createdAt  DateTime  @default(now())
}

model CatalogItem {
  id           String   @id @default(cuid())
  shopId       String
  shop         Shop     @relation(fields: [shopId], references: [id])
  sku          String
  barcode      String?
  name         String
  category     String?  // e.g., "Spare Part", "Accessory", "Service"
  isTrackStock Boolean  @default(true) // false for labor-only services
  costPrice    Decimal  @db.Decimal(10, 2)
  sellPrice    Decimal  @db.Decimal(10, 2)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  branchStocks   BranchStock[]
  stockMovements StockMovement[]
  ticketParts    RepairTicketPart[]
  saleItems      SaleItem[]

  @@unique([shopId, sku])
  @@index([shopId, barcode])
}

model BranchStock {
  id            String      @id @default(cuid())
  shopId        String
  shop          Shop        @relation(fields: [shopId], references: [id])
  catalogItemId String
  catalogItem   CatalogItem @relation(fields: [catalogItemId], references: [id])
  outletName    String
  quantity      Int         @default(0)
  updatedAt     DateTime    @updatedAt

  @@unique([shopId, catalogItemId, outletName])
  @@index([shopId, outletName])
}

model StockMovement {
  id            String            @id @default(cuid())
  shopId        String
  shop          Shop              @relation(fields: [shopId], references: [id])
  catalogItemId String
  catalogItem   CatalogItem       @relation(fields: [catalogItemId], references: [id])
  outletName    String
  type          StockMovementType
  delta         Int               // Positive for STOCK_IN, negative for SALE / REPAIR_PART
  balanceAfter  Int
  referenceId   String?           // Sale ID, RepairTicket ID, or Transfer reference
  notes         String?
  staffId       String
  staff         User              @relation("MovementStaff", fields: [staffId], references: [id])
  approvedById  String?
  approvedBy    User?             @relation("MovementApprovedBy", fields: [approvedById], references: [id])
  createdAt     DateTime          @default(now())

  @@index([shopId, outletName, createdAt])
  @@index([catalogItemId])
}

model RepairTicket {
  id              String       @id @default(cuid())
  shopId          String
  shop            Shop         @relation(fields: [shopId], references: [id])
  ticketNumber    String       // Human-readable e.g. "R-2611-0001"
  ticketToken     String       @unique @default(cuid()) // Public QR tracker token
  outletName      String
  status          RepairStatus @default(RECEIVED)
  customerName    String
  customerPhone   String
  deviceModel     String
  serialOrImei    String?
  reportedIssue   String       @db.Text
  diagnosticNotes String?      @db.Text
  estimatedPrice  Decimal      @db.Decimal(10, 2)
  finalPrice      Decimal?     @db.Decimal(10, 2)
  depositPaid     Decimal      @default(0) @db.Decimal(10, 2)
  tncSnapshot     String       @db.Text
  signatureData   String?      @db.Text // Base64 PNG data URL or SVG path from HTML5 <canvas>
  signedAt        DateTime?
  paidAt          DateTime?
  createdById     String
  createdBy       User         @relation("TicketCreatedBy", fields: [createdById], references: [id])
  technicianId    String?
  technician      User?        @relation("TicketTechnician", fields: [technicianId], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  parts     RepairTicketPart[]
  saleItems SaleItem[]

  @@unique([shopId, ticketNumber])
  @@index([shopId, outletName, status])
}

model RepairTicketPart {
  id            String       @id @default(cuid())
  ticketId      String
  ticket        RepairTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  catalogItemId String?
  catalogItem   CatalogItem? @relation(fields: [catalogItemId], references: [id])
  description   String
  quantity      Int          @default(1)
  unitPrice     Decimal      @db.Decimal(10, 2)
  stockDeducted Boolean      @default(false)
}

model Sale {
  id            String        @id @default(cuid())
  shopId        String
  shop          Shop          @relation(fields: [shopId], references: [id])
  receiptNumber String        // Human-readable e.g. "S-2611-0001"
  outletName    String
  subtotal      Decimal       @db.Decimal(10, 2)
  discount      Decimal       @default(0) @db.Decimal(10, 2)
  total         Decimal       @db.Decimal(10, 2)
  paymentMethod PaymentMethod
  amountPaid    Decimal       @db.Decimal(10, 2)
  changeGiven   Decimal       @default(0) @db.Decimal(10, 2)
  isVoided      Boolean       @default(false)
  voidReason    String?
  cashierId     String
  cashier       User          @relation("SaleCashier", fields: [cashierId], references: [id])
  approvedById  String?
  approvedBy    User?         @relation("SaleApprovedBy", fields: [approvedById], references: [id])
  createdAt     DateTime      @default(now())

  items SaleItem[]

  @@unique([shopId, receiptNumber])
  @@index([shopId, outletName, createdAt])
}

model SaleItem {
  id             String        @id @default(cuid())
  saleId         String
  sale           Sale          @relation(fields: [saleId], references: [id], onDelete: Cascade)
  catalogItemId  String?
  catalogItem    CatalogItem?  @relation(fields: [catalogItemId], references: [id])
  repairTicketId String?
  repairTicket   RepairTicket? @relation(fields: [repairTicketId], references: [id])
  description    String
  quantity       Int           @default(1)
  unitPrice      Decimal       @db.Decimal(10, 2)
  lineTotal      Decimal       @db.Decimal(10, 2)
}
```

---

## 7. Hardware & Counter UI Specifications

1. **80mm Thermal Receipt Printing (`@media print`):**
   * Include dedicated thermal print components (`IntakeThermalReceipt` and `SaleThermalReceipt`).
   * Enforce strict CSS print rules so standard browser headers/footers and sidebar UI never print:
     ```css
     @media print {
       @page {
         size: 80mm auto;
         margin: 2mm;
       }
       body * {
         visibility: hidden;
       }
       #thermal-receipt, #thermal-receipt * {
         visibility: visible;
       }
       #thermal-receipt {
         position: absolute;
         left: 0;
         top: 0;
         width: 76mm;
         font-family: monospace;
         font-size: 12px;
         color: #000;
       }
     }
     ```
2. **Barcode Scanner Integration:**
   * USB/Bluetooth counter barcode scanners act as HID keyboard wedges (typing digits + `Enter`).
   * In Unified POS and Live Stock Lookup, focus or bind a global barcode listener so scanning an item's `barcode` or `sku` immediately adds it to the cart or opens its cross-branch stock card without requiring mouse clicks.
3. **Money & Decimal Handling:**
   * Never use floating-point arithmetic (`number`) for money calculations. Use `Decimal.js` / integer sen (`cents`) arithmetic in TypeScript and `Decimal(10, 2)` in PostgreSQL, formatting outputs as `RM 0.00`.

---

## 8. Recommended Project Directory Structure

```text
src/
├── app/
│   ├── (public)/
│   │   ├── login/page.tsx               # Owner email/password login
│   │   ├── pair/[setupToken]/page.tsx   # Terminal pairing endpoint
│   │   └── r/[ticketToken]/page.tsx     # Public customer repair tracker & quote approval
│   ├── (counter)/                       # Protected by device_token + staff_session
│   │   ├── layout.tsx                   # Collapsible sidebar + active branch/staff header + PIN lock modal
│   │   ├── dashboard/page.tsx           # Overview & shift cash summary
│   │   ├── pos/page.tsx                 # Unified POS checkout (Retail + Repair Tickets)
│   │   ├── intake/page.tsx              # Repair Intake + HTML5 Canvas TnC signature + 80mm print
│   │   ├── repairs/page.tsx             # Active tickets queue, status & diagnostic updates
│   │   ├── stock/page.tsx               # Live cross-branch stock, ledger movements, catalog & CSV import
│   │   ├── users/page.tsx               # Staff PINs & Counter Device Pairing QR generator (Owner)
│   │   └── settings/page.tsx            # Shop profile, outletNames, TnC editor, receipt footer (Owner)
│   └── api/                             # Thin Route Handlers delegating to src/server/dal/*
├── components/
│   ├── ui/                              # Shadcn/UI primitives
│   ├── signature-pad.tsx                # Touch & mouse HTML5 <canvas> signature capture
│   ├── manager-pin-modal.tsx            # Owner 4-digit PIN override dialog
│   └── thermal-receipt.tsx              # 80mm print layout + QR code generator
└── server/
    ├── auth/                            # Cookie signing/verification (device_token & staff_session), PIN rate limiter
    ├── db.ts                            # Singleton PrismaClient
    └── dal/                             # Pure transactional business logic (Go-portable boundary)
        ├── stock.dal.ts                 # Atomic stock adjustment, transfer & StockMovement ledger
        ├── repair.dal.ts                # Ticket creation, TnC snapshot, status & quote approval
        ├── pos.dal.ts                   # Unified checkout, void/refund with manager override, EOD cash tally
        └── auth.dal.ts                  # Device pairing, PIN verification, staff/owner management
```

---

## 9. Copilot Code Generation Checklist

Whenever generating code for this repository, verify:
* [ ] **No forbidden features:** Zero WhatsApp API calls, zero S3/R2 uploads, zero `Outlet` relational models.
* [ ] **Atomic inventory:** Every stock mutation runs inside `prisma.$transaction()` and writes a `StockMovement` row with `balanceAfter` and `staffId`.
* [ ] **Server-trusted outlet:** `outletName` is always read from the verified `device_token` session, never from untrusted client form fields.
* [ ] **Audit accountability:** Voiding sales, custom discounts, refunds, and manual stock adjustments enforce Owner PIN verification and populate `approvedById`.
* [ ] **Clean DAL separation:** Database queries and business rules reside in `src/server/dal/*`, never directly inside React components.