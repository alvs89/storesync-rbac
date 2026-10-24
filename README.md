# StoreSync

**Retail Inventory and Store Management System for E.M. Cayetano Trading**

StoreSync is a web-based application for managing retail inventory and store operations across the Manggahan and San Rafael branches. It brings inventory monitoring, sales, supplier purchases, replenishment planning, reports, and administrative oversight into a role-based interface.

## Core Modules

| Module | Capabilities |
| --- | --- |
| **Dashboard** | Role-specific summaries, operational alerts, recent activity, and a Super Admin branch performance summary linked to Reports. |
| **Search Products** | Product lookup and availability checks within the user's branch scope. |
| **Inventory** | Product records, stock levels, stock-in and stock-out transactions, item approval requests, and archiving. |
| **Archive** | Archived inventory review, with the Restore control available to the Admin role. |
| **Sales** | Sales entry, Sales Invoice numbers, payment details, customer information, refunds, administrative cancellation, and PDF receipts. |
| **Purchases** | Supplier receiving, item quantities and costs, payment terms, transaction details, and supplier-category filtering. |
| **Reports** | Inventory, replenishment, purchases, stock movements, actual earnings, business insights, and PDF exports, subject to role access. |
| **Alerts** | Inventory warnings and operational reminders, including supplier payment reminders where applicable. |
| **Maintenance** | Super Admin access to backup, restore, optimization, integrity checks, and system information. Database operations require the configured backend and PostgreSQL tools. |
| **User Management** | Account review, activation status, and role administration; Super Admin manages system-wide access and branch transfers. |
| **Audit Trail** | Review of recorded user actions for administrative accountability. |
| **Help** | Role-specific FAQs, task guides, troubleshooting, support information, and downloadable PDF user manuals. |

### Supplier Discovery

The **Supplier Categories** multi-select in Purchases narrows the available suppliers using their associated product categories. Multiple selections use OR matching: a supplier qualifies when it offers products in at least one selected category.

The interface provides category and supplier search, matching supplier counts, category descriptions, and clear filter controls. **Other supplier / not listed** remains available. Supplier filtering is separate from the product category filter, and a conflicting selection requires user review rather than automatic replacement.

Supplier-category information comes from associated product records and the purchase catalog available to the interface. Catalog entries marked **(Demo)** are preview items and cannot be saved as actual inventory deliveries.

### Branch Performance Comparison

Super Admin can compare both branches in **Reports > Business Insights** and access a compact summary from Dashboard. The comparison includes:

- Sales
- Actual Profit
- Profit Margin
- Completed Transactions
- Units Sold
- Out-of-Stock Items
- Items Requiring Replenishment

Sales metrics use completed sales for the selected period. Stock metrics represent the current inventory snapshot. Actual Profit uses recorded sale-time costs and excludes operating expenses. Margin differences are expressed in **percentage points**.

The comparison checks for updates every 30 seconds and after supported local record changes. Business insights use predefined rules applied to recorded data; they are not AI-generated forecasts.

## User Roles and Access

All five roles can access **Dashboard**, **Search Products**, **Alerts**, and **Help**. Operational screens and actions depend on the assigned role and branch.

| Role | Additional Access and Responsibilities |
| --- | --- |
| **Super Admin** | All modules, both branches, branch comparisons, Maintenance, system-wide user administration, and branch transfers. Individual actions remain subject to their module-specific controls. |
| **Admin** | Branch-level Inventory, Archive, Reports, Sales, Purchases, User Management, and Audit Trail. Can review inventory requests, restore archived items, and administer staff accounts within the assigned branch. Maintenance is excluded. |
| **Sales Encoder** | Inventory viewing and Sales, including sales entry and refunds. Inventory management and Reports are excluded. |
| **Inventory Staff** | Inventory operations, item approval requests, Archive viewing, Purchases, and permitted inventory-related reports. Sales entry and archive restoration are excluded. |
| **Sales Encoder + Inventory Staff** | Combined sales and inventory responsibilities, Purchases, Archive viewing, and permitted reports, including Sales-Based Stock Movement. Administrative and Maintenance access are excluded. |

The canonical permission definitions are maintained in [`client/src/utils/roles.js`](client/src/utils/roles.js). Help content and PDF manuals reflect these roles.

## Running the Demonstration

### Requirements

- Node.js compatible with the Vite 6 toolchain; Node.js 22 is a suitable baseline.
- npm
- Git
- A modern web browser

### Installation and Startup

```bash
git clone https://github.com/alvs89/storesync-rbac.git
cd storesync-rbac/client
npm ci
npm run dev
```

Open the URL printed by Vite. The configured development port is **3000**, normally available at `http://localhost:3000`. If that port is occupied, use the address shown in the terminal.

### Demonstration Accounts

These credentials belong to the browser-local demonstration dataset. They are not production credentials.

