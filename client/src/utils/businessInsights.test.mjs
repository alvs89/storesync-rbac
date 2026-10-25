import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateBusinessInsights, BUSINESS_INSIGHT_THRESHOLDS, sortAndLimitInsights } from './businessInsights.js';

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

test('equal-priority insights rank by documented financial impact', () => {
  const sample = [
    { id: 'smaller', title: 'A smaller', priority: 'High', metricValues: { actualProfit: -100 } },
    { id: 'larger', title: 'Z larger', priority: 'High', metricValues: { actualProfit: -1000 } },
    { id: 'critical', title: 'Critical', priority: 'Critical', metricValues: { actualProfit: -5 } }
  ];
  assert.deepEqual(sortAndLimitInsights(sample, 2).map(item => item.id), ['critical', 'larger']);
});
test('configured thresholds are deterministic', () => {
  assert.equal(BUSINESS_INSIGHT_THRESHOLDS.significantSalesChangePercent, 10);
  assert.equal(BUSINESS_INSIGHT_THRESHOLDS.slowMovingLookbackDays, 60);
  assert.equal(BUSINESS_INSIGHT_THRESHOLDS.recurringUntrackedMinTransactions, 3);
  assert.equal(BUSINESS_INSIGHT_THRESHOLDS.excessStockOutMultiplier, 1.5);
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
test('past reporting periods must not use current stock for replenishment alerts', () => {
  const historicBounds = { start: new Date(now.getTime() - 120 * day), end: new Date(now.getTime() - 100 * day) };
  const alerts = generateBusinessInsights({
    sales: [sale(100, 60, { createdAt: dateOffset(-110) })],
    inventory: [{ id: '1', name: 'Electrical Wire', availableQuantity: 0, recommendedReorderPoint: 24, recommendedOrderQuantity: 29 }],
    periodBounds: historicBounds
  });
  assert.equal(find(alerts, 'Strong Product Demand'), undefined);
});
test('historical stock movements establish evidence of aged zero-sale inventory', () => {
  const stockMovements = [{ inventoryId: '1', createdAt: dateOffset(-90), action: 'Stock In' }];
  const alerts = generateBusinessInsights({
    sales: [], allSales: [], stockMovements,
    inventory: [{ id: '1', name: 'Electrical Wire', availableQuantity: 85 }],
    periodBounds: bounds
  });
  const slow = find(alerts, 'Slow-Moving Inventory');
  assert.ok(slow);
  assert.equal(slow.metricValues.unitsSold, 0);
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
test('lowest positive-margin review excludes negative-profit products and duplicate top-revenue alerts', () => {
  const sales = [
    sale(600, 400, { name: 'Product A', inventoryId: '1' }),
    sale(500, 350, { name: 'Product B', inventoryId: '2' }),
    sale(400, 280, { name: 'Product C', inventoryId: '3' }),
    sale(300, 210, { name: 'Product D', inventoryId: '4' }),
    sale(200, 130, { name: 'Product E', inventoryId: '5' }),
    sale(100, 95, { name: 'Product F', inventoryId: '6' })
  ];
  const insight = find(run(sales), 'Lowest Positive Profit Margin');
  assert.ok(insight);
  assert.equal(insight.relatedEntityName, 'Product F');
  assert.equal(insight.metricValues.profitMargin, 5);
});
test('possible excess stock requires official OUT, low demand, and prior observation history', () => {
  const history = sale(100, 60, { createdAt: dateOffset(-90) });
  const inventory = [{ id: '1', name: 'Electrical Wire', availableQuantity: 85, orderUpToLevel: 40 }];
  const insight = find(run([], [], inventory, [history]), 'Possible Excess Stock');
  assert.ok(insight);
  assert.equal(insight.metricValues.out, 40);
  assert.equal(find(run([], [], inventory, [history]), 'Slow-Moving Inventory'), undefined);
  assert.equal(find(run([], [], [{ ...inventory[0], orderUpToLevel: null }], [history]), 'Possible Excess Stock'), undefined);
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
