import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareBranches, branchComparisonInsight } from './branchComparison.js';

const start = Date.parse('2026-10-01T00:00:00+08:00');
const end = Date.parse('2026-10-31T23:59:59.999+08:00');
const sale = (branch, revenue, cost, extra = {}) => ({
  branch, created_at: '2026-10-15T10:00:00+08:00', status: 'completed', transaction_type: 'sale',
  subtotal_amount: revenue, totalAmount: revenue, totalQuantity: 2,
  items: [{ subtotal: revenue, quantity_sold: 2, cost_subtotal: cost }], ...extra,
});

test('compares the same period using completed sales and sale-time costs', () => {
  const rows = compareBranches({ sales: [
    sale('Manggahan', 1328, 1029.2), sale('San Rafael', 1000, 747),
    sale('Manggahan', 9000, 0, { status: 'cancelled' }),
    sale('Manggahan', 9000, 0, { status: 'pending_payment' }),
    sale('Manggahan', -100, -20, { transaction_type: 'refund' }),
    sale('Manggahan', 9000, 0, { created_at: '2026-09-30T23:59:59+08:00' }),
    sale('Other', 9000, 0),
  ] }, start, end);
  assert.equal(rows[0].sales, 1328);
  assert.equal(rows[0].actualProfit, 298.8);
  assert.equal(rows[0].completedTransactions, 1);
  assert.equal(rows[0].unitsSold, 2);
  assert.equal(rows[1].profitMargin, 25.3);
  assert.match(branchComparisonInsight(rows), /32\.8% more sales/);
  assert.match(branchComparisonInsight(rows), /San Rafael had a 2\.8 percentage-point higher profit margin/);
});

test('stock snapshots ignore reporting period and count reorder rules, including reserved stock', () => {
  const rows = compareBranches({ products: [
    { branch: 'Manggahan', stock_level: 0, needs_reorder: true },
    { branch: 'Manggahan', stock_level: 10, available_stock: 3, min_stock_level: 5 },
    { branch: 'San Rafael', stock_level: 20, needs_reorder: false },
    { branch: 'Other', stock_level: 0, needs_reorder: true },
  ] }, start, end);
  assert.equal(rows[0].outOfStock, 1);
  assert.equal(rows[0].replenishment, 2);
  assert.equal(rows[1].outOfStock, 0);
  assert.equal(rows[1].replenishment, 0);
});

test('zero revenue yields unavailable margin and factual wording instead of infinity', () => {
  let rows = compareBranches({}, start, end);
  assert.equal(rows[0].profitMargin, null);
  assert.match(branchComparisonInsight(rows), /Neither branch recorded positive sales revenue/);
  rows = compareBranches({ sales: [sale('Manggahan', 100, 60)] }, start, end);
  assert.match(branchComparisonInsight(rows), /percentage comparison is not available/);
  assert.doesNotMatch(branchComparisonInsight(rows), /Infinity|NaN/);
});

test('ties, losses, discounts, delivery charges, and period boundaries remain accurate', () => {
  const rows = compareBranches({ sales: [
    sale('Manggahan', 100, 150, { discount_amount: 10, delivery_charge: 5, created_at: new Date(start).toISOString() }),
    sale('San Rafael', 95, 150, { created_at: new Date(end).toISOString() }),
  ] }, start, end);
  assert.equal(rows[0].sales, 95);
  assert.equal(rows[0].actualProfit, -55);
  assert.equal(rows[0].profitMargin, -57.89);
  assert.match(branchComparisonInsight(rows), /same profit margin/);
  assert.match(branchComparisonInsight(rows), /Both branches recorded/);
});
