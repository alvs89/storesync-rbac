# StoreSync

**Retail Inventory and Store Management System for E.M. Cayetano Trading**

## Overview

StoreSync is a web-based system that supports the daily retail operations of E.M. Cayetano Trading across its Manggahan and San Rafael branches. It organizes product information, branch inventory, sales transactions, supplier purchases, stock movements, and operational reports within a shared application interface.

The system serves store administrators, sales personnel, and inventory staff through defined user roles. Staff can carry out their assigned responsibilities, while administrators review records, manage access, and monitor store performance within their authorized branch scope.

## Objectives

- Maintain organized product records and branch-specific stock information.
- Record sales, supplier deliveries, and stock adjustments with supporting transaction details.
- Help personnel identify stock shortages and replenishment requirements.
- Provide reports for inventory review, purchasing, sales analysis, and management oversight.
- Establish accountability through role-based access, approval workflows, and recorded user actions.
- Provide accessible operational guidance through the application's Help module.

## System Modules

| Module | Description |
| --- | --- |
| **Dashboard** | Presents role-appropriate operational summaries, stock indicators, sales information, activity, alerts, and shortcuts to daily tasks. |
| **Search Products** | Allows personnel to locate products and review item details and availability within their authorized scope. |
| **Inventory** | Maintains product details, quantities, categories, suppliers, and stock thresholds. Supports stock-in and stock-out transactions, batch adjustments, item requests, administrative review, and archiving. |
| **Archive** | Provides access to archived inventory records. The Admin role can restore eligible items to active inventory. |
| **Sales** | Records customer purchases, invoice references, item quantities, prices, and payment details. Includes transaction history, pending payment verification, refunds, administrative cancellation, and PDF receipts. |
| **Purchases** | Records supplier deliveries, purchased items, quantities, costs, document references, and payment terms. Supports supplier lookup, category filtering, purchase history, and credit payment tracking. |
| **Reports** | Provides inventory summaries, detailed inventory, low-stock analysis, supplier reorder information, purchase records, stock movement history, sales analysis, actual earnings, and business insights with PDF export. Report availability follows user permissions. |
| **Alerts** | Consolidates stock warnings, payment reminders, inventory request notifications, and account or system notices relevant to the user's role. |
| **User Management** | Supports account review, approval, activation status, and role assignment. Super Admin oversees administrative accounts and branch transfers; Admin manages permitted staff accounts within the assigned branch. |
| **Audit Trail** | Provides administrative review of recorded actions, including the actor, affected record, action details, and time. Search and filters support record inspection. |
| **Maintenance** | Provides Super Admin with system information, database backup and restore controls, optimization, log maintenance, and integrity checks. Database operations require the configured backend and supporting PostgreSQL tools. |
| **Help** | Provides role-specific FAQs, operational instructions, troubleshooting, support details, and downloadable PDF user manuals. |

## Daily Operational Flow

1. **Access the assigned workspace.** Sign in and review the Dashboard, branch context, alerts, and available tasks.
2. **Review products and stock.** Search for items, inspect availability, and review stock warnings or replenishment information.
3. **Record incoming inventory.** Enter supplier deliveries through Purchases or record authorized stock-in transactions with the appropriate quantities and references.
4. **Process customer transactions.** Select items, enter invoice and payment information, and save sales through Sales. Review transaction history for receipt generation, payment verification, or refunds.
5. **Maintain inventory records.** Record stock adjustments with reasons, submit or review item requests, and archive records when appropriate.
6. **Review operations.** Use Reports and Audit Trail to inspect stock movements, purchases, sales, and recorded actions. Authorized administrators manage access and perform system maintenance.

Each step is available according to the user's permissions. Help provides instructions for the activities assigned to each role.

## User Roles

All roles have access to **Dashboard**, **Search Products**, **Alerts**, and **Help**. Additional screens and actions are governed by role and branch assignments.

| Role | Scope and Responsibilities |
| --- | --- |
| **Super Admin** | System-wide access across both branches, including operational modules, reports, user administration, Audit Trail, and Maintenance. Can switch the active branch and manage branch transfers. Individual actions follow their module-specific controls. |
| **Admin** | Branch administration through Inventory, Archive, Reports, Sales, Purchases, User Management, and Audit Trail. Reviews inventory requests, restores archived items, and manages permitted staff accounts. |
| **Sales Encoder** | Inventory viewing and sales responsibilities, including customer transactions, payment details, transaction history, and refunds. |
| **Inventory Staff** | Inventory operations, item requests, Archive viewing, supplier purchases, and authorized inventory-related reports. |
| **Sales Encoder + Inventory Staff** | Combined sales and inventory responsibilities, including Purchases, Archive viewing, and authorized reports. |

Permission definitions are maintained in [`client/src/utils/roles.js`](client/src/utils/roles.js). Access to a module does not grant every administrative action within it.

## Records and Reporting

