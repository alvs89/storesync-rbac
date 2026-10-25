import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canAccessReportType, ROLE_VALUES } from './roles.js';

test('Admin and Super Admin can review every Business Insights supporting report', () => {
  for (const role of [ROLE_VALUES.ADMIN, ROLE_VALUES.SUPER_ADMIN]) {
    for (const report of ['business-insights', 'actual-earnings', 'supplier-reorder', 'untracked-sales', 'sales-movements']) {
      assert.equal(canAccessReportType(role, report), true, `${role} needs ${report}`);
    }
  }
});

test('operational staff cannot access confidential business insights or earnings', () => {
  for (const role of [ROLE_VALUES.SALES_ENCODER, ROLE_VALUES.INVENTORY_STAFF, ROLE_VALUES.SALES_INVENTORY_STAFF]) {
    assert.equal(canAccessReportType(role, 'business-insights'), false);
    assert.equal(canAccessReportType(role, 'actual-earnings'), false);
  }
});
