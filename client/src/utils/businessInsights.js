import { getProductProfitability, getProfitabilitySummary } from './profitability.js';
import { isCompletedSaleTransaction } from './salesTransactionStatus.js';

// SYSTEM BUSINESS RULES. These thresholds are deterministic review triggers,
// not AI-generated values or predictions.
export const BUSINESS_INSIGHT_THRESHOLDS = Object.freeze({
  significantSalesChangePercent: 10,
  lowMarginPercent: 10,
  negativeMarginPercent: 0,
  highRevenueRankLimit: 5,
  slowMovingLookbackDays: 60,
  slowMovingMaxUnitsSold: 3,
  recurringUntrackedMinTransactions: 3,
  topDemandRankLimit: 5
});

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Informational: 3 };
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const round = value => Number(number(value).toFixed(2));
const itemName = item => String(item?.itemName || item?.item_name || item?.manualDescription || item?.name || '').trim();
const quantity = item => number(item?.quantitySold ?? item?.quantity_sold ?? item?.quantity);
const isManual = item => item?.isInventoryItem === false || item?.itemType === 'non_inventory' || item?.item_type === 'non_inventory';
const manualKey = item => {
  const name = itemName(item).toLowerCase().replace(/\s+/g, ' ');
  const category = String(item?.category || 'Other').trim().toLowerCase().replace(/\s+/g, ' ');
  return name ? `${name}|${category}` : '';
};
const dateOf = value => {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const periodContains = (record, bounds) => {
  const date = dateOf(record?.createdAt ?? record?.created_at);
  return Boolean(date && bounds?.start && bounds?.end && date >= bounds.start && date <= bounds.end);
};
const percentChange = (current, previous) => {
  if (number(previous) === 0) return number(current) === 0 ? 0 : null;
  return round(((number(current) - number(previous)) / Math.abs(number(previous))) * 100);
};
const formatPercent = value => `${Math.abs(number(value)).toFixed(1)}%`;
const formatCurrency = value => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(number(value));
const formatPeriod = bounds => {
  if (!bounds?.start || !bounds?.end) return 'Selected period';
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  const startLabel = bounds.start.toLocaleDateString('en-US', options);
  const endLabel = bounds.end.toLocaleDateString('en-US', options);
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
};

const makeInsight = (data, bounds) => ({ ...data, period: formatPeriod(bounds), targetFilters: data.targetFilters || {} });

export function getSalesMetrics(sales = []) {
  const summary = getProfitabilitySummary(sales);
  return {
    sales: round(summary.totalSales),
    transactions: sales.length,
    unitsSold: summary.unitsSold,
    averageTransactionValue: sales.length ? round(summary.totalSales / sales.length) : 0
  };
}

function salesInsights(currentSales, previousSales, bounds) {
  const current = getSalesMetrics(currentSales);
  const previous = getSalesMetrics(previousSales);
  const salesChange = percentChange(current.sales, previous.sales);
  const transactionChange = percentChange(current.transactions, previous.transactions);
  if (salesChange === null || Math.abs(salesChange) < BUSINESS_INSIGHT_THRESHOLDS.significantSalesChangePercent) return [];

  const decline = salesChange < 0;
  let summary = `Sales ${decline ? 'decreased' : 'increased'} by ${formatPercent(salesChange)} compared with the previous period.`;
  let evidence = `Current sales: ${formatCurrency(current.sales)}. Previous sales: ${formatCurrency(previous.sales)}.`;
  if (transactionChange !== null && Math.abs(transactionChange) >= BUSINESS_INSIGHT_THRESHOLDS.significantSalesChangePercent) {
    evidence += ` Transactions ${transactionChange < 0 ? 'decreased' : 'increased'} by ${formatPercent(transactionChange)}.`;
  } else if (decline && transactionChange !== null && current.transactions > 0 && previous.transactions > 0 && current.averageTransactionValue < previous.averageTransactionValue && Math.abs(transactionChange) < BUSINESS_INSIGHT_THRESHOLDS.significantSalesChangePercent) {
    summary += ` Transaction volume remained relatively stable, indicating that average transaction value was lower during this period.`;
    evidence += ` Transactions changed by ${formatPercent(transactionChange)}. Average transaction value moved from ${formatCurrency(previous.averageTransactionValue)} to ${formatCurrency(current.averageTransactionValue)}.`;
  }

  return [makeInsight({
    id: decline ? 'sales-performance-decline' : 'sales-performance-growth',
    type: 'sales-performance',
    priority: decline ? 'High' : 'Informational',
    title: decline ? 'Sales Performance Declined' : 'Sales Performance Improved',
    summary,
    evidence,
    recommendation: decline
      ? (transactionChange !== null && Math.abs(transactionChange) < BUSINESS_INSIGHT_THRESHOLDS.significantSalesChangePercent
        ? 'Review product mix, discounts, and higher-value item sales.'
        : 'Review product performance and recent sales activity to identify which products or categories contributed to the change.')
      : 'Review the products contributing most to the increase and ensure sufficient stock is available.',
    metricValues: { current, previous, salesChange, transactionChange },
    ruleTriggered: `Sales percentage change is ${salesChange}% and meets the ±${BUSINESS_INSIGHT_THRESHOLDS.significantSalesChangePercent}% significant-change threshold.`,
    targetReport: 'business-insights',
    targetFilters: { section: 'sales-performance' }
  }, bounds)];
}

function profitabilityInsights(sales, bounds) {
  const products = getProductProfitability(sales);
  if (!products.length) return [];
  const insights = [];
  const revenueRanked = [...products].sort((a, b) => b.totalSales - a.totalSales || a.itemName.localeCompare(b.itemName));
  const highestProfit = [...products].sort((a, b) => b.actualProfit - a.actualProfit)[0];
  if (highestProfit && highestProfit.actualProfit > 0) {
    insights.push(makeInsight({
      id: 'highest-profit-product',
      type: 'product-profitability',
      priority: 'Informational',
      title: 'Highest-Profit Product',
      summary: `${highestProfit.itemName} generated the highest actual profit during the selected period at ${formatCurrency(highestProfit.actualProfit)}.`,
      evidence: `Revenue: ${formatCurrency(highestProfit.totalSales)}. Actual profit: ${formatCurrency(highestProfit.actualProfit)}. Profit margin: ${highestProfit.profitMargin.toFixed(1)}%.`,
      recommendation: 'Review its stock availability and sales contribution when planning replenishment.',
      metricValues: highestProfit,
      ruleTriggered: 'Product has the highest positive actual profit among products sold in the selected period.',
      relatedEntityName: highestProfit.itemName,
      targetReport: 'actual-earnings',
      targetFilters: { product: highestProfit.itemName }
    }, bounds));
  }

  products.filter(product => product.actualProfit < BUSINESS_INSIGHT_THRESHOLDS.negativeMarginPercent).slice(0, 3).forEach(product => {
    insights.push(makeInsight({
      id: `negative-profit-${product.itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      type: 'product-profitability',
      priority: 'Critical',
      title: 'Negative Product Profit',
      summary: `${product.itemName} recorded a negative actual profit of ${formatCurrency(Math.abs(product.actualProfit))} during the selected period.`,
      evidence: `Revenue: ${formatCurrency(product.totalSales)}. Recorded cost: ${formatCurrency(product.puhunanUsed)}. Actual profit: ${formatCurrency(product.actualProfit)}.`,
      recommendation: 'Review its selling price, recorded item cost, discounts, and transaction history.',
      metricValues: product,
      ruleTriggered: 'Actual product profit is below 0.',
      relatedEntityName: product.itemName,
      targetReport: 'actual-earnings',
      targetFilters: { product: product.itemName }
    }, bounds));
  });

  revenueRanked.slice(0, BUSINESS_INSIGHT_THRESHOLDS.highRevenueRankLimit)
    .filter(product => product.totalSales > 0 && product.profitMargin > BUSINESS_INSIGHT_THRESHOLDS.negativeMarginPercent && product.profitMargin < BUSINESS_INSIGHT_THRESHOLDS.lowMarginPercent)
    .slice(0, 2)
    .forEach(product => {
      const rank = revenueRanked.indexOf(product) + 1;
      insights.push(makeInsight({
        id: `high-revenue-low-margin-${product.itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        type: 'product-profitability',
        priority: 'Medium',
        title: 'High Revenue, Low Margin',
        summary: `${product.itemName} ranks #${rank} in sales revenue but has a ${product.profitMargin.toFixed(1)}% profit margin.`,
        evidence: `Revenue: ${formatCurrency(product.totalSales)}. Actual profit: ${formatCurrency(product.actualProfit)}. Revenue rank: #${rank}.`,
        recommendation: 'Review its supplier cost, selling price, and discount activity.',
        metricValues: { ...product, revenueRank: rank },
        ruleTriggered: `Product is within the top ${BUSINESS_INSIGHT_THRESHOLDS.highRevenueRankLimit} revenue products and profit margin is below ${BUSINESS_INSIGHT_THRESHOLDS.lowMarginPercent}%.`,
        relatedEntityName: product.itemName,
        targetReport: 'actual-earnings',
        targetFilters: { product: product.itemName }
      }, bounds));
    });
  return insights;
}

function inventoryInsights(sales, allSales, inventory, bounds, stockMovements = []) {
  const quantities = new Map();
  sales.forEach(sale => (sale.items || []).forEach(item => {
    const key = item.inventoryId || item.inventory_id;
    if (key) quantities.set(String(key), number(quantities.get(String(key))) + quantity(item));
  }));
  const demandRanked = [...quantities.entries()].sort((a, b) => b[1] - a[1]);
  const demandRanks = new Map(demandRanked.map(([key], index) => [key, index + 1]));
  const insights = [];
  // Current stock and ROP can only support present-day decisions, never past-period alerts.
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentPeriod = !bounds?.end || bounds.end >= todayStart;
  inventory.forEach(item => {
    const key = String(item.id ?? item.inventoryId ?? '');
    const sold = number(quantities.get(key));
    const rank = demandRanks.get(key) ?? 0;
    const available = number(item.availableQuantity ?? item.quantity);
    // Read the official ROP; an absent value is unknown rather than zero.
    const rop = item.recommendedReorderPoint == null ? null : Number(item.recommendedReorderPoint);
    const recommended = number(item.recommendedOrderQuantity ?? item.suggestedOrderQuantity);
    if (currentPeriod && rank > 0 && rank <= BUSINESS_INSIGHT_THRESHOLDS.topDemandRankLimit && Number.isFinite(rop) && rop >= 0 && available <= rop) {
      insights.push(makeInsight({
        id: `demand-replenishment-${key}`,
        type: 'inventory-demand',
        priority: available <= 0 ? 'Critical' : 'High',
        title: 'Strong Product Demand',
        summary: `${item.name} is among the fastest-moving products and available stock has reached its reorder point.`,
        evidence: `Units sold: ${sold}. Available stock: ${available}. ROP: ${rop}.${recommended > 0 ? ` Recommended replenishment: ${recommended} units.` : ''}`,
        recommendation: 'Prioritize replenishment review to reduce stockout risk.',
        metricValues: { sold, available, rop, recommended, demandRank: rank },
        ruleTriggered: `Product ranks within the top ${BUSINESS_INSIGHT_THRESHOLDS.topDemandRankLimit} by units sold and available stock is at or below ROP.`,
        relatedEntityId: item.id,
        relatedEntityName: item.name,
        targetReport: 'supplier-reorder',
        targetFilters: { item: item.name }
      }, bounds));
    }
  });

  // Available stock is a current snapshot; never present it as historical stock
  // for an earlier reporting period.
  if (!currentPeriod) return insights;
  const lookbackEnd = now;
  const lookbackStart = new Date(now);
  lookbackStart.setDate(lookbackStart.getDate() - BUSINESS_INSIGHT_THRESHOLDS.slowMovingLookbackDays);
  const lookbackSales = allSales.filter(sale => periodContains(sale, { start: lookbackStart, end: lookbackEnd }));
  const slowQuantities = new Map();
  lookbackSales.forEach(sale => (sale.items || []).forEach(item => {
    const key = item.inventoryId || item.inventory_id;
    if (key) slowQuantities.set(String(key), number(slowQuantities.get(String(key))) + quantity(item));
  }));

  // The inventory API does not expose reliable creation dates. Require an
  // older completed sale as evidence the product existed before the lookback.
  // Such products can have zero recent sales; new/unobserved items are excluded.
  const olderObservedIds = new Set();
  allSales.forEach(sale => {
    const saleDate = dateOf(sale.createdAt ?? sale.created_at);
    if (!saleDate || saleDate >= lookbackStart) return;
    (sale.items || []).forEach(item => {
      const key = item.inventoryId || item.inventory_id;
      if (key) olderObservedIds.add(String(key));
    });
  });
  // Prior stock movements also establish branch-level history for never-sold products.
  stockMovements.forEach(movement => {
    const when = dateOf(movement.createdAt ?? movement.created_at);
    const id = movement.inventoryId ?? movement.inventory_id;
    if (id != null && when && when < lookbackStart) olderObservedIds.add(String(id));
  });
  inventory.filter(item => number(item.availableQuantity ?? item.quantity) > 0).forEach(item => {
    const key = String(item.id ?? item.inventoryId ?? '');
    if (!key || !olderObservedIds.has(key)) return;
    const observed = number(slowQuantities.get(key));
    if (observed > BUSINESS_INSIGHT_THRESHOLDS.slowMovingMaxUnitsSold) return;
    insights.push(makeInsight({
      id: `slow-moving-${key}`,
      type: 'slow-moving-inventory',
      priority: 'Medium',
      title: 'Slow-Moving Inventory',
      summary: `${item.name} has ${number(item.availableQuantity ?? item.quantity)} units available but only ${observed} units were sold during the last ${BUSINESS_INSIGHT_THRESHOLDS.slowMovingLookbackDays} days.`,
      evidence: `Available stock: ${number(item.availableQuantity ?? item.quantity)}. Units sold in lookback: ${observed}.`,
      recommendation: 'Consider reviewing future replenishment quantities until demand increases.',
      metricValues: { available: number(item.availableQuantity ?? item.quantity), unitsSold: observed, lookbackDays: BUSINESS_INSIGHT_THRESHOLDS.slowMovingLookbackDays },
      ruleTriggered: `Product has positive available stock and no more than ${BUSINESS_INSIGHT_THRESHOLDS.slowMovingMaxUnitsSold} units sold in the ${BUSINESS_INSIGHT_THRESHOLDS.slowMovingLookbackDays}-day observation window.`,
      relatedEntityId: item.id,
      relatedEntityName: item.name,
      targetReport: 'business-insights',
      targetFilters: { section: 'slow-moving-inventory' }
    }, bounds));
  });
  return insights;
}

function untrackedInsights(sales, bounds) {
  const groups = new Map();
  sales.forEach(sale => (sale.items || []).filter(isManual).forEach(item => {
    const key = manualKey(item);
    if (!key) return;
    const group = groups.get(key) || { name: itemName(item), count: 0, transactions: new Set() };
    group.count += quantity(item);
    group.transactions.add(sale.id || sale.saleId || sale.createdAt);
    groups.set(key, group);
  }));
  return [...groups.values()]
    .filter(group => group.transactions.size >= BUSINESS_INSIGHT_THRESHOLDS.recurringUntrackedMinTransactions)
    .map(group => makeInsight({
      id: `recurring-untracked-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      type: 'recurring-untracked-demand',
      priority: 'High',
      title: 'Recurring Untracked Demand',
      summary: `${group.name} was manually recorded in ${group.transactions.size} sales during this period.`,
      evidence: `Completed sales containing this manually recorded item: ${group.transactions.size}. Units recorded: ${group.count}.`,
      recommendation: 'Consider reviewing whether this item should be added to regular inventory for better tracking.',
      metricValues: { transactionCount: group.transactions.size, unitsRecorded: group.count },
      ruleTriggered: `The same normalized manual item appears in at least ${BUSINESS_INSIGHT_THRESHOLDS.recurringUntrackedMinTransactions} completed sales.`,
      relatedEntityName: group.name,
      targetReport: 'untracked-sales',
      targetFilters: { item: group.name }
    }, bounds));
}

export function sortAndLimitInsights(insights = [], limit) {
  const sorted = [...insights].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.title.localeCompare(b.title));
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

export function generateBusinessInsights({
  sales = [],
  previousSales = [],
  allSales = sales,
  inventory = [],
  stockMovements = [],
  periodBounds,
  limit
} = {}) {
  const completedSales = sales.filter(isCompletedSaleTransaction);
  const completedPreviousSales = previousSales.filter(isCompletedSaleTransaction);
  const completedAllSales = allSales.filter(isCompletedSaleTransaction);
  const insights = [
    ...salesInsights(completedSales, completedPreviousSales, periodBounds),
    ...profitabilityInsights(completedSales, periodBounds),
    ...inventoryInsights(completedSales, completedAllSales, inventory, periodBounds, stockMovements),
    ...untrackedInsights(completedSales, periodBounds)
  ];
  return sortAndLimitInsights(insights, limit);
}

export const getPriorityRank = priority => PRIORITY_ORDER[priority] ?? PRIORITY_ORDER.Informational;
