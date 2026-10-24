import axios from 'axios';
import { SUPPLIER_CATEGORY_DEMO_PRODUCTS, SUPPLIER_CATEGORY_DEMO_VERSION, addSupplierCategoryDemoProducts } from './supplierCategoryDemoData.js';

const STORAGE_KEY = 'storesync_prototype_data_v1';
const TOKEN = 'storesync-prototype-token';
const normalizeBranch = branch => branch === 'Main Branch' ? 'Manggahan' : branch;
const DEMO_DATA_VERSION = 2;

const seedData = () => ({
  demoDataVersion: DEMO_DATA_VERSION,
  supplierCategoryDemoVersion: SUPPLIER_CATEGORY_DEMO_VERSION,
  dataClassification: 'DEMONSTRATION DATA - NOT ACTUAL BUSINESS RECORDS',
  users: [{
    id: 'demo-admin',
    username: 'admin',
    password: 'admin123',
    full_name: 'Prototype Super Admin',
    email: 'admin@storesync.local',
    role: 'Super Admin',
    branch: 'Manggahan',
    status: 'Active'
  }, {
    id: 'demo-branch-admin',
    username: 'branchadmin',
    password: 'admin123',
    full_name: 'Branch Administrator',
    email: 'branchadmin@storesync.local',
    role: 'Admin',
    branch: 'Manggahan',
    status: 'Active'
  }, {
    id: 'demo-sales-encoder',
    username: 'salesencoder',
    password: 'admin123',
    full_name: 'Jamie Santos',
    email: 'salesencoder@storesync.local',
    role: 'Sales Encoder',
    branch: 'Manggahan',
    status: 'Active'
  }, {
    id: 'demo-inventory-staff',
    username: 'inventorystaff',
    password: 'admin123',
    full_name: 'Rico Mendoza',
    email: 'inventorystaff@storesync.local',
    role: 'Inventory Staff',
    branch: 'San Rafael',
    status: 'Active'
  }, {
    id: 'demo-combined-staff',
    username: 'branchstaff',
    password: 'admin123',
    full_name: 'Alex Reyes',
    email: 'branchstaff@storesync.local',
    role: 'Sales Encoder + Inventory Staff',
    branch: 'San Rafael',
    status: 'Active'
  }],
  products: [
    ...SUPPLIER_CATEGORY_DEMO_PRODUCTS.map(product => ({ ...product })),
    { id: 'inv-1', name: 'Portland Cement 40kg', category: 'Construction', supplier_name: 'BuildRight Supply', default_selling_price: 285, cost_price: 240, stock_level: 10, min_stock_level: 12, lead_time_days: 7, safety_stock: 3, review_period_days: 5, average_daily_sales: 3, status: 'Low Stock', branch: 'Manggahan', is_demo: true },
    { id: 'inv-2', name: 'GI Roofing Sheet 8ft', category: 'Roofing', supplier_name: 'BuildRight Supply', default_selling_price: 720, cost_price: 610, stock_level: 42, min_stock_level: 10, lead_time_days: 5, safety_stock: 4, review_period_days: 7, average_daily_sales: 2, status: 'In Stock', branch: 'Manggahan', is_demo: true },
    { id: 'inv-3', name: 'PVC Pipe 1/2 inch', category: 'PVC Pipe / Fittings', supplier_name: 'PipeWorks Trading', default_selling_price: 95, cost_price: 70, stock_level: 6, min_stock_level: 8, lead_time_days: 4, safety_stock: 2, review_period_days: 5, average_daily_sales: 1, status: 'Low Stock', branch: 'Manggahan', is_demo: true },
    { id: 'inv-4', name: 'Boysen Quick Dry Enamel 1L', category: 'Paint', supplier_name: 'ColorHouse Depot', default_selling_price: 365, cost_price: 305, stock_level: 24, min_stock_level: 8, lead_time_days: 6, safety_stock: 4, review_period_days: 7, average_daily_sales: 2, status: 'In Stock', branch: 'Manggahan', is_demo: true },
    { id: 'inv-5', name: 'Marine Plywood 1/2in 4x8', category: 'Lumber & Boards', supplier_name: 'Timberline Trading', default_selling_price: 980, cost_price: 835, stock_level: 8, min_stock_level: 6, lead_time_days: 8, safety_stock: 2, review_period_days: 7, average_daily_sales: 1, status: 'In Stock', branch: 'Manggahan', is_demo: true },
    { id: 'inv-6', name: 'Steel Angle Bar 1-1/2in', category: 'Steel', supplier_name: 'Metro Steel Supply', default_selling_price: 540, cost_price: 455, stock_level: 4, min_stock_level: 6, lead_time_days: 10, safety_stock: 2, review_period_days: 5, average_daily_sales: 1, status: 'Low Stock', branch: 'Manggahan', is_demo: true },
    { id: 'inv-7', name: 'Portland Cement 40kg', category: 'Construction', supplier_name: 'BuildRight Supply', default_selling_price: 290, cost_price: 244, stock_level: 36, min_stock_level: 12, lead_time_days: 7, safety_stock: 3, review_period_days: 5, average_daily_sales: 3, status: 'In Stock', branch: 'San Rafael', is_demo: true },
    { id: 'inv-8', name: 'PVC Pipe 1in', category: 'PVC Pipe / Fittings', supplier_name: 'PipeWorks Trading', default_selling_price: 175, cost_price: 128, stock_level: 18, min_stock_level: 10, lead_time_days: 5, safety_stock: 3, review_period_days: 7, average_daily_sales: 2, status: 'In Stock', branch: 'San Rafael', is_demo: true },
    { id: 'inv-9', name: 'Corrugated Roofing Sheet 10ft', category: 'Roofing', supplier_name: 'Northline Hardware', default_selling_price: 890, cost_price: 745, stock_level: 7, min_stock_level: 10, lead_time_days: 6, safety_stock: 3, review_period_days: 5, average_daily_sales: 2, status: 'Low Stock', branch: 'San Rafael', is_demo: true },
    { id: 'inv-10', name: 'Tile Adhesive 25kg', category: 'Construction', supplier_name: 'BuildRight Supply', default_selling_price: 430, cost_price: 350, stock_level: 21, min_stock_level: 8, lead_time_days: 5, safety_stock: 3, review_period_days: 7, average_daily_sales: 2, status: 'In Stock', branch: 'San Rafael', is_demo: true },
    { id: 'inv-11', name: 'Interior Latex Paint 4L', category: 'Paint', supplier_name: 'ColorHouse Depot', default_selling_price: 780, cost_price: 655, stock_level: 5, min_stock_level: 6, lead_time_days: 7, safety_stock: 2, review_period_days: 5, average_daily_sales: 1, status: 'Low Stock', branch: 'San Rafael', is_demo: true }
  ],
  archived: [],
  sales: [
    { sales_transaction_id: 'sale-demo-1001', sales_number: 'SO-2026-1012', official_invoice_number: 'INV-2026-1012', branch: 'Manggahan', customer_type: 'walk_in', customer_name: 'Walk-in Customer', total_quantity: 5, subtotal_amount: 2105, total_amount: 2105, payment_method: 'cash', amount_received: 2200, change_amount: 95, payment_confirmed: true, status: 'completed', transaction_type: 'sale', sold_by: 'demo-sales-encoder', sold_by_name: 'Jamie Santos', remarks: 'Sample counter sale', created_at: '2026-10-12T09:25:00+08:00', items: [{ sales_item_id: 'sale-item-1001', inventory_id: 'inv-1', item_name: 'Portland Cement 40kg', category: 'Construction', branch: 'Manggahan', quantity_sold: 4, unit_price: 285, unit_cost_at_sale: 240, subtotal: 1140, cost_subtotal: 960, gross_profit: 180 }, { sales_item_id: 'sale-item-1002', inventory_id: 'inv-3', item_name: 'PVC Pipe 1/2 inch', category: 'PVC Pipe / Fittings', branch: 'Manggahan', quantity_sold: 1, unit_price: 95, unit_cost_at_sale: 70, subtotal: 95, cost_subtotal: 70, gross_profit: 25 }] },
    { sales_transaction_id: 'sale-demo-1002', sales_number: 'SO-2026-1013', official_invoice_number: 'INV-2026-1013', branch: 'Manggahan', customer_type: 'contractor', customer_name: 'Cayetano Renovation Team', total_quantity: 3, subtotal_amount: 1710, total_amount: 1710, payment_method: 'gcash', payment_confirmed: true, status: 'completed', transaction_type: 'sale', sold_by: 'demo-branch-admin', sold_by_name: 'Branch Administrator', remarks: 'Sample contractor order', created_at: '2026-10-13T14:10:00+08:00', items: [{ sales_item_id: 'sale-item-1003', inventory_id: 'inv-2', item_name: 'GI Roofing Sheet 8ft', category: 'Roofing', branch: 'Manggahan', quantity_sold: 2, unit_price: 720, unit_cost_at_sale: 610, subtotal: 1440, cost_subtotal: 1220, gross_profit: 220 }, { sales_item_id: 'sale-item-1004', inventory_id: 'inv-4', item_name: 'Boysen Quick Dry Enamel 1L', category: 'Paint', branch: 'Manggahan', quantity_sold: 1, unit_price: 365, unit_cost_at_sale: 305, subtotal: 365, cost_subtotal: 305, gross_profit: 60 }] },
    { sales_transaction_id: 'sale-demo-1003', sales_number: 'SO-2026-1014', official_invoice_number: 'INV-2026-1014', branch: 'San Rafael', customer_type: 'walk_in', customer_name: 'Walk-in Customer', total_quantity: 4, subtotal_amount: 1135, total_amount: 1135, payment_method: 'cash', amount_received: 1200, change_amount: 65, payment_confirmed: true, status: 'completed', transaction_type: 'sale', sold_by: 'demo-combined-staff', sold_by_name: 'Alex Reyes', created_at: '2026-10-14T10:05:00+08:00', items: [{ sales_item_id: 'sale-item-1005', inventory_id: 'inv-7', item_name: 'Portland Cement 40kg', category: 'Construction', branch: 'San Rafael', quantity_sold: 3, unit_price: 290, unit_cost_at_sale: 244, subtotal: 870, cost_subtotal: 732, gross_profit: 138 }, { sales_item_id: 'sale-item-1006', inventory_id: 'inv-8', item_name: 'PVC Pipe 1in', category: 'PVC Pipe / Fittings', branch: 'San Rafael', quantity_sold: 1, unit_price: 175, unit_cost_at_sale: 128, subtotal: 175, cost_subtotal: 128, gross_profit: 47 }] }
  ],
  purchases: [
    { purchase_id: 'purchase-demo-201', purchase_number: 'PO-2026-1013', supplier_name: 'BuildRight Supply', branch: 'Manggahan', status: 'received', total_amount: 12200, received_at: '2026-10-13T10:30:00+08:00', created_at: '2026-10-11T15:20:00+08:00', items: [{ purchase_item_id: 'purchase-item-201', inventory_id: 'inv-2', item_name: 'GI Roofing Sheet 8ft', category: 'Roofing', branch: 'Manggahan', quantity_received: 20, unit_cost: 610, subtotal: 12200, previous_quantity: 22, new_quantity: 42 }] },
    { purchase_id: 'purchase-demo-202', purchase_number: 'PO-2026-1014', supplier_name: 'PipeWorks Trading', branch: 'San Rafael', status: 'pending', total_amount: 6400, created_at: '2026-10-14T08:10:00+08:00', items: [{ purchase_item_id: 'purchase-item-202', inventory_id: 'inv-8', item_name: 'PVC Pipe 1in', category: 'PVC Pipe / Fittings', branch: 'San Rafael', quantity_received: 0, unit_cost: 128, subtotal: 6400, previous_quantity: 18, new_quantity: 18 }] }
  ],
  movements: [
    { movement_id: 'move-demo-1', inventory_id: 'inv-2', item_name: 'GI Roofing Sheet 8ft', category: 'Roofing', branch: 'Manggahan', action: 'STOCK_IN', quantity_changed: 20, previous_quantity: 22, new_quantity: 42, reason: 'Supplier delivery received', note: 'PO-2026-1013', actor_id: 'demo-branch-admin', actor_name: 'Branch Administrator', created_at: '2026-10-13T10:30:00+08:00' },
    { movement_id: 'move-demo-2', inventory_id: 'inv-1', item_name: 'Portland Cement 40kg', category: 'Construction', branch: 'Manggahan', action: 'STOCK_OUT', quantity_changed: -4, previous_quantity: 14, new_quantity: 10, reason: 'Customer sale', note: 'SO-2026-1012', actor_id: 'demo-sales-encoder', actor_name: 'Jamie Santos', created_at: '2026-10-12T09:25:00+08:00' },
    { movement_id: 'move-demo-3', inventory_id: 'inv-7', item_name: 'Portland Cement 40kg', category: 'Construction', branch: 'San Rafael', action: 'STOCK_OUT', quantity_changed: -3, previous_quantity: 39, new_quantity: 36, reason: 'Customer sale', note: 'SO-2026-1014', actor_id: 'demo-combined-staff', actor_name: 'Alex Reyes', created_at: '2026-10-14T10:05:00+08:00' }
  ],
  requests: [
    { request_id: 'request-demo-1', inventory_id: 'inv-1', item_name: 'Portland Cement 40kg', branch: 'Manggahan', request_type: 'restock', requested_quantity: 29, reason: 'ROP/OUT replenishment recommendation', status: 'Pending', requested_by: 'demo-branch-admin', requested_by_name: 'Branch Administrator', created_at: '2026-10-13T11:15:00+08:00' },
    { request_id: 'request-demo-2', inventory_id: 'inv-9', item_name: 'Corrugated Roofing Sheet 10ft', branch: 'San Rafael', request_type: 'restock', requested_quantity: 17, reason: 'Stock below reorder point', status: 'Approved', requested_by: 'demo-inventory-staff', requested_by_name: 'Rico Mendoza', created_at: '2026-10-12T13:40:00+08:00' }
  ],
  auditLogs: [
    {
      id: 'audit-demo-1',
      actor_id: 'demo-branch-admin',
      actor_name: 'Branch Administrator',
      target_name: 'Portland Cement 40kg',
      target_type: 'inventory_item',
      action: 'UPDATE_INVENTORY_ITEM',
      reason: 'Updated branch inventory details.',
      details: { item: 'Portland Cement 40kg', stockLevel: 10 },
      branch: 'Manggahan',
      created_at: '2026-10-13T09:15:00+08:00'
    },
    {
      id: 'audit-demo-2',
      actor_id: 'demo-branch-admin',
      actor_name: 'Branch Administrator',
      target_name: 'GI Roofing Sheet 8ft',
      target_type: 'inventory_item',
      action: 'STOCK_IN',
      reason: 'Received supplier delivery.',
      details: { item: 'GI Roofing Sheet 8ft', quantity: 20, reference: 'PO-2026-1013' },
      branch: 'Manggahan',
      created_at: '2026-10-13T10:42:00+08:00'
    },
    {
      id: 'audit-demo-3',
      actor_id: 'demo-admin',
      actor_name: 'Prototype Super Admin',
      target_name: 'Branch Administrator',
      target_type: 'user_account',
      action: 'LOGIN_SUCCESS',
      reason: 'Successful prototype account login.',
      details: { username: 'branchadmin', role: 'Admin' },
      branch: 'Manggahan',
      created_at: '2026-10-13T08:02:00+08:00'
    },
    {
      id: 'audit-demo-4',
      actor_id: 'demo-branch-admin',
      actor_name: 'Branch Administrator',
      target_name: 'Daily Sales Target',
      target_type: 'branch_settings',
      action: 'UPDATE_DAILY_SALES_TARGET',
      reason: 'Updated the branch operating target.',
      details: { branch: 'Manggahan', dailySalesTarget: 25000 },
      branch: 'Manggahan',
      created_at: '2026-10-12T16:20:00+08:00'
    },
    {
      id: 'audit-demo-5',
      actor_id: 'demo-branch-admin',
      actor_name: 'Branch Administrator',
      target_name: 'PVC Pipe 1/2 inch',
      target_type: 'inventory_item',
      action: 'STOCK_OUT',
      reason: 'Recorded customer order release.',
      details: { item: 'PVC Pipe 1/2 inch', quantity: 3, reference: 'SO-2026-1008' },
      branch: 'Manggahan',
      created_at: '2026-10-12T14:05:00+08:00'
    }
  ],
  systemEvents: []
});

