import axios from 'axios';

const STORAGE_KEY = 'storesync_prototype_data_v1';
const TOKEN = 'storesync-prototype-token';
const normalizeBranch = branch => branch === 'Main Branch' ? 'Manggahan' : branch;

const seedData = () => ({
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
  }],
  products: [
    { id: 'inv-1', name: 'Portland Cement 40kg', category: 'Construction', category_note: '', supplier_name: 'BuildRight Supply', default_selling_price: 285, cost_price: 240, stock_level: 10, min_stock_level: 12, lead_time_days: 7, safety_stock: 3, review_period_days: 5, average_daily_sales: 3, status: 'Low Stock', branch: 'Manggahan' },
    { id: 'inv-2', name: 'GI Roofing Sheet 8ft', category: 'Roofing', category_note: '', supplier_name: 'BuildRight Supply', default_selling_price: 720, cost_price: 610, stock_level: 42, min_stock_level: 10, lead_time_days: 5, safety_stock: 4, review_period_days: 7, average_daily_sales: 2, status: 'In Stock', branch: 'Manggahan' },
    { id: 'inv-3', name: 'PVC Pipe 1/2 inch', category: 'PVC Pipe / Fittings', category_note: '', supplier_name: 'PipeWorks Trading', default_selling_price: 95, cost_price: 70, stock_level: 6, min_stock_level: 8, lead_time_days: 4, safety_stock: 2, review_period_days: 5, average_daily_sales: 1, status: 'Low Stock', branch: 'Manggahan' }
  ],
  archived: [],
  sales: [],
  purchases: [],
  movements: [],
  requests: [],
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
        }
      });

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

const writeData = data => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  if (path === '/stock-movements' && method === 'get') return response(config, { movements: data.movements });
  if (path === '/sales' && method === 'get') return response(config, { sales: data.sales, transactions: data.sales });
  if (path === '/purchases' && method === 'get') return response(config, { purchases: data.purchases, transactions: data.purchases });
  if (path === '/system/summary' && method === 'get') return response(config, { ...data.summary, pendingRegistrations: [] });
  if (path === '/inventory/change-requests' && method === 'get') return response(config, { requests: data.requests });
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
