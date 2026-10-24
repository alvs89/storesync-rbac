import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SUPPLIER_CATEGORY_DEMO_PRODUCTS, addSupplierCategoryDemoProducts } from './supplierCategoryDemoData.js';
import { buildSupplierCatalog, filterSupplierCatalog, getSupplierCategories } from './supplierCategories.js';
import { readFileSync } from 'node:fs';

test('both branches have sample Electricals and Kiln Dry suppliers with selectable products', () => {
  for (const branch of ['Manggahan', 'San Rafael']) {
    const products = SUPPLIER_CATEGORY_DEMO_PRODUCTS.filter(product => product.branch === branch);
    const catalog = buildSupplierCatalog([], products);
    assert.equal(filterSupplierCatalog(catalog, ['Electricals', 'Kiln Dry']).length, 2);
    for (const category of ['Electricals', 'Kiln Dry']) {
      const matches = filterSupplierCatalog(catalog, [category]);
      assert.equal(matches.length, 1);
      assert.ok(products.some(product => product.supplier_name === matches[0].name && product.category === category));
    }
    assert.ok(products.every(product => product.is_demo && product.stock_level === 0));
  }
});

test('upgrade preserves products, users, and transactions and is idempotent', () => {
  const data = { products: [{ id: 'existing', stock_level: 37 }], users: [{ username: 'existing' }], sales: [{ id: 'sale' }] };
  addSupplierCategoryDemoProducts(data);
  assert.equal(data.products.length, 1 + SUPPLIER_CATEGORY_DEMO_PRODUCTS.length);
  assert.equal(data.products[0].stock_level, 37);
  assert.deepEqual(data.sales, [{ id: 'sale' }]);
  assert.deepEqual(data.users, [{ username: 'existing' }]);
  data.products[1].stock_level = 9;
  addSupplierCategoryDemoProducts(data);
  assert.equal(data.products.length, 1 + SUPPLIER_CATEGORY_DEMO_PRODUCTS.length);
  assert.equal(data.products[1].stock_level, 9);
});

test('upgrade skips archived samples and never recreates samples removed afterward', () => {
  const id = SUPPLIER_CATEGORY_DEMO_PRODUCTS[0].id;
  const data = { products: [], archived: [{ original_inventory_id: id }] };
  addSupplierCategoryDemoProducts(data);
  assert.equal(data.products.length, SUPPLIER_CATEGORY_DEMO_PRODUCTS.length - 1);
  assert.ok(!data.products.some(product => product.id === id));
  data.products.pop();
  addSupplierCategoryDemoProducts(data);
  assert.equal(data.products.length, SUPPLIER_CATEGORY_DEMO_PRODUCTS.length - 2);
});

test('all selectable categories have supplier-linked products in both complete branch seeds', () => {
  const source = readFileSync(new URL('./prototypeStorage.js', import.meta.url), 'utf8');
  const start = source.indexOf('  products: [');
  const end = source.indexOf('\n  ],', start);
  const records = source.slice(start, end).split('\n').filter(line => line.trim().startsWith('{ id:'));
  const originalProducts = records.map(line => Function(`return (${line.trim().replace(/,$/, '')})`)());
  for (const branch of ['Manggahan', 'San Rafael']) {
    const products = [...originalProducts, ...SUPPLIER_CATEGORY_DEMO_PRODUCTS].filter(product => product.branch === branch);
    const catalog = buildSupplierCatalog([], products);
    for (const category of getSupplierCategories(catalog)) {
      assert.ok(filterSupplierCatalog(catalog, [category]).length > 0, `${branch}: missing supplier for ${category}`);
    }
  }
});

test('version 1 upgrade only adds new coverage records and does not recreate removed version 1 examples', () => {
  const data = { supplierCategoryDemoVersion: 1, products: [] };
  addSupplierCategoryDemoProducts(data);
  assert.equal(data.products.length, 4);
  assert.ok(data.products.every(product => product.demo_category_version === 2));
});
