const { chromium } = require('playwright-chromium');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [username, title] of [
      ['admin', 'Super Admin Guide'], ['branchadmin', 'Admin Guide'],
      ['salesencoder', 'Sales Encoder Guide'], ['inventorystaff', 'Inventory Staff Guide'],
      ['branchstaff', 'Sales Encoder + Inventory Staff Guide'],
    ]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(process.env.STORESYNC_URL || 'http://127.0.0.1:3000');
      await page.getByPlaceholder('Enter your username').fill(username);
      await page.getByPlaceholder('Enter your password').fill('admin123');
      await page.getByRole('button', { name: 'Login', exact: true }).click();
      await page.getByRole('button', { name: 'Help', exact: true }).click();
      await page.getByRole('heading', { name: title, exact: true }).waitFor();
      const help = page.locator('.help-page');
      const expectedModules = {
        admin: ['Dashboard', 'Search Products', 'Inventory', 'Archive', 'Reports', 'Sales', 'Purchases', 'Alerts', 'Maintenance', 'User Management', 'Audit Trail', 'Help'],
        branchadmin: ['Dashboard', 'Search Products', 'Inventory', 'Archive', 'Reports', 'Sales', 'Purchases', 'Alerts', 'User Management', 'Audit Trail', 'Help'],
        salesencoder: ['Dashboard', 'Search Products', 'Inventory', 'Sales', 'Alerts', 'Help'],
        inventorystaff: ['Dashboard', 'Search Products', 'Inventory', 'Archive', 'Reports', 'Purchases', 'Alerts', 'Help'],
        branchstaff: ['Dashboard', 'Search Products', 'Inventory', 'Archive', 'Reports', 'Sales', 'Purchases', 'Alerts', 'Help'],
      };
      assert.deepEqual(await help.locator('.help-role-pill').allTextContents(), expectedModules[username]);
      for (const sectionTitle of ['Frequently Asked Questions', 'Step-by-Step Guides', 'Troubleshooting', 'System Guidelines', 'Contact Support']) {
        const card = help.locator('.help-card').filter({ has: page.getByText(sectionTitle, { exact: true }) });
        await card.getByRole('button', { name: 'Show All', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        assert.ok((await dialog.innerText()).length > 150, `${username}: empty ${sectionTitle}`);
        await dialog.getByRole('button', { name: 'Close', exact: true }).click();
        await dialog.waitFor({ state: 'hidden' });
      }
      if (username === 'admin') {
        assert.equal(await page.getByText('Prototype Super Admin', { exact: true }).count(), 0);
        await page.evaluate(() => {
          const key = 'storesync_prototype_data_v1';
          const data = JSON.parse(localStorage.getItem(key));
          data.users.find(user => user.username === 'admin').full_name = 'Prototype Super Admin';
          localStorage.setItem(key, JSON.stringify(data));
          const user = JSON.parse(localStorage.getItem('user'));
          user.full_name = 'Prototype Super Admin';
          localStorage.setItem('user', JSON.stringify(user));
        });
        await page.reload();
        await page.getByRole('button', { name: 'Help', exact: true }).click();
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('user')).full_name), 'Super Admin');
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('storesync_prototype_data_v1')).users.find(user => user.username === 'admin').full_name), 'Super Admin');
        assert.equal(await page.getByText('Prototype Super Admin', { exact: true }).count(), 0);
      }
      assert.ok(await help.locator('[aria-expanded="false"]').count() > 0);
      const controlId = await help.locator('.help-row[aria-expanded="false"]').first().getAttribute('aria-controls');
      const accordion = help.locator(`[aria-controls="${controlId}"]`);
      await accordion.focus();
      await page.keyboard.press('Enter');
      assert.equal(await accordion.getAttribute('aria-expanded'), 'true');
      const showAll = help.getByRole('button', { name: 'Show All', exact: true }).first();
      await showAll.click();
      await page.getByRole('dialog').waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      assert.equal(await showAll.evaluate(el => el === document.activeElement), true);
      const search = page.getByRole('searchbox', { name: 'Search help topics' });
      await search.fill('Comparing Branch Performance');
      assert.equal(await help.getByText('Comparing Branch Performance', { exact: true }).count(), username === 'admin' ? 1 : 0);
      await search.fill('zzzz-no-topic');
      await help.getByRole('button', { name: 'Clear filters', exact: true }).click();
      assert.equal(await search.inputValue(), '');
      const downloadPromise = page.waitForEvent('download');
      await help.getByRole('button', { name: 'Download My User Manual PDF', exact: true }).click();
      const download = await downloadPromise;
      assert.equal(await download.failure(), null);
      await download.saveAs(path.join(os.tmpdir(), `storesync-help-${username}.pdf`));
      assert.equal(await help.locator('.help-role-pill').filter({ hasText: /^Maintenance$/ }).count(), username === 'admin' ? 1 : 0);
      await page.getByRole('combobox', { name: 'Filter help topics' }).click();
      await page.getByRole('option', { name: 'Contact Support', exact: true }).click();
      assert.equal(await help.locator('.help-main-grid').count(), 0);
      assert.equal(await help.locator('.help-grid-single').count(), 1);
      await page.getByRole('combobox', { name: 'Filter help topics' }).click();
      await page.getByRole('option', { name: 'All Topics', exact: true }).click();
      if (username === 'admin') await page.screenshot({ path: path.join(os.tmpdir(), 'storesync-help-desktop.png') });
      await page.setViewportSize({ width: 390, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (username === 'admin') await page.screenshot({ path: path.join(os.tmpdir(), 'storesync-help-mobile.png'), fullPage: true });
      assert.deepEqual(errors, []);
      console.log(`${username}: role guide, visible content, keyboard accordion, dialog focus, search, PDF, mobile overflow passed`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
