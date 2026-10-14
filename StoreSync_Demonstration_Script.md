# StoreSync — Professor’s System Demonstration Script

**Format:** Spoken narration with operator cues. Read the quoted paragraphs aloud; use the action notes to guide the presenter operating the system.

**Suggested duration:** 25–35 minutes, including switching accounts and questions.

## Presenter preparation — do not read aloud

This script follows the current local implementation, including the app entry point, local data adapter, role helpers, and module components. It does not rely on the older backend description in the README.

The app currently uses browser-local data. Product creation, product updates, archiving, and ordinary completed sales have explicit local persistence handlers. Completed tracked-item sales also update inventory and create movement and audit records. Several other actions return a generic success response without retaining the requested result. A success message alone is therefore not proof that these actions completed.

Use a form walkthrough, without submitting, for supplier purchase saving, refund processing, bank-transfer completion, sale cancellation, inventory requests and approvals, batch stock movements or adjustments, archive restoration, password changes, and maintenance operations. User-account mutations use endpoints that are not fully handled by the local adapter; demonstrate their forms and role choices without committing changes. Do not promise email delivery, recovery completion, database backup, or cross-device synchronization during this demonstration.

These are implementation boundaries, not narration about development history. The spoken sections below describe observable screens and working flows without claiming unsupported outcomes.

The credentials below are verified **seed defaults**, not a live check of this browser’s stored accounts. Existing local changes may have altered passwords or roles. Rehearse every login in the same browser and application URL that will be used for the presentation. Sample records are demonstration data, not actual company transactions.

| Role | Username | Password | Assigned branch / selection |
|---|---|---|---|
| Super Admin | `admin` | `admin123` | Defaults to Manggahan; can select or switch to San Rafael |
| Admin | `branchadmin` | `admin123` | Manggahan |
| Sales Encoder | `salesencoder` | `admin123` | Manggahan |
| Inventory Staff | `inventorystaff` | `admin123` | San Rafael |
| Sales Encoder + Inventory Staff | `branchstaff` | `admin123` | San Rafael |

### Access reference

All five roles can open Dashboard, Search Products, Alerts, and Help. Additional screens and controls depend on role.

| Role | Additional access and controls |
|---|---|
| Super Admin | All modules; branch switching; inventory master data and reorder settings; sales; purchases; all report types; user administration; audit trail; Maintenance. Archive is accessible, but its current Restore button checks specifically for the Admin role. |
| Admin | Assigned-branch Inventory, Archive, Sales, Purchases, Reports, User Management, and Audit Trail. Can manage inventory master data and reorder settings. Can select staff roles when assigning roles. No Maintenance or branch-switching access. Restore is displayed in Archive. |
| Sales Encoder | Inventory viewing and Sales. Inventory action controls, unit cost, and reorder-planning columns are restricted. No Archive, Purchases, Reports, User Management, Audit Trail, or Maintenance. |
| Inventory Staff | Inventory operational controls and master-data request forms, Archive viewing, Purchases, and eight inventory/purchase report types. No Sales or administrative screens. Cannot directly manage master data or edit reorder planning. |
| Sales Encoder + Inventory Staff | Combined sales and inventory operational access, Archive viewing, Purchases, the eight inventory/purchase report types, and Sales-Based Stock Movement. No administrative screens or direct master-data management. |

The Sales screen exposes refund and bank-transfer verification controls to roles that can record sales. Entire-sale cancellation is restricted to Super Admin and Admin. Demonstrate these controls as form walkthroughs only under the current local implementation.

The older `Employee` role is normalized to Inventory Staff; it is not a separate selectable role and has no separately seeded demo account.

### Live demonstration order

1. Introduction and role overview.
2. Sales Encoder: login, dashboard, search, inventory viewing, completed cash sale, history.
3. Inventory Staff: branch scope, stock monitoring, purchase-entry walkthrough, replenishment reports.
4. Combined Staff: combined navigation and responsibilities.
5. Branch Admin: master data, requests, Archive, financial reports, users, audit.
6. Super Admin: branch switching, system-wide access, Maintenance.
7. Help, session controls, logout, closing.