StoreSync distinguishes product information from branch stock records and retains transaction details for sales, purchases, and inventory movements. Approval requests and audit records support administrative review of changes.

Reports use the selected period and applicable filters. Financial summaries use recorded transaction information; Actual Profit is based on sale-time item costs and does not deduct operating expenses. Inventory status represents the applicable stock snapshot. Business insights apply predefined rules to stored records, and Super Admin can review comparative branch performance.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 6, Tailwind CSS, custom CSS, Radix UI, Lucide React |
| Requests and document generation | Axios, jsPDF, jsPDF AutoTable |
| Backend | Node.js, Express 5, JWT, bcryptjs, Nodemailer |
| Database | PostgreSQL through `pg` |
| Verification | Node.js test runner, Playwright Chromium |

## Installation and Local Operation

### Requirements

- Node.js compatible with Vite 6; Node.js 22 is a suitable baseline.
- npm and Git.
- A modern web browser.

### Start the Application

```bash
git clone https://github.com/alvs89/storesync-rbac.git
cd storesync-rbac/client
npm ci
npm run dev
```

Open the address printed by Vite. The configured development port is **3000**, normally `http://localhost:3000`. Use the terminal's reported address if another port is assigned.

### Demonstration Accounts

The browser-local dataset includes the following accounts for evaluating role-specific workflows. These are demonstration credentials.

| Username | Password | Role | Assigned Branch |
| --- | --- | --- | --- |
| `admin` | `admin123` | Super Admin | Manggahan; active branch can be switched |
| `branchadmin` | `admin123` | Admin | Manggahan |
| `salesencoder` | `admin123` | Sales Encoder | Manggahan |
| `inventorystaff` | `admin123` | Inventory Staff | San Rafael |
| `branchstaff` | `admin123` | Sales Encoder + Inventory Staff | San Rafael |

### Local Data Storage

The frontend entry point in [`client/src/main.jsx`](client/src/main.jsx) enables a browser-local data adapter. The standard local setup therefore runs without the Express API, PostgreSQL, or email configuration. Records persist in the browser's `localStorage` and are specific to the browser profile and origin; this configuration does not synchronize records across devices.

The included dataset contains sample records for demonstration, not verified company transactions. Purchase catalog entries marked **(Demo)** are preview items and cannot be saved as actual inventory deliveries.

To reset the local dataset, run the following in the browser developer console. This removes locally entered records in that dataset and recreates the sample data after reload.

```javascript
localStorage.removeItem('storesync_prototype_data_v1');
location.reload();
```

### Backend Configuration

The `server/` directory contains the Express API and PostgreSQL implementation. To run the API independently:

1. Install dependencies with `npm ci` from `server/`.
2. Copy [`server/.env.example`](server/.env.example) to `server/.env`.
3. Configure the PostgreSQL connection, JWT secret, server port, permitted origins, and email delivery settings required for the environment.
4. Run `npm start`, or `npm run dev` for automatic restart during development.

The API health endpoint is `/api/health`; the example configuration uses port **5000**. Startup includes runtime schema initialization. Database backup and restore require `pg_dump` and `psql`, either available on `PATH` or configured through `PG_DUMP_PATH` and `PSQL_PATH`.

Frontend API settings are documented in [`client/.env.example`](client/.env.example). Connecting the frontend to the API requires explicitly disabling the browser-local adapter and verifying the integrated workflows. Setting `VITE_API_BASE_URL` alone does not change the active data adapter. Database-backed operation requires server-side authentication, authorization, and persistence to be verified in the target environment.

## Repository Structure

```text
client/
  src/components/     Application modules and shared interface components
  src/styles/         Shared application styling
  src/utils/          Permissions, data adapters, calculations, and unit tests
  scripts/            Browser verification scripts
  vite.config.js      Development and build configuration
server/
  index.js            API routes and runtime database initialization
  database.sql        Database schema reference
  scripts/            Data preparation and verification utilities
README.md
```

## Build and Verification

Run the frontend build from `client/`:

```bash
npm run build
```

Build files are generated in `client/build/`. Unit tests are located in [`client/src/utils/`](client/src/utils/), and browser verification scripts are located in [`client/scripts/`](client/scripts/). Browser checks require the frontend server and Playwright Chromium; their default URL is `http://127.0.0.1:3000`, configurable through `STORESYNC_URL`.

Run the backend syntax check from `server/`:

```bash
npm run check
```

Database verification is available through `npm run deploy:verify` in `server/` with the intended database configuration. Build and syntax checks should be supplemented by workflow verification against the selected data environment.

## Contribution Guidelines

Use focused branches and pull requests, follow the shared permission definitions and interface conventions, and verify the workflows affected by each change. Keep environment files, private credentials, installed dependencies, and generated build artifacts out of commits.

## Project Team

- Guillermo, Alvin J.
- Roslin, Kendrick A.
- Roxas, Mark Kendrick P.
- Simbulan, Hirondelle D.

Bachelor of Science in Computer Science

Technological Institute of the Philippines
