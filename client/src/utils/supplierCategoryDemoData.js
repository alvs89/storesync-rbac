// Fictional sample records for the browser-local prototype only. These are not
// verified company suppliers, prices, or stock balances. Start with zero stock
// so the records can be used for purchase entry without inventing stock on hand.
export const SUPPLIER_CATEGORY_DEMO_VERSION = 2;
export const SUPPLIER_CATEGORY_DEMO_PRODUCTS = ['Manggahan', 'San Rafael'].flatMap((branch, index) => [
  {
    id: `demo-category-electrical-${index + 1}`,
    name: 'Duplex Convenience Outlet',
    category: 'Electricals',
    supplier_name: 'BrightWire Electrical Supply',
    default_selling_price: 120,
    cost_price: 90,
    stock_level: 0,
    min_stock_level: 5,
    status: 'Out of Stock',
    branch,
    is_demo: true,
  },
  {
    id: `demo-category-kiln-dry-${index + 1}`,
    name: 'Kiln-Dried Lumber 2x2x8ft',
    category: 'Kiln Dry',
    supplier_name: 'Seasoned Timber Supply',
    default_selling_price: 180,
    cost_price: 140,
    stock_level: 0,
    min_stock_level: 5,
    status: 'Out of Stock',
    branch,
    is_demo: true,
  },
]).concat([
  { id: 'demo-category-plywood-1', name: 'Ordinary Plywood 1/4in 4x8', category: 'Plywood', supplier_name: 'Timberline Trading', branch: 'Manggahan', default_selling_price: 420, cost_price: 350 },
  { id: 'demo-category-plywood-2', name: 'Ordinary Plywood 1/4in 4x8', category: 'Plywood', supplier_name: 'Timberline Trading', branch: 'San Rafael', default_selling_price: 420, cost_price: 350 },
  { id: 'demo-category-lumber-2', name: 'Planed Lumber Board 1x6x8ft', category: 'Lumber & Boards', supplier_name: 'Timberline Trading', branch: 'San Rafael', default_selling_price: 260, cost_price: 210 },
  { id: 'demo-category-steel-2', name: 'Steel Flat Bar 1in x 6m', category: 'Steel', supplier_name: 'Metro Steel Supply', branch: 'San Rafael', default_selling_price: 320, cost_price: 260 },
].map(product => ({ ...product, stock_level: 0, min_stock_level: 5, status: 'Out of Stock', is_demo: true, demo_category_version: 2 })));

// Add the new examples once. Never overwrite edits, reset transactions, or
// recreate an example the user has already archived or removed after upgrade.
export function addSupplierCategoryDemoProducts(data) {
  const previousVersion = Number(data.supplierCategoryDemoVersion || 0);
  if (previousVersion >= SUPPLIER_CATEGORY_DEMO_VERSION) return;
  const existing = new Set([
    ...data.products.map(item => String(item.id)),
    ...(data.archived || []).flatMap(item => [item.id, item.original_inventory_id, item.originalInventoryId].filter(Boolean).map(String)),
  ]);
  for (const product of SUPPLIER_CATEGORY_DEMO_PRODUCTS) {
    if ((product.demo_category_version || 1) > previousVersion && !existing.has(product.id)) data.products.push({ ...product });
  }
  data.supplierCategoryDemoVersion = SUPPLIER_CATEGORY_DEMO_VERSION;
}
