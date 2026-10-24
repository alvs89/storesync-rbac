import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BRANCH_COMPARISON_METRICS, COMPARISON_BRANCHES } from '../utils/branchComparison';
import './branchComparisonCard.css';
import { BranchComparisonInsight } from './BranchComparisonInsight';

export function BranchComparisonCard({ rows, insight, periodLabel, snapshotAt, refreshing, error, onRefresh }) {
  return <Card className="reports-data-card branch-comparison" aria-labelledby="branch-comparison-title" aria-busy={refreshing}>
    <CardHeader data-card-header className="branch-comparison-header">
      <div className="branch-comparison-heading-row">
        <div className="min-w-0">
          <CardTitle id="branch-comparison-title" className="branch-comparison-title">Branch Performance Comparison</CardTitle>
          <CardDescription className="branch-comparison-subtitle">Super Admin overview · {periodLabel}</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="branch-comparison-refresh" disabled={refreshing} onClick={onRefresh} aria-label="Refresh branch comparison">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />{refreshing ? 'Updating…' : 'Refresh'}
        </Button>
      </div>
    </CardHeader>
    <CardContent data-card-content className="branch-comparison-content">
      {error && <p role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}{rows ? ' Showing the last successful snapshot; figures may be outdated.' : ''}</p>}
      {!rows ? <p role="status" className="text-sm text-slate-600">{error ? 'Comparison unavailable. Use Refresh to retry.' : 'Loading both branches…'}</p> : <>
        <p className="branch-comparison-insight"><BranchComparisonInsight text={insight} /></p>
        <div className="branch-comparison-table-frame">
        <Table className="branch-comparison-table">
          <caption className="sr-only">Manggahan and San Rafael performance for {periodLabel}. Stock figures are current snapshots.</caption>
          <TableHeader><TableRow>
            <TableHead scope="col" className="branch-comparison-metric-heading">Metric</TableHead>
            {COMPARISON_BRANCHES.map(branch => <TableHead key={branch} scope="col" className="branch-comparison-branch-heading">{branch}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {BRANCH_COMPARISON_METRICS.map((metric, index) => <React.Fragment key={metric.key}>
              {(index === 0 || index === 5) && <TableRow className="branch-comparison-section"><TableCell colSpan={3}>{metric.snapshot ? 'Current inventory snapshot' : 'Completed sales · selected period'}</TableCell></TableRow>}
              <TableRow className={metric.key === 'sales' ? 'branch-comparison-sales-row' : undefined}>
                <th scope="row" className="branch-comparison-metric-label">{metric.label}</th>
                {rows.map(row => <TableCell key={row.branch} className="branch-comparison-value">{metric.format(row[metric.key])}</TableCell>)}
              </TableRow>
            </React.Fragment>)}
          </TableBody>
        </Table>
        </div>
        <div className="branch-comparison-notes">
          <p>Sales use completed transactions only; pending payments, cancellations, and refund records are excluded. Actual Profit uses recorded sale-time costs and does not deduct operating expenses. — means no sales revenue to calculate a margin.</p>
          <p>Stock counts reflect current active inventory, regardless of the selected period. Replenishment follows each item’s reorder rule and can include out-of-stock items.</p>
          <p>Auto-refresh every 30 seconds and after local record changes. Last updated: <time dateTime={snapshotAt}>{new Date(snapshotAt).toLocaleString('en-PH')}</time>.</p>
        </div>
      </>}
    </CardContent>
  </Card>;
}