| Username | Password | Role | Assigned Branch |
| --- | --- | --- | --- |
| `admin` | `admin123` | Super Admin | Manggahan; can switch active branch |
| `branchadmin` | `admin123` | Admin | Manggahan |
| `salesencoder` | `admin123` | Sales Encoder | Manggahan |
| `inventorystaff` | `admin123` | Inventory Staff | San Rafael |
| `branchstaff` | `admin123` | Sales Encoder + Inventory Staff | San Rafael |

### Data Persistence and Execution Model

The committed frontend entry point enables a browser-local data adapter through `enablePrototypeStorage()` in [`client/src/main.jsx`](client/src/main.jsx). Demonstration records are initialized locally, and changes persist in the browser's `localStorage` under `storesync_prototype_data_v1`.

This configuration does not require the Express server, PostgreSQL, SMTP, or environment files for the standard demonstration. Records are specific to the browser profile and origin; they are not synchronized across devices. Included sample records are demonstration data, not verified company transactions.

Changing `VITE_API_BASE_URL` alone does **not** switch the frontend to PostgreSQL-backed operation while the local adapter remains enabled. The local adapter is not a substitute for server-side authentication, authorization, email delivery, or database recovery.

To reset only the local demonstration dataset, run the following in the browser developer console. This removes locally entered records in that dataset and recreates the sample records after reload.

```javascript
localStorage.removeItem('storesync_prototype_data_v1');
location.reload();
```

## Backend Configuration

The repository also contains an Express API and PostgreSQL implementation. Running the backend independently requires a database and environment configuration; connecting the frontend requires explicitly disabling the local adapter and verifying the integrated workflow.

From the repository root:

```bash
cd server
npm ci
```

Copy [`server/.env.example`](server/.env.example) to `server/.env` and provide the values required for the intended environment:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `JWT_SECRET` | Private signing secret for authentication tokens. |
| `PORT` | API port; the example uses `5000`. |
| `CORS_ORIGIN` | Permitted deployed frontend origin or comma-separated origins. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | Email delivery configuration for verification and account notices. |
| `REQUIRE_LOGIN_OTP` | Login verification setting; the example enables it. |
| `SYSTEM_LOG_RETENTION_DAYS` | System log retention setting. |
| `PG_DUMP_PATH`, `PSQL_PATH` | Optional PostgreSQL executable paths for database backup and restore. |

Start the API with:

```bash
npm start
```

For development with automatic restart, use `npm run dev`. The API health endpoint is `/api/health`. Startup includes runtime schema initialization; use a database appropriate to the intended environment.

Frontend API configuration is documented in [`client/.env.example`](client/.env.example). Database-backed hosting also requires server-side role enforcement, email configuration where applicable, and end-to-end verification. A successful frontend build alone does not establish deployment readiness.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Interface | React 19, Vite 6, Tailwind CSS, custom CSS, Radix UI, Lucide React |
| Requests and exports | Axios, jsPDF, jsPDF AutoTable |
| Backend | Node.js, Express 5, JWT, bcryptjs, Nodemailer |
| Database | PostgreSQL through `pg` |
| Verification | Node.js test runner and Playwright Chromium |

## Repository Structure

```text
client/
  src/components/     Application modules and shared UI components
  src/styles/         Shared styling
  src/utils/          Permissions, calculations, data adapters, and unit tests
  scripts/            Browser verification scripts
  vite.config.js      Development server and build configuration
server/
  index.js            Express API and runtime database initialization
  database.sql        Database schema reference
  scripts/            Data preparation and verification utilities
README.md
```

## Build and Verification

From `client/`, build the frontend and run the existing unit tests:

```bash
npm run build
node --test src/utils/supplierCategories.test.mjs src/utils/supplierCategoryDemoData.test.mjs src/utils/branchComparison.test.mjs src/utils/branchComparisonEndpoint.test.mjs
```

The frontend build output is written to `client/build/`.

With the frontend development server running, execute the browser checks from `client/`:

```bash
node scripts/verify-supplier-filter.cjs
node scripts/verify-supplier-category-coverage.cjs
node scripts/verify-branch-comparison.cjs
node scripts/verify-dashboard-branch-summary.cjs
node scripts/verify-help-module.cjs
```

The browser scripts use Playwright Chromium and isolated browser contexts. If Chromium is unavailable, install it with `npx playwright install chromium`. Their default application URL is `http://127.0.0.1:3000`; set `STORESYNC_URL` when using another address.

From `server/`, check API syntax:

```bash
npm run check
```

Database deployment verification is available through `npm run deploy:verify` in `server/` and requires the intended database configuration. Syntax, unit, and browser checks do not replace verification against a live PostgreSQL deployment.

## Contribution Guidelines

1. Pull the latest changes and create a focused feature or fix branch.
2. Preserve existing workflows and apply the shared role definitions.
3. Use consistent interface styling, accessible controls, and responsive layouts.
4. Run the checks relevant to the change before opening a pull request.
5. Keep credentials, environment files, dependencies, and generated build artifacts out of commits.
6. Describe the resulting behavior and verification performed in the pull request.

## Project Team

- Donato, Raymond B.
- Guillermo, Alvin J.
- Niez, John Alces B.

Bachelor of Science in Computer Science

Technological Institute of the Philippines