const readData = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored?.users && stored?.products) {
      const existingAdmin = stored.users.find(user => user.username === 'admin');
      if (existingAdmin && existingAdmin.role === 'Admin') {
        existingAdmin.role = 'Super Admin';
        existingAdmin.full_name = existingAdmin.full_name || 'Prototype Super Admin';
      }

      stored.users.forEach(user => {
        user.branch = normalizeBranch(user.branch);
        if (String(user.status).toLowerCase() === 'active') user.status = 'Active';
        if (String(user.status).toLowerCase() === 'inactive') user.status = 'Inactive';
        if (String(user.status).toLowerCase() === 'pending') user.status = 'Pending';
      });

      if (!stored.users.some(user => user.username === 'branchadmin')) {
        stored.users.push({
          id: 'demo-branch-admin',
          username: 'branchadmin',
          password: 'admin123',
          full_name: 'Branch Administrator',
          email: 'branchadmin@storesync.local',
          role: 'Admin',
          branch: 'Manggahan',
          status: 'Active'
        });
      }

      stored.products.forEach(product => {
        product.branch = normalizeBranch(product.branch);
      });

      ['auditLogs', 'sales', 'purchases', 'movements', 'requests', 'archived', 'systemEvents'].forEach(collection => {
        if (Array.isArray(stored[collection])) {
          stored[collection].forEach(item => {
            if (item && typeof item === 'object' && 'branch' in item) {
              item.branch = normalizeBranch(item.branch);
            }
          });

          if (Number(stored.demoDataVersion || 0) < DEMO_DATA_VERSION) {
            const demo = seedData();
            ['products', 'sales', 'purchases', 'movements', 'requests', 'auditLogs'].forEach(collection => {
              if (!Array.isArray(stored[collection])) stored[collection] = [];
              const existingIds = new Set((stored[collection] || []).map(item => String(
                item.id || item.sales_transaction_id || item.purchase_id || item.movement_id || item.request_id || item.audit_id
              )));
              (demo[collection] || []).forEach(item => {
                const itemId = String(item.id || item.sales_transaction_id || item.purchase_id || item.movement_id || item.request_id || item.audit_id);
                if (!existingIds.has(itemId)) stored[collection].push(item);
              });
            });
            demo.users.forEach(demoUser => {
              if (!stored.users.some(user => user.username === demoUser.username)) stored.users.push(demoUser);
            });
            stored.demoDataVersion = DEMO_DATA_VERSION;
            stored.dataClassification = demo.dataClassification;
          }
        }
      });

      addSupplierCategoryDemoProducts(stored);

      const savedUser = (() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
      })();
      if (savedUser?.branch === 'Main Branch') {
        savedUser.branch = 'Manggahan';
        localStorage.setItem('user', JSON.stringify(savedUser));
      }
      if (localStorage.getItem('active_branch') === 'Main Branch') {
        localStorage.setItem('active_branch', 'Manggahan');
      }

      if (!Array.isArray(stored.auditLogs) || stored.auditLogs.length === 0) {
        stored.auditLogs = seedData().auditLogs;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return stored;
    }
  } catch {
    // Recreate invalid prototype data below.
  }
  const data = seedData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
};