Before starting, check that the selected example item has enough stock. Read quantities and prices from the current screen. Do not quote totals from seeded historical sales without checking their line items: some seed totals differ from the sum of their stored lines. For a clean live example, use the newly recorded sale instead.

## 1. Introduction and system purpose

**Action:** Display the StoreSync login page.

> “Good day, Professor. We are presenting StoreSync, a retail inventory management system for E.M. Cayetano Trading.
>
> “StoreSync brings product information, branch inventory, sales records, supplier purchase records, stock monitoring, reports, and account administration into one interface. It organizes work around two branches: Manggahan and San Rafael.
>
> “Our demonstration will follow the people who use the system. We will begin with a Sales Encoder handling a customer transaction, move to Inventory Staff reviewing stock and supplier receiving, and then show the administrative tools used to oversee branch operations.
>
> “We will use sample accounts and demonstration records throughout this presentation.”

**Action:** Briefly display the credential/access reference if your presentation includes a role slide.

> “StoreSync has five selectable roles: Super Admin, Admin, Sales Encoder, Inventory Staff, and Sales Encoder plus Inventory Staff. Each role has a defined set of screens and controls. Branch staff work within their assigned branch, while the Super Admin can switch between branches.”

## 2. Sales Encoder — login and navigation

**Action:** Enter `salesencoder` / `admin123`. Wait for Manggahan to resolve automatically, then log in.

> “We will first sign in as a Sales Encoder assigned to Manggahan. The login form checks the entered credentials and identifies the account’s assigned branch.
>
> “For this account, the branch is selected from the account assignment. After signing in, we arrive at the Dashboard.”

**Action:** Point to the account identity, branch, sidebar, and alert indicator.

> “The account information identifies who is using the system and which branch they are working in. The sidebar provides navigation to the modules available to this role. The alert indicator gives us a quick way to check notifications.
>
> “For a Sales Encoder, the operational focus is checking products and recording customer sales. Administrative tools and supplier purchasing are outside this role’s available navigation.”

**Presenter note:** Normal local login returns a session directly. Do not introduce an OTP step or use `123456` as though it were a delivered verification code. The repository contains verification and recovery screens, but an end-to-end email flow is not available from the active local adapter.

## 3. Dashboard and product lookup

**Action:** Show the visible Dashboard cards and quick actions. Open Search Products.

> “The Dashboard provides a role-specific starting point for daily work. We can review the information shown for our branch and use the available quick actions to enter the relevant module.
>
> “Before recording a sale, we need to check the requested product. We will open Search Products and search for GI Roofing Sheet.”

**Action:** Search for `GI Roofing Sheet`; show the matching Manggahan item and visible details.

> “Search Products helps staff locate a product and inspect its current branch stock information. This supports a common counter workflow: a customer asks for an item, and the encoder checks the product before preparing the transaction.”

**Action:** Open Inventory; demonstrate search, category, supplier, and stock-status filters, sorting, and pagination where records allow.

> “The Inventory module gives us a structured view of the branch’s product records. We can narrow the list using search and filters, and sort the displayed records to find items more easily.
>
> “This account can view inventory, but it does not receive the inventory management action controls. That allows a Sales Encoder to check products while keeping inventory administration with the appropriate personnel.”

## 4. Record a completed customer sale

**Action:** Open Sales. Select the tracked `GI Roofing Sheet 8ft` item. Use quantity `1`, the displayed selling price, a walk-in customer, a unique demo invoice number accepted by the form, and Cash. Complete any required customer fields using sample information.

> “Now that we have checked the product, we will record a customer sale. We select the item from the inventory list and enter the quantity sold. The form shows the selling price and calculates the line amount.
>
> “We also record the customer information and invoice reference. The form provides fields for discounts, delivery charges, payment details, and an optional actual transaction date. For this example, we will use one item, no discount, no delivery charge, and cash payment.”

