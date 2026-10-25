import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateBusinessInsights, BUSINESS_INSIGHT_THRESHOLDS } from './businessInsights.js';

const now = new Date();
const day = 86400000;
const dateOffset = days => new Date(now.getTime() + days * day).toISOString();
const sale = (amount, cost, opts = {}) => ({
  id: opts.id || Math.random().toString(36).slice(2),
  createdAt: opts.createdAt || now.toISOString(),
  status: 'completed', transactionType: 'sale', subtotalAmount: amount,
  totalAmount: amount,
  items: [{ itemName: opts.name || 'Electrical Wire', inventoryId: opts.inventoryId || '1',
    quantitySold: opts.qty ?? 1, subtotal: amount, costSubtotal: cost,
    isInventoryItem: opts.manual ? false : true, category: opts.category || 'Electricals' }],
  ...opts
});
const bounds = { start: new Date(now.getTime() - 2 * day), end: new Date(now.getTime() + day) };
const find = (result, title) => result.find(row => row.title === title);
const run = (sales = [], previousSales = [], inventory = [], allSales = sales) =>
  generateBusinessInsights({ sales, previousSales, inventory, allSales, periodBounds: bounds });

test('configured thresholds are deterministic', () => {
  assert.equal(BUSINESS_INSIGHT_THRESHOLDS.significantSalesChangePercent, 10);
  assert.equal(BUSINESS_INSIGHT_THRESHOLDS.slowMovingLookbackDays, 60);
  assert.equal(BUSINESS_INSIGHT_THRESHOLDS.recurringUntrackedMinTransactions, 3);
});
test('significant decline uses completed sales and the correct percentage', () => {
  const insight = find(run([sale(85000, 60000)], [sale(100000, 70000)]), 'Sales Performance Declined');
  assert.ok(insight);
  assert.equal(insight.metricValues.salesChange, -15);
});
test('significant growth reports a positive change', () => {
  const insight = find(run([sale(120000, 70000)], [sale(100000, 60000)]), 'Sales Performance Improved');
  assert.ok(insight);
  assert.equal(insight.metricValues.salesChange, 20);
});
test('low margin, high revenue is flagged using stored sold-item cost', () => {
  const insights = run([sale(1000, 918), sale(100, 20, { name: 'Small Product', inventoryId: '2' })]);
  assert.ok(find(insights, 'High Revenue, Low Margin'));
});
test('negative actual profit is flagged', () => {
  assert.ok(find(run([sale(8000, 8700)]), 'Negative Product Profit'));
});
test('replenishment only fires for top-demand items when stock reaches official ROP', () => {
  const inventory = [{ id: '1', name: 'Electrical Wire', quantity: 10, availableQuantity: 10,
    recommendedReorderPoint: 24, recommendedOrderQuantity: 29 }];
  const insight = find(run([sale(100, 70)], [], inventory), 'Strong Product Demand');
  assert.ok(insight);
  assert.equal(insight.metricValues.recommended, 29);
  assert.equal(insight.metricValues.rop, 24);
});
test('unknown ROP must not turn into an out-of-stock demand alert', () => {
  assert.equal(find(run([sale(100, 70)], [], [{ id: '1', name: 'Electrical Wire', availableQuantity: 0 }]), 'Strong Product Demand'), undefined);
});
test('slow-moving requires evidence of product history before 60-day window', () => {
  const history = sale(100, 60, { createdAt: dateOffset(-80), id: 'historic' });
  const recent = sale(50, 30, { id: 'recent', qty: 2 });
  const inventory = [{ id: '1', name: 'Electrical Wire', availableQuantity: 85 }];
  assert.ok(find(run([recent], [], inventory, [history, recent]), 'Slow-Moving Inventory'));
  assert.ok(find(run([], [], inventory, [history]), 'Slow-Moving Inventory'));
  assert.equal(find(run([recent], [], inventory, [recent]), 'Slow-Moving Inventory'), undefined);
});
test('recurring untracked demand counts distinct completed transactions', () => {
  const sales = Array.from({ length: 5 }, (_, i) => sale(100, 60, { id: 'manual-' + i, manual: true, name: 'Marine Plywood' }));
  assert.equal(find(run(sales), 'Recurring Untracked Demand').metricValues.transactionCount, 5);
});
test('no exceptions yields no fabricated warnings', () => {
  assert.deepEqual(run(), []);
});
test('unfinished transactions never produce business insights', () => {
  assert.deepEqual(run([sale(10000, 4000, { status: 'pending_payment' })]), []);
});
