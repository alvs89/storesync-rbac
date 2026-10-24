const { chromium } = require('playwright-chromium');
const assert = require('node:assert/strict');

// Isolated browser context: exercises the prototype without changing the user's
// browser records. Checks the actual category options and supplier product views.
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(process.env.STORESYNC_URL || 'http://127.0.0.1:3000');
    await page.getByPlaceholder('Enter your username').fill('admin');
    await page.getByPlaceholder('Enter your password').fill('admin123');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    for (const branch of ['Manggahan', 'San Rafael']) {
      if (branch !== 'Manggahan') {
        await page.getByRole('combobox', { name: 'Active Branch', exact: true }).selectOption(branch);
      }
      await page.getByRole('button', { name: 'Purchases', exact: true }).click();
      const categoryTrigger = page.getByRole('button', { name: 'Supplier Categories', exact: true });
      await categoryTrigger.click();
      const names = await page.locator('.purchase-category-option').allTextContents();
      assert.equal(names.length, 9, `${branch}: expected nine categories`);
      await page.keyboard.press('Escape');
      for (const name of names.map(value => value.trim())) {
        await categoryTrigger.click();
        await page.getByRole('checkbox', { name, exact: true }).check();
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Supplier', exact: true }).click();
        const supplierOptions = page.getByRole('group', { name: 'Supplier', exact: true }).locator('.purchase-supplier-option:not(.purchase-other-supplier)');
        assert.ok(await supplierOptions.count() > 0, `${branch}: no supplier for ${name}`);
        const supplier = await supplierOptions.first().innerText();
        await supplierOptions.first().click();
        await page.locator('.purchase-inventory-row').first().waitFor({ state: 'visible' });
        assert.ok(await page.locator('.purchase-inventory-row').count() > 0, `${branch}: no associated products for ${name}`);
        console.log(`${branch}: ${name} -> ${supplier.replace(/\n/g, ' / ')}`);
        await page.getByRole('button', { name: 'Clear Supplier', exact: true }).click();
        await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: all nine selectable categories have suppliers and selectable inventory products in both branches; no console/page errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