**Action:** Enter an amount received that covers the displayed total. Review the total and calculated change. Save/confirm the sale using the screen’s controls.

> “Before saving, we check the item, quantity, invoice reference, and payment amount. The cash amount must cover the total, and the form calculates the customer’s change.
>
> “We will now confirm the transaction.”

**Action:** Show the receipt preview and the new record in sales history. Return to Inventory and search for the same item.

> “The sale is now listed in transaction history, and we can inspect its receipt details. The record identifies the items sold, the payment information, and the employee who encoded the transaction.
>
> “When we return to Inventory, the tracked item’s quantity has decreased by the quantity sold. This connects customer sales with stock monitoring and reduces the need to enter the same stock reduction separately.”

**Action:** In Sales history, demonstrate search and date/status filters. Show the receipt or summary download control if available for the selected transaction.

> “Sales history lets us find transactions by their references and other searchable details, then inspect individual records. The available receipt and summary controls support reviewing the transaction after it has been recorded.”

**Action:** Briefly show payment choices and the refund form without submitting either workflow.

> “The Sales form also provides payment choices such as GCash and bank transfer. The history interface distinguishes completed sales from pending-payment records.
>
> “For a customer return, the Refund Items form asks for the returned items, quantities, refund amounts, item condition, and reason. The form distinguishes resalable items from items that should not return to sellable stock. We will show those controls here, then close the form.”

**Transition:**

> “That completes the sales-side example. We will now move to the inventory role to see how staff review stock and prepare supplier receiving information.”

## 5. Inventory Staff — branch stock and supplier receiving

**Action:** Log out and confirm. Sign in as `inventorystaff` / `admin123`; show San Rafael as the assigned branch.

> “We are now using the Inventory Staff account assigned to San Rafael. The account’s branch assignment determines its operational inventory view.
>
> “This role has Inventory, Archive, Purchases, and inventory-related Reports. It does not have the Sales module or administrative screens.”

**Action:** Open Inventory. Inspect `Corrugated Roofing Sheet 10ft` or another currently low-stock item. Show unit cost and reorder information.

> “Inventory Staff can inspect product quantities, stock status, unit cost, and reorder-planning information. The stock-status filters help focus attention on items that need checking or replenishment.
>
> “The available operational forms cover stock movement and stock verification. Staff can also open request forms for product master-data changes, while direct master-data management and changes to reorder settings remain administrative controls.”

**Action:** Open one stock movement or verification form, explain the visible quantity/reason fields, then cancel. Open Purchases.

> “A stock movement should include the affected item, quantity, and an explanation of why the stock is changing. This makes the intended operation clear before it is confirmed.
>
> “For supplier deliveries, the Purchases module provides a receiving-entry form. We identify the supplier, select the supporting document type, enter its reference, and choose the payment terms.”

**Action:** Select a supplier and a matching San Rafael inventory item, such as `PVC Pipe 1in`. Enter a sample received quantity and unit cost. Show subtotal, stock-impact preview, date fields, and the review dialog if it can be opened without submission. Close without saving.

> “Each purchase line includes the item, received quantity, and unit cost. The form calculates the subtotal and previews the stock impact, allowing staff to review the delivery information before confirmation.
>
> “The date fields distinguish the actual transaction time from when the record is encoded. Purchase history provides a separate view of supplier transactions and their recorded details. Its payment follow-up controls distinguish paid and unpaid supplier records.”

**Presenter note:** Do not say this example purchase has been saved or has increased stock. The local adapter does not persist purchase creation or payment-status updates.

## 6. Alerts, replenishment planning, and inventory reports

**Action:** Open Alerts. Inspect a stock alert, use the available filters, and demonstrate read/dismiss controls only as reflected on the screen.

> “After reviewing stock, we can use Alerts to focus on conditions requiring attention. The screen identifies stock-related notifications and provides controls for organizing the displayed alerts.
>
> “An alert supports follow-up; the actual replenishment decision comes from reviewing the item’s quantities and planning information.”

