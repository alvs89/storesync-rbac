import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSupplierCatalog, filterSupplierCatalog, supplierCategory, getSupplierCategories } from './supplierCategories.js';

const inventory = [
  { supplierName: 'Supplier A', category: ' Paint ' },
  { supplierName: 'supplier a', category: 'PAINTS' },
  { supplierName: 'Supplier B', category: 'Electricals' },
  { supplierName: 'Supplier B', category: 'Steel' },
  { supplierName: 'Supplier C', category: '' },
  { supplierName: '', category: 'Roofing' },
];
const catalog = buildSupplierCatalog(['Supplier A', 'SUPPLIER A', 'Supplier B', 'Supplier C', 'Supplier D'], inventory);
test('normalizes category aliases and formatting without mutating records', () => {
  assert.equal(supplierCategory(' PAINT '), 'Paints');
  assert.equal(supplierCategory('pvc pipe/ fittings'), 'PVC Pipe / Fittings');
  assert.deepEqual(catalog[0].categories, ['Paints']);
  assert.equal(inventory[0].category, ' Paint ');
});
test('unfiltered catalog keeps suppliers without associations and deduplicates names', () => {
  assert.equal(filterSupplierCatalog(catalog, []).length, 4);
  assert.deepEqual(catalog[2].categories, []);
});
test('single category and OR multi-category filtering use only stored associations', () => {
  assert.deepEqual(filterSupplierCatalog(catalog, ['Paints']).map(item => item.name), ['Supplier A']);
  assert.equal(filterSupplierCatalog(catalog, ['Paints', 'Electricals']).length, 2);
  assert.equal(filterSupplierCatalog(catalog, ['Electricals']).length, 1);
  assert.equal(filterSupplierCatalog(catalog, ['Roofing']).length, 0);
});
test('supplier search intersects categories and clearing restores catalog', () => {
  assert.equal(filterSupplierCatalog(catalog, ['Paints', 'Electricals'], ' supplier b ').length, 1);
  assert.equal(filterSupplierCatalog(catalog, ['Paints'], 'supplier b').length, 0);
  assert.equal(filterSupplierCatalog(catalog, []).length, 4);
});
test('updates reflect current inventory including non-official supplier names', () => {
  const updated = buildSupplierCatalog([], [{ supplier_name: 'Actual Supplier', category: 'Steel' }]);
  assert.equal(filterSupplierCatalog(updated, ['Steel'])[0].name, 'Actual Supplier');
  assert.ok(getSupplierCategories(updated).includes('Paints'));
  assert.equal(filterSupplierCatalog(buildSupplierCatalog([], []), ['Steel']).length, 0);
});
