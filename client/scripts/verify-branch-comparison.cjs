const { chromium } = require('playwright-chromium');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, timezoneId: 'Asia/Manila' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const origin = process.env.STORESYNC_URL || 'http://127.0.0.1:3000';
    const login = async (username) => {
      await page.getByPlaceholder('Enter your username').fill(username);
      await page.getByPlaceholder('Enter your password').fill('admin123');
      await page.getByRole('button', { name: 'Login', exact: true }).click();
      await page.getByRole('button', { name: 'Reports', exact: true }).click();
      await page.getByRole('combobox').filter({ hasText: /^Summary$/ }).click();
      await page.getByRole('option', { name: 'Business Insights', exact: true }).click();
    };
    await page.goto(origin);
    await login('admin');
    await page.getByRole('combobox', { name: 'Period', exact: true }).click();
    await page.getByRole('option', { name: 'Monthly', exact: true }).click();
    await page.getByLabel('Select monthly report date', { exact: true }).fill('2026-10-15');
    const card = page.locator('[aria-labelledby="branch-comparison-title"]');
    await card.getByRole('table').waitFor({ state: 'visible' });
    const getValue = label => card.getByRole('row').filter({ has: page.getByRole('rowheader', { name: label, exact: true }) }).getByRole('cell').first();
    assert.equal(await card.getByRole('rowheader').count(), 7);
    assert.ok(await card.getByText(/Current inventory snapshot/).isVisible());
    const initial = Number((await getValue('Sales').innerText()).replace(/[^\d.-]/g, ''));
    const stockInitial = await getValue('Out-of-Stock Items').innerText();
    console.log('Initial snapshot:', (await card.innerText()).replace(/\n/g, ' | '));
    await card.screenshot({ path: path.join(os.tmpdir(), 'storesync-branch-comparison-desktop.png') });

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
    const pdf = await download;
    await pdf.saveAs(path.join(os.tmpdir(), 'storesync-branch-comparison.pdf'));
    console.log('PDF exported:', pdf.suggestedFilename());

    // Same-tab persisted change event: isolated test data, never the user's data.
    const appendSale = () => {
      const key = 'storesync_prototype_data_v1';
      const data = JSON.parse(localStorage.getItem(key));
      data.sales.push({ sales_transaction_id: `comparison-check-${data.sales.length}`, branch: 'Manggahan', created_at: '2026-10-15T12:00:00+08:00', status: 'completed', transaction_type: 'sale', subtotal_amount: 1000, total_amount: 1000, total_quantity: 1, items: [{ subtotal: 1000, cost_subtotal: 700, quantity_sold: 1 }] });
      localStorage.setItem(key, JSON.stringify(data));
    };
    await page.evaluate(appendSale);
    await page.evaluate(() => window.dispatchEvent(new Event('storesync-data-changed')));
    const format = number => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(number);
    await getValue('Sales').getByText(format(initial + 1000), { exact: true }).waitFor({ state: 'visible' });

    // Cross-tab storage events update the visible comparison without navigation.
    const other = await context.newPage();
    await other.route('**/comparison-test-document', route => route.fulfill({ contentType: 'text/html', body: '<title>Comparison test</title>' }));
    await other.goto(`${origin}/comparison-test-document`);
    await other.evaluate(appendSale);
    await getValue('Sales').getByText(format(initial + 2000), { exact: true }).waitFor({ state: 'visible' });
    await other.close();

    // A same-tab change without an event must still arrive through 30s polling.
    await page.evaluate(appendSale);
    await getValue('Sales').getByText(format(initial + 3000), { exact: true }).waitFor({ state: 'visible', timeout: 35000 });

    await page.getByLabel('Select monthly report date', { exact: true }).fill('2025-01-15');
    await card.getByText('Neither branch recorded positive sales revenue during this period.', { exact: false }).waitFor({ state: 'visible' });
    assert.equal(await getValue('Sales').innerText(), format(0));
    assert.equal(await getValue('Profit Margin').innerText(), '—');
    assert.equal(await getValue('Out-of-Stock Items').innerText(), stockInitial);

    // Stale snapshot / retry handling and export guard on a rejected refresh.
    await page.evaluate(() => { sessionStorage.setItem('comparison-test-user', localStorage.getItem('user')); localStorage.removeItem('user'); });
    await card.getByRole('button', { name: 'Refresh branch comparison', exact: true }).click();
    await card.getByRole('alert').waitFor({ state: 'visible' });
    assert.match(await card.getByRole('alert').innerText(), /last successful snapshot/);
    await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
    await page.getByText('Wait for a successful branch comparison refresh before exporting.', { exact: true }).waitFor({ state: 'visible' });
    await page.evaluate(() => localStorage.setItem('user', sessionStorage.getItem('comparison-test-user')));
    await card.getByRole('button', { name: 'Refresh branch comparison', exact: true }).click();
    await card.getByRole('alert').waitFor({ state: 'hidden' });

    await page.setViewportSize({ width: 390, height: 844 });
    await card.scrollIntoViewIfNeeded();
    await card.screenshot({ path: path.join(os.tmpdir(), 'storesync-branch-comparison-mobile.png') });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await card.getByRole('button', { name: 'Refresh branch comparison', exact: true }).focus();
    await page.keyboard.press('Enter');
    await card.getByRole('button', { name: 'Refresh branch comparison', exact: true }).waitFor({ state: 'visible' });

    // Branch Admin still has Business Insights but does not receive comparison UI.
    await context.close();
    const branchContext = await browser.newContext();
    const branchPage = await branchContext.newPage();
    await branchPage.goto(origin);
    await branchPage.getByPlaceholder('Enter your username').fill('branchadmin');
    await branchPage.getByPlaceholder('Enter your password').fill('admin123');
    await branchPage.getByRole('button', { name: 'Login', exact: true }).click();
    await branchPage.getByRole('button', { name: 'Reports', exact: true }).click();
    await branchPage.getByRole('combobox').filter({ hasText: /^Summary$/ }).click();
    await branchPage.getByRole('option', { name: 'Business Insights', exact: true }).click();
    assert.equal(await branchPage.getByText('Branch Performance Comparison', { exact: true }).count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: seven metrics, PDF export, same-tab and cross-tab updates, 30s polling, period isolation, unchanged current stock, zero-sales margins, stale/error/retry states, mobile overflow, keyboard refresh, and Super Admin-only UI.');
    await branchContext.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