**Action:** Open Reports and select Supplier Reorder Report. Show the planning values for a populated item.

> “The Supplier Reorder Report organizes replenishment information. Its calculations use the stored average daily sales, supplier lead time, safety stock, and review period to suggest when and how much to reorder.
>
> “The reorder point represents demand during lead time plus safety stock. The order-up-to level also includes demand during the review period. The suggested quantity is the amount needed to bring current stock toward that target.
>
> “These are planning calculations based on the values stored for each item. Staff should review those inputs and the business situation before preparing an order.”

**Action:** Show the final-order quantity/preparation controls where available; do not save a purchase. Switch through the other Inventory Staff report types and export one populated report to PDF.

> “This role has eight report types: Summary, Detailed Inventory, Low Stock Alert, Supplier Reorder Report, Untracked Sales Items, Category Analysis, Purchases, and Stock Movement History.
>
> “Summary and Detailed Inventory support stock review. Low Stock Alert focuses on items requiring attention. Category Analysis groups inventory information by category. Purchases and Stock Movement History provide transaction-oriented views.
>
> “Untracked Sales Items separates manually entered sales items that are not linked to an inventory record, helping staff identify items for further review.
>
> “We can apply the available report filters and export the selected report as a PDF for review or presentation.”

**Transition:**

> “Some employees cover both counter sales and inventory responsibilities. We will show how StoreSync represents that combined responsibility without giving the employee administrative access.”

## 7. Combined Sales Encoder and Inventory Staff

**Action:** Log out. Sign in as `branchstaff` / `admin123`, assigned to San Rafael. Show the sidebar and Reports dropdown.

> “This account combines Sales Encoder and Inventory Staff access. It can open Sales and Purchases, perform the inventory operational tasks available to staff, view Archive, and use Reports.
>
> “It also receives the Sales-Based Stock Movement report, which connects sales quantities with the sales records used for that report.
>
> “This role is useful when one employee covers both counter encoding and stock handling. User administration, audit-trail access, Maintenance, and direct inventory master-data management remain outside this staff role.”

**Action:** Briefly open Sales and Purchases to demonstrate both modules are accessible. Avoid repeating the full earlier forms.

**Transition:**

> “We have now shown the staff roles. Next, we will sign in as the branch administrator to demonstrate branch oversight and the controls reserved for administrative work.”

## 8. Branch Admin — master data and inventory oversight

**Action:** Log out. Sign in as `branchadmin` / `admin123`, assigned to Manggahan.

> “The Admin account oversees the assigned branch. It can access inventory management, Sales, Purchases, Archive, Reports, User Management, and Audit Trail.
>
> “This account has direct controls for inventory master data and reorder settings. It remains assigned to Manggahan and does not receive the Super Admin’s branch-switching or Maintenance controls.”

**Action:** Open Inventory and the Add Item form. Show item name, category, supplier, quantity, pricing, minimum stock, and planning fields as displayed. Optionally create one clearly named demonstration item with valid values.

> “The Add Item form brings the product identity, supplier information, stock quantity, pricing, and stock-planning values together. Maintaining these fields provides the information used by inventory views and relevant reports.
>
> “The administrator can also edit an existing item and adjust the reorder-planning inputs. Staff request forms provide a separate path for proposing master-data changes for administrative review.”

**Action:** Show the inventory requests/review interface and its visible request details; do not approve or reject a request.

> “In the request view, the administrator can inspect the requested change and its details before using the review controls. This separates a staff proposal from direct administrative editing.”

## 9. Archive and sales oversight

**Action:** If you created a disposable demonstration item, archive it with a reason. Open Archive and locate it. Otherwise, show the Archive view and explain its empty state honestly.

> “Archive provides a separate view of inventory records removed from the active list. We can search and review the archived item’s details and archive date.
>
> “For this Admin account, the Restore control opens a confirmation for returning an item to active inventory. We will show the confirmation and close it without applying a restoration.”

