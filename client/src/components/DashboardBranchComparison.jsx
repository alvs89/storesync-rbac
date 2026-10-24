import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useBranchComparison } from './useBranchComparison';
import { compareBranches, branchComparisonInsight, BRANCH_COMPARISON_METRICS } from '../utils/branchComparison';
import { BranchComparisonInsight } from './BranchComparisonInsight';
import './dashboardBranchComparison.css';

const formatMoney = BRANCH_COMPARISON_METRICS.find(metric => metric.key === 'sales').format;

export function DashboardBranchComparison({ enabled, start, end, periodLabel, rangeLabel, showFinancialValues, onViewReport }) {
  const { snapshot, error, refreshing, refresh } = useBranchComparison(enabled, start, end);
  const rows = useMemo(() => snapshot ? compareBranches(snapshot, start, end) : null, [snapshot, start, end]);
  return <section className="dashboard-panel dashboard-branch-comparison" aria-labelledby="dashboard-branch-comparison-title" aria-busy={refreshing}>
    <div className="dashboard-panel-header">
      <div className="min-w-0">
        <h2 className="dashboard-panel-title" id="dashboard-branch-comparison-title">Branch Performance Summary</h2>
        <p className="dashboard-panel-subtitle">Both branches · {periodLabel} · {rangeLabel}</p>
      </div>
      <Button type="button" variant="outline" size="sm" className="dashboard-branch-report-link" onClick={onViewReport}>
        View Branch Comparison<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
    <div className="dashboard-branch-comparison-body">
      {error && <div role="alert" className="dashboard-branch-error">
        <p>{error}{rows ? ' Showing the last successful snapshot; figures may be outdated.' : ''}</p>
        <Button type="button" variant="outline" size="sm" onClick={refresh} disabled={refreshing}>Retry branch summary</Button>
      </div>}
      {!rows ? <p role="status" className="dashboard-branch-status">{error ? 'Branch summary unavailable.' : 'Loading both branches…'}</p> : <>
        <div className="dashboard-branch-metrics">
          {rows.map((row, index) => <section key={row.branch} className="dashboard-branch-metric-card" aria-labelledby={`dashboard-comparison-branch-${index}`}>
            <h3 id={`dashboard-comparison-branch-${index}`}>{row.branch}</h3>
            <dl>
              <div><dt>Sales</dt><dd>{showFinancialValues ? formatMoney(row.sales) : <span aria-label="Hidden">••••</span>}</dd></div>
              <div><dt>Actual Profit</dt><dd>{showFinancialValues ? formatMoney(row.actualProfit) : <span aria-label="Hidden">••••</span>}</dd></div>
            </dl>
          </section>)}
        </div>
        <p className="dashboard-branch-insight">{showFinancialValues ? <BranchComparisonInsight text={branchComparisonInsight(rows)} /> : 'Financial figures are hidden.'}</p>
        <div className="dashboard-branch-footnote">
          <span>Completed sales only. Operating expenses are not deducted.</span>
          <span>Auto-updates · Updated <time dateTime={snapshot.snapshotAt}>{new Date(snapshot.snapshotAt).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}</time></span>
        </div>
      </>}
    </div>
  </section>;
}
