import { getProfitabilitySummary } from './profitability.js';
import { isCompletedSaleTransaction } from './salesTransactionStatus.js';

export const COMPARISON_BRANCHES = ['Manggahan', 'San Rafael'];
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const round = value => Number(value.toFixed(2));
const currency = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
const decimal = value => new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(value);

export const BRANCH_COMPARISON_METRICS = [
  { key: 'sales', label: 'Sales', format: currency },
  { key: 'actualProfit', label: 'Actual Profit', format: currency },
  { key: 'profitMargin', label: 'Profit Margin', format: value => value === null ? '—' : `${decimal(value)}%` },
  { key: 'completedTransactions', label: 'Completed Transactions', format: decimal },
  { key: 'unitsSold', label: 'Units Sold', format: decimal },
  { key: 'outOfStock', label: 'Out-of-Stock Items', format: decimal, snapshot: true },
  { key: 'replenishment', label: 'Items Requiring Replenishment', format: decimal, snapshot: true },
];

// Both branches use identical period boundaries and the existing sale-time cost
// calculation. Inventory measures are current snapshots, never historical counts.
export function compareBranches({ sales = [], products = [] } = {}, start, end) {
  return COMPARISON_BRANCHES.map(branch => {
    const completed = sales.filter(sale => {
      const date = new Date(sale.createdAt ?? sale.created_at).getTime();
      return sale.branch === branch && isCompletedSaleTransaction(sale) && date >= start && date <= end;
    });
    const earnings = getProfitabilitySummary(completed);
    const inventory = products.filter(product => product.branch === branch);
    return {
      branch,
      sales: earnings.totalSales,
      actualProfit: earnings.actualProfit,
      profitMargin: earnings.totalSales > 0 ? earnings.profitMargin : null,
      completedTransactions: completed.length,
      unitsSold: earnings.unitsSold,
      outOfStock: inventory.filter(product => number(product.stock_level ?? product.quantity) <= 0).length,
      replenishment: inventory.filter(product => {
        const recorded = product.needs_reorder ?? product.needsReorder;
        if (typeof recorded === 'boolean') return recorded;
        const available = number(product.available_stock ?? product.availableQuantity ?? product.stock_level ?? product.quantity);
        const threshold = number(product.recommended_reorder_point ?? product.recommendedReorderPoint ?? product.min_stock_level ?? product.reorderLevel);
        return available <= threshold;
      }).length,
    };
  });
}

export function branchComparisonInsight([first, second]) {
  let salesText;
  if (first.sales <= 0 && second.sales <= 0) {
    salesText = 'Neither branch recorded positive sales revenue during this period.';
  } else if (first.sales === second.sales) {
    salesText = `Both branches recorded ${currency(first.sales)} in sales during this period.`;
  } else {
    const higher = first.sales > second.sales ? first : second;
    const lower = higher === first ? second : first;
    salesText = lower.sales > 0
      ? `${higher.branch} recorded ${(((higher.sales - lower.sales) / lower.sales) * 100).toFixed(1)}% more sales than ${lower.branch} during this period.`
      : `${higher.branch} recorded ${currency(higher.sales)} in sales during this period; ${lower.branch} recorded no positive sales revenue. A percentage comparison is not available.`;
  }
  if (first.profitMargin === null || second.profitMargin === null) return `${salesText} A profit margin comparison requires positive sales revenue in both branches.`;
  const difference = round(first.profitMargin - second.profitMargin);
  if (difference === 0) return `${salesText} Both branches had the same profit margin.`;
  const higher = difference > 0 ? first : second;
  return `${salesText} ${higher.branch} had a ${decimal(Math.abs(difference))} percentage-point higher profit margin.`;
}