**Action:** Return to Sales history and open the live sale recorded earlier. Show the administrative cancellation form, then cancel the dialog.

> “The administrator can also inspect sales records. The entire-sale cancellation form requires a reason and is intended for correcting an incorrectly encoded sale. The interface distinguishes that action from a customer refund involving selected returned items.
>
> “We will leave the completed demonstration sale in history so we can use it in reporting and the audit review.”

## 10. Administrative reports and business interpretation

**Action:** Open Reports. Show Actual Earnings, Business Insights, and Sales-Based Stock Movement; use a date range containing the newly recorded sale.

> “Administrative reporting extends the inventory reports with Actual Earnings, Business Insights, and Sales-Based Stock Movement.
>
> “Actual Earnings displays sales, recorded cost of goods sold, the system’s Actual Profit figure, and profit margin. These figures depend on the recorded selling values and item costs. The Actual Profit label should be interpreted within those recorded calculations; it should not be presented as profit after every business operating expense.
>
> “Business Insights presents rule-based observations derived from the available records. These help the administrator review business conditions alongside the underlying transactions.
>
> “Sales-Based Stock Movement gives an additional view of the products and quantities associated with sales.”

**Action:** Open Stock Movement History and locate the stock-out movement for the newly recorded sale.

> “Here we can follow our example from the sale to its inventory movement. The movement records the item, quantity change, previous and resulting quantities, reason, employee, and transaction time.
>
> “This gives us a practical way to explain why the stock quantity changed.”

## 11. User Management and Audit Trail

**Action:** Open User Management. Show account names, assigned branches, roles, and Active/No Access tabs. Open Create User Account and the role selector; close without submitting.

> “User Management provides the administrator’s account overview. It shows the account identity, assigned branch, role, and access status.
>
> “The account form collects a full name, username, email address, role, and branch. The branch Admin’s role choices are the three staff roles: Sales Encoder, Inventory Staff, and the combined role.
>
> “The interface also contains account-detail, role, branch-assignment, approval, deactivation, and reactivation controls. We will inspect these controls without changing our demonstration accounts.”

**Presenter note:** A live create-account, temporary-password, approval, deactivation, or role-change outcome is not established by the active local implementation. Do not claim successful account provisioning or deactivation enforcement. No seeded pending account is guaranteed.

**Action:** Open Audit Trail. Find the new sale’s audit entry and inspect its available details and filters.

> “The Audit Trail provides a record of logged actions. We can inspect who performed an action, what record it affected, its branch, time, and available details.
>
> “For our example, the sale entry connects the recorded transaction to the employee account that encoded it. Together, the sale, stock movement, and audit record make the transaction easier to trace.”

**Transition:**

> “The branch administrator focuses on one branch. We will finish the role demonstration with the Super Admin, who has broader system access.”

## 12. Super Admin — branch switching and Maintenance

**Action:** Log out. Sign in as `admin` / `admin123`, initially using Manggahan. Show the account role and branch selector. Switch to San Rafael and open Inventory.

> “The Super Admin can access all modules and switch the active branch between Manggahan and San Rafael.
>
> “We will switch to San Rafael and inspect its inventory. The active branch indicator helps us identify the branch inventory currently being displayed.”

**Presenter note:** Super Admin inventory is scoped to the active branch. The local adapter returns sales, purchases, movement records, requests, and audit records across branches for this role; individual screens may apply their own filters. Do not state that switching branches universally filters every module.

**Action:** Open User Management and its role selector; show the five available role choices without saving.

> “The Super Admin’s role selector includes both administrative roles and all three staff roles. This provides broader account-administration controls than the branch Admin’s staff-role choices.”

**Action:** Open Maintenance. Show Create Backup, Restore Database, review export controls, System Information, Clear System Logs, Optimize Database, and Check Data Integrity where displayed. Do not execute operations.

