import { normalizeSupplierName } from './suppliers.js';

export const supplierKey = value => normalizeSupplierName(value).toLocaleLowerCase('en');
const vocabulary = ['Construction', 'Electricals', 'Kiln Dry', 'Lumber & Boards', 'Paints', 'Plywood', 'PVC Pipe / Fittings', 'Roofing', 'Steel'];
const categoryKey = value => String(value || '').trim().replace(/\s+/g, ' ').replace(/\s*\/\s*/g, '/').toLowerCase();
const labels = new Map(vocabulary.map(label => [categoryKey(label), label]));
labels.set('paint', 'Paints');
labels.set('electrical', 'Electricals');

// Display aliases only: never rewrite inventory records or infer relationships.
export function supplierCategory(value) {
  const clean = String(value || '').trim().replace(/\s+/g, ' ');
  return labels.get(categoryKey(clean)) || clean.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

export function buildSupplierCatalog(names, inventory) {
  const suppliers = new Map();
  for (const name of names) {
    const key = supplierKey(name);
    if (key && !suppliers.has(key)) suppliers.set(key, { name, categories: new Set() });
  }
  // Include actual inventory suppliers as well as the official list. Their stored
  // names remain the transaction values; custom entry remains available too.
  for (const item of inventory) {
    const name = normalizeSupplierName(item.supplierName ?? item.supplier_name);
    if (!name) continue;
    const key = supplierKey(name);
    if (!suppliers.has(key)) suppliers.set(key, { name, categories: new Set() });
    const category = supplierCategory(item.category);
    if (category) suppliers.get(key).categories.add(category);
  }
  return [...suppliers.values()].map(supplier => ({ ...supplier, categories: [...supplier.categories].sort((a, b) => a.localeCompare(b)) }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));
}

export const getSupplierCategories = catalog => [...new Set([...vocabulary, ...catalog.flatMap(supplier => supplier.categories)])].sort((a, b) => a.localeCompare(b));
export const matchesSupplierCategories = (supplier, selected) => !selected.length || Boolean(supplier?.categories.some(category => selected.includes(category)));
export const filterSupplierCatalog = (catalog, selected, query = '') => catalog.filter(supplier => matchesSupplierCategories(supplier, selected) && supplierKey(supplier.name).includes(supplierKey(query)));
