const { chromium } = require('playwright-chromium');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, timezoneId: 'Asia/Manila' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const origin = process.env.STORESYNC_URL || 'http://127.0.0.1:3000';
    const login = async (target, username) => {
      await target.goto(origin);
      await target.getByPlaceholder('Enter your username').fill(username);
      await target.getByPlaceholder('Enter your password').fill('admin123');
      await target.getByRole('button', { name: 'Login', exact: true }).click();
    };
    await login(page, 'admin');
    const summary = page.locator('[aria-labelledby="dashboard-branch-comparison-title"]');
    await summary.locator('dd').first().waitFor({ state: 'visible' });
    assert.match(await summary.innerText(), /Both branches · Today/);
    await page.getByRole('combobox', { name: 'Date Range', exact: true }).click();
    await page.getByRole('option', { name: 'This Month', exact: true }).click();
    await summary.locator('dd').first().waitFor({ state: 'visible' });
    await summary.locator('.dashboard-branch-insight').getByText(/more sales/).waitFor({ state: 'visible' });
    assert.equal(await summary.locator('.dashboard-branch-metric-card').count(), 2);
    assert.equal(await summary.locator('dd').count(), 4);
    const amounts = await summary.locator('dd').allTextContents();
    console.log('Monthly summary:', amounts);
    const initial = Number(amounts[0].replace(/[^\d.-]/g, ''));
    await summary.screenshot({ path: path.join(os.tmpdir(), 'storesync-dashboard-branch-summary-desktop.png') });

    await page.getByRole('button', { name: 'Hide sensitive metrics', exact: true }).click();
    assert.deepEqual(await summary.locator('dd').allTextContents(), ['••••', '••••', '••••', '••••']);
    assert.match(await summary.locator('.dashboard-branch-insight').innerText(), /Financial figures are hidden/);
    assert.doesNotMatch(await summary.innerText(), /₱|percentage-point/);
    await page.getByRole('button', { name: 'Show sensitive metrics', exact: true }).click();
    assert.deepEqual(await summary.locator('dd').allTextContents(), amounts);

    await page.evaluate(() => {
      const key = 'storesync_prototype_data_v1';
      const data = JSON.parse(localStorage.getItem(key));
      const now = new Date();
      data.sales.push({ sales_transaction_id: 'dashboard-summary-check', branch: 'Manggahan', created_at: now.toISOString(), status: 'completed', transaction_type: 'sale', subtotal_amount: 1000, total_amount: 1000, total_quantity: 1, items: [{ subtotal: 1000, cost_subtotal: 700, quantity_sold: 1 }] });
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event('storesync-data-changed'));
    });
    const updated = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(initial + 1000);
    await summary.locator('dd').first().getByText(updated, { exact: true }).waitFor({ state: 'visible' });
    await summary.getByRole('button', { name: 'View Branch Comparison', exact: true }).focus();
    await page.keyboard.press('Enter');
    const comparison = page.locator('[aria-labelledby="branch-comparison-title"]');
    await comparison.getByRole('table').waitFor({ state: 'visible' });
    assert.match(await page.getByRole('combobox', { name: 'Period', exact: true }).innerText(), /Monthly/);
    const reportSales = comparison.getByRole('row').filter({ has: page.getByRole('rowheader', { name: 'Sales', exact: true }) }).getByRole('cell').first();
    assert.equal(await reportSales.innerText(), updated);

    await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
    await page.getByRole('combobox', { name: 'Date Range', exact: true }).click();
    await page.getByRole('option', { name: 'Selected Day', exact: true }).click();
    await page.getByLabel('Sales Date', { exact: true }).fill('2025-01-15');
    await summary.locator('.dashboard-branch-insight').getByText(/Neither branch recorded positive sales revenue/).waitFor({ state: 'visible' });
    await summary.getByRole('button', { name: 'View Branch Comparison', exact: true }).click();
    await comparison.getByRole('table').waitFor({ state: 'visible' });
    assert.match(await page.getByRole('combobox', { name: 'Period', exact: true }).innerText(), /Daily/);
    assert.equal(await page.getByLabel('Select daily report date', { exact: true }).inputValue(), '2025-01-15');

    await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
    await page.getByRole('combobox', { name: 'Date Range', exact: true }).click();
    await page.getByRole('option', { name: 'This Year', exact: true }).click();
    await summary.locator('dd').first().waitFor({ state: 'visible' });
    await summary.getByRole('button', { name: 'View Branch Comparison', exact: true }).click();
    await comparison.getByRole('table').waitFor({ state: 'visible' });
    assert.match(await page.getByRole('combobox', { name: 'Period', exact: true }).innerText(), /Custom Range/);
    const year = new Date().getFullYear();
    assert.equal(await page.locator('#reports-custom-start').inputValue(), `${year}-01-01`);
    assert.equal(await page.locator('#reports-custom-end').inputValue(), `${year}-12-31`);

    await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
    await summary.locator('dd').first().waitFor({ state: 'visible' });
    await page.setViewportSize({ width: 390, height: 844 });
    await summary.screenshot({ path: path.join(os.tmpdir(), 'storesync-dashboard-branch-summary-mobile.png') });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    await context.close();

    for (const username of ['branchadmin', 'salesencoder', 'inventorystaff', 'branchstaff']) {
      const staffContext = await browser.newContext();
      const staffPage = await staffContext.newPage();
      await login(staffPage, username);
      await staffPage.getByRole('heading', { name: 'Quick Summary', exact: true }).waitFor({ state: 'visible' });
      assert.equal(await staffPage.locator('[aria-labelledby="dashboard-branch-comparison-title"]').count(), 0);
      await staffContext.close();
    }
    console.log('PASS: Super Admin summary, four financial values, privacy mode, immediate updates, keyboard report link, matching monthly/daily/year periods, mobile overflow, no console/page errors, hidden for all four other roles.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