> “Maintenance is available only to the Super Admin. The screen groups system information and administrative maintenance controls, including backup and restore, review exports, log clearing, database optimization, and data-integrity checking.
>
> “We will inspect these controls and their confirmation requirements without executing an operation during this demonstration.”

**Presenter note:** These controls are visible, but the local adapter does not establish successful database maintenance, a usable backup, or a completed integrity scan. Do not announce those outcomes.

## 13. Help, session handling, and closing

**Action:** Open Help and show the available guidance.

> “The Help module provides guidance for using the system. It gives staff a reference when they need assistance with navigation or an operational task.
>
> “Across the demonstration, each account received the navigation and controls associated with its role. We also saw how branch assignment guides staff inventory access, while the Super Admin can change the active branch.”

**Action:** Point to Logout. Mention session timing without waiting for it to occur. Log out and confirm.

> “The application also manages idle sessions. Administrative accounts have a fifteen-minute inactivity limit, while staff accounts have a thirty-minute limit. A warning appears before the session expires.
>
> “At the end of a shift or task, the user can log out explicitly. We will confirm logout now and return to the login page.”

**Closing narration:**

> “This concludes our StoreSync demonstration. We followed a customer sale from product lookup to its saved transaction, stock reduction, movement record, and audit entry. We also reviewed the interfaces for supplier receiving, replenishment planning, reporting, inventory administration, and account oversight.
>
> “StoreSync organizes these activities around defined user responsibilities and branch information, giving staff a structured way to review products and transactions while providing administrators with the appropriate oversight screens.
>
> “Thank you, Professor. We are ready for your questions.”

## Optional answers for the question period

**Where does this demonstration store its data?**

“This demonstration stores its records in the browser’s local storage. The saved records remain available in the same browser and application origin. We are not demonstrating shared database synchronization between devices.”

**Does every button complete a saved operation in this running configuration?**

“The completed sale and product-record operations we demonstrated have local persistence handlers. For the other workflows, we showed their available forms and controls without claiming a saved outcome. Purchase saving, approvals, refunds, restoration, account changes, and database maintenance require separate end-to-end verification before we can claim those outcomes in this configuration.”

**Does a refund always return an item to inventory?**

“The refund form distinguishes item condition and the intended stock result. Resalable or unused items are treated differently from items that should not return to sellable stock. We demonstrated that decision form rather than a completed refund operation.”

**Is Actual Profit the store’s final net income?**

“It is the system’s calculated figure based on the recorded sales and cost information. We would need complete operating-expense accounting to describe it as final net income.”

**Can an Inventory Staff account directly edit product master data?**

“It can open a request form for master-data changes. Direct management and editing of reorder settings are reserved for the administrative roles.”

**Can a Sales Encoder cancel an entire sale?**

“The entire-sale cancellation control is restricted to administrative roles. Roles allowed to record sales receive the refund and bank-transfer verification interfaces, which are separate controls.”

## Implementation references

- `client/src/main.jsx`: active browser-local adapter initialization.
- `client/src/utils/prototypeStorage.js`: seeded credentials, branch scope, persisted operations, and generic responses.
- `client/src/utils/roles.js`: selectable roles, screen permissions, operational permissions, and report access.
- `client/src/App.jsx`: navigation guards, branch switching, logout, and idle-session limits.
- `client/src/components/LoginScreen.jsx`: credential-based branch resolution and login flow.
- `client/src/components/InventoryModule.jsx`: master-data, request, cost, and reorder controls.
- `client/src/components/SalesModule.jsx`: sales forms, history, payment, refund, and cancellation controls.
- `client/src/components/PurchasesModule.jsx`: supplier receiving and payment follow-up forms.
- `client/src/components/ArchiveModule.jsx`: Admin-specific Restore visibility.
- `client/src/components/UserManagementModule.jsx`: role-assignment choices and account-management forms.
- `client/src/components/ReportsModule.jsx`, `Dashboard.jsx`, `AlertsModule.jsx`, `AuditTrailModule.jsx`, and `MaintenanceModule.jsx`: reporting and oversight interfaces.