const writeData = data => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('storesync-data-changed'));
};
const bodyOf = config => {
  try { return typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch { return {}; }
};
const response = (config, data, status = 200) => Promise.resolve({
  data, status, statusText: status === 200 ? 'OK' : 'Bad Request', headers: {}, config
});
const errorResponse = (config, message, status = 400) => {
  const error = new Error(message);
  error.response = { data: { error: message }, status, config };
  return Promise.reject(error);
};
const userIsSuperAdmin = user => user?.role === 'Super Admin';

const metrics = item => {
  const stock = Math.max(0, Number(item.stock_level || 0));
  const ads = item.average_daily_sales === '' || item.average_daily_sales == null ? null : Number(item.average_daily_sales);
  const lead = item.lead_time_days === '' || item.lead_time_days == null ? null : Number(item.lead_time_days);
  const review = Number(item.review_period_days ?? 30);
  const safety = Number(item.safety_stock || 0);
  const rop = ads == null || lead == null ? null : Math.ceil(Math.max(0, ads) * Math.max(0, lead) + Math.max(0, safety));
  const out = ads == null || lead == null ? null : Math.ceil(Math.max(0, ads) * (Math.max(0, review) + Math.max(0, lead)) + Math.max(0, safety));
  const quantity = out == null ? Math.max(0, Number(item.min_stock_level || 0) - stock) : Math.max(0, out - stock);
  return { recommended_reorder_point: rop, order_up_to_level: out, suggested_order_quantity: quantity, needs_reorder: rop == null ? stock <= Number(item.min_stock_level || 0) : stock <= rop, reserved_stock: 0, available_stock: stock };
};

const inventoryRow = item => ({
  inventory_id: item.id,
  product_id: item.product_id || item.id,
  ...item,
  ...metrics(item),
  last_updated: item.last_updated || new Date().toISOString()
});

const adapter = async config => {
  const url = new URL(config.url || '', window.location.origin);
  const path = url.pathname.replace(/^\/api/, '');
  const method = String(config.method || 'get').toLowerCase();
  const body = bodyOf(config);
  const data = readData();
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  const branch = userIsSuperAdmin(currentUser)
    ? (localStorage.getItem('active_branch') || currentUser?.branch || 'Manggahan')
    : (currentUser?.branch || 'Manggahan');

  if (path === '/auth/assigned-branch' && method === 'post') {
    const user = data.users.find(item => item.username === body.username && item.password === body.password);
    if (!user) return errorResponse(config, 'Invalid username or password', 401);
    return response(config, {
      branch: user.role === 'Super Admin' ? '' : user.branch,
      role: user.role,
      branchLocked: user.role !== 'Super Admin'
    });
  }
  if (path === '/auth/login' && method === 'post') {
    const user = data.users.find(item => item.username === body.username && item.password === body.password);
    if (!user) return errorResponse(config, 'Invalid username or password', 401);
    const { password, ...safeUser } = user;
    if (user.role === 'Super Admin' && body.branch) safeUser.branch = body.branch;
    return response(config, { token: TOKEN, user: safeUser });
  }
  if (path === '/auth/logout') return response(config, { success: true });
  if (path === '/auth/send-otp' || path === '/auth/verify-otp') return response(config, { success: true, token: TOKEN, user: currentUser, code: '123456' });

  if (path === '/reports/branch-comparison' && method === 'get') {
    if (!userIsSuperAdmin(currentUser)) return errorResponse(config, 'Super Admin access required', 403);
    const start = new Date(config.params?.start || url.searchParams.get('start') || '').getTime();
    const end = new Date(config.params?.end || url.searchParams.get('end') || '').getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return errorResponse(config, 'A valid reporting period is required', 400);
    return response(config, {
      snapshotAt: new Date().toISOString(),
      sales: data.sales.filter(sale => {
        const date = new Date(sale.created_at).getTime();
        return date >= start && date <= end;
      }).map(sale => ({
        branch: sale.branch, created_at: sale.created_at, status: sale.status, transaction_type: sale.transaction_type,
        subtotal_amount: sale.subtotal_amount, discount_amount: sale.discount_amount, delivery_charge: sale.delivery_charge,
        totalAmount: sale.total_amount, totalQuantity: sale.total_quantity,
        items: (sale.items || []).map(item => ({ quantity_sold: item.quantity_sold, unit_cost_at_sale: item.unit_cost_at_sale, cost_subtotal: item.cost_subtotal, subtotal: item.subtotal })),
      })),
      products: data.products.map(inventoryRow),
    });
  }
  if (path === '/inventory' && method === 'get') {
    return response(config, { products: data.products.filter(item => item.branch === branch).map(inventoryRow) });
  }
  if (path === '/inventory' && method === 'post') {
    const item = { ...body, id: `inv-${Date.now()}`, branch, stock_level: Number(body.stock_level || 0), min_stock_level: Number(body.min_stock_level || 0), review_period_days: Number(body.review_period_days || 30), last_updated: new Date().toISOString() };
    data.products.push(item); writeData(data);
    return response(config, { product: inventoryRow(item) });
  }
  const inventoryMatch = path.match(/^\/inventory\/([^/]+)$/);
  if (inventoryMatch && method === 'put') {
    const item = data.products.find(entry => String(entry.id) === inventoryMatch[1]);
    if (!item) return errorResponse(config, 'Product not found', 404);
    Object.assign(item, body, body.stock_level === undefined ? {} : { stock_level: Number(body.stock_level) }, { last_updated: new Date().toISOString() });
    writeData(data); return response(config, { product: inventoryRow(item) });
  }
  if (inventoryMatch && method === 'delete') {
    const index = data.products.findIndex(entry => String(entry.id) === inventoryMatch[1]);
    if (index < 0) return errorResponse(config, 'Product not found', 404);
    const [item] = data.products.splice(index, 1);
    data.archived.push({ ...item, archived_inventory_id: `archive-${Date.now()}`, original_inventory_id: item.id, archived_at: new Date().toISOString() });
    writeData(data); return response(config, { success: true });
  }
  if (path === '/archive' && method === 'get') return response(config, { archivedProducts: data.archived });
  if (path === '/stock-movements' && method === 'get') {
    const movements = userIsSuperAdmin(currentUser) ? data.movements : data.movements.filter(item => item.branch === branch);
    return response(config, { movements });
  }
  if (path === '/sales' && method === 'get') {
    const sales = userIsSuperAdmin(currentUser) ? data.sales : data.sales.filter(item => item.branch === branch);
    return response(config, { sales, transactions: sales });
  }
  if (path === '/purchases' && method === 'get') {
    const purchases = userIsSuperAdmin(currentUser) ? data.purchases : data.purchases.filter(item => item.branch === branch);
    return response(config, { purchases, transactions: purchases });
  }
  if (path === '/system/summary' && method === 'get') return response(config, { ...data.summary, pendingRegistrations: [] });
  if (path === '/inventory/change-requests' && method === 'get') {
    const requests = userIsSuperAdmin(currentUser) ? data.requests : data.requests.filter(item => item.branch === branch);
    return response(config, { requests });
  }
  if (path === '/sales' && method === 'post') {
    const saleId = `sale-${Date.now()}`;
    const salesNumber = `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const createdAt = body.actual_transaction_at || new Date().toISOString();
    const isPendingPayment = body.payment_method === 'bank_transfer' && !body.payment_confirmed;
    const items = (body.items || []).map((item, index) => {
      const product = data.products.find(candidate => String(candidate.id) === String(item.inventory_id) && candidate.branch === branch);
      const quantity = Math.max(0, Number(item.quantity || 0));
      const unitPrice = Math.max(0, Number(item.unit_price || 0));
      const previousQuantity = product ? Number(product.stock_level || 0) : null;
      const newQuantity = product ? Math.max(0, previousQuantity - quantity) : null;
      if (product && !isPendingPayment) {
        product.stock_level = newQuantity;
        product.status = newQuantity <= Number(product.min_stock_level || 0) ? 'Low Stock' : 'In Stock';
        product.last_updated = new Date().toISOString();
      }
      if (product && quantity > 0 && !isPendingPayment) {
        data.movements.push({
          movement_id: `${saleId}-movement-${index + 1}`,
          inventory_id: product.id,
          item_name: product.name,
          category: product.category,
          branch,
          action: 'STOCK_OUT',
          quantity_changed: -quantity,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          reason: 'Customer sale',
          note: salesNumber,
          actor_id: currentUser?.id || '',
          actor_name: currentUser?.full_name || 'Prototype User',
          created_at: createdAt
        });
      }
      return {
        sales_item_id: `${saleId}-item-${index + 1}`,
        inventory_id: product?.id || item.inventory_id || null,
        item_name: item.item_name || product?.name || 'Manual item',
        category: item.category || product?.category || '',
        category_note: item.category_note || '',
        branch,
        quantity_sold: quantity,
        unit_price: unitPrice,
        unit_cost_at_sale: Number(product?.cost_price || 0),
        subtotal: quantity * unitPrice,
        cost_subtotal: quantity * Number(product?.cost_price || 0),
        gross_profit: quantity * (unitPrice - Number(product?.cost_price || 0)),
        previous_quantity: isPendingPayment ? null : previousQuantity,
        new_quantity: isPendingPayment ? null : newQuantity
      };
    });
    const subtotalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = Math.max(0, Number(body.discount_amount || 0));
    const deliveryCharge = Math.max(0, Number(body.delivery_charge || 0));
    const totalAmount = Math.max(0, subtotalAmount - discountAmount + deliveryCharge);
    const amountReceived = body.amount_received === undefined || body.amount_received === null
      ? totalAmount
      : Number(body.amount_received || 0);
    const sale = {
      sales_transaction_id: saleId,
      sales_number: salesNumber,
      official_invoice_number: body.official_invoice_number || '',
      branch,
      customer_type: body.customer_type || 'walk_in',
      customer_name: body.customer_name || 'C',
      customer_tin: body.customer_tin || '',
      customer_address: body.customer_address || 'C',
      total_quantity: items.reduce((sum, item) => sum + item.quantity_sold, 0),
      subtotal_amount: subtotalAmount,
      discount_amount: discountAmount,
      delivery_charge: deliveryCharge,
      total_amount: totalAmount,
      payment_method: body.payment_method || 'cash',
      amount_received: amountReceived,
      change_amount: Math.max(0, amountReceived - totalAmount),
      payment_reference: body.payment_reference || '',
      payment_confirmed: Boolean(body.payment_confirmed),
      status: isPendingPayment ? 'pending_payment' : 'completed',
      transaction_type: 'sale',
      sold_by: currentUser?.id || '',
      sold_by_name: currentUser?.full_name || 'Prototype User',
      remarks: body.remarks || '',
      created_at: createdAt,
      encoded_at: new Date().toISOString(),
      items
    };
    data.sales.unshift(sale);
    data.auditLogs.unshift({
      id: `${saleId}-audit`,
      actor_id: currentUser?.id || '',
      actor_name: currentUser?.full_name || 'Prototype User',
      target_name: sale.sales_number,
      target_type: 'sales_transaction',
      action: 'RECORD_SALE',
      reason: 'Prototype demonstration sale recorded.',
      details: { totalAmount, itemCount: items.length },
      branch,
      created_at: new Date().toISOString()
    });
    writeData(data);
    return response(config, { sale });
  }
  if (path.startsWith('/maintenance/') && !userIsSuperAdmin(currentUser)) {
    return errorResponse(config, 'Super Admin access required', 403);
  }

  if (path === '/audit-logs' && method === 'post') {
    data.auditLogs.push({ id: `audit-${Date.now()}`, ...body, branch, created_at: new Date().toISOString(), actor_name: currentUser?.full_name || 'Prototype User' });
    writeData(data); return response(config, { success: true });
  }
  if (path === '/audit-logs' && method === 'get') {
    const logs = userIsSuperAdmin(currentUser)
      ? (body.branch ? data.auditLogs.filter(log => log.branch === body.branch) : data.auditLogs)
      : data.auditLogs.filter(log => log.branch === branch);
    return response(config, { auditLogs: logs });
  }

  if (method === 'post' || method === 'put' || method === 'delete') {
    return response(config, { success: true, product: body, purchase: body, transaction: body, request: body });
  }
  return response(config, {});
};

export const enablePrototypeStorage = () => {
  readData();
  axios.defaults.adapter = adapter;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const requestUrl = typeof input === 'string' ? input : input?.url || '';
    const url = new URL(requestUrl, window.location.origin);
    const method = String(init.method || (typeof input === 'object' ? input.method : 'get') || 'get').toLowerCase();
    const currentUser = (() => {
      try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
    })();

    if (url.pathname === '/api/admin/users' && method === 'get') {
      const data = readData();
      const visibleUsers = userIsSuperAdmin(currentUser)
        ? data.users
        : data.users.filter(user => user.branch === currentUser?.branch);
      return new Response(JSON.stringify({
        users: visibleUsers.map(({ password, ...user }) => user)
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return nativeFetch(input, init);
  };
};
