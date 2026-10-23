// One-time, scoped demo-data utility. Does not create purchases or change stock.
// Run without flags to preview. Only use --apply on a confirmed demo database.
// Provisional supplier-product relationships MUST be verified for real purchasing.
const { Pool } = require('pg');
const {
  DEMO_PRODUCT_SUPPLIER_OVERRIDES,
  OFFICIAL_SUPPLIERS
} = require('./supplier-master-list');

async function main() {
  const apply = process.argv.includes('--apply');
  if (apply && !process.argv.includes('--demo-data-confirmed')) {
    throw new Error('Refusing to write without --demo-data-confirmed.');
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require')
      ? { rejectUnauthorized: false } : undefined
  });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'SELECT product_id, name, supplier_name FROM products ORDER BY product_id FOR UPDATE'
    );
    const rows = result.rows;
    const names = new Set(rows.map(row => row.name));
    const missingProducts = Object.keys(DEMO_PRODUCT_SUPPLIER_OVERRIDES)
      .filter(name => !names.has(name));
    if (missingProducts.length) {
      throw new Error('The catalog differs from the demonstration fixture: ' + missingProducts.join('; '));
    }
    const changes = rows.filter(row =>
      DEMO_PRODUCT_SUPPLIER_OVERRIDES[row.name] &&
      row.supplier_name !== DEMO_PRODUCT_SUPPLIER_OVERRIDES[row.name]
    ).map(row => ({
      productId: row.product_id,
      product: row.name,
      from: row.supplier_name,
      to: DEMO_PRODUCT_SUPPLIER_OVERRIDES[row.name]
    }));
    const planned = new Map();
    for (const row of rows) {
      const supplier = DEMO_PRODUCT_SUPPLIER_OVERRIDES[row.name] || row.supplier_name;
      planned.set(supplier, (planned.get(supplier) || 0) + 1);
    }
    const missingSuppliers = OFFICIAL_SUPPLIERS.filter(name => !planned.has(name));
    if (missingSuppliers.length) {
      throw new Error('Not all official suppliers would have items: ' + missingSuppliers.join(', '));
    }
    if (apply) {
      for (const change of changes) {
        const response = await client.query(
          'UPDATE products SET supplier_name = $1 WHERE product_id = $2 AND supplier_name IS NOT DISTINCT FROM $3',
          [change.to, change.productId, change.from]
        );
        if (response.rowCount !== 1) throw new Error('Concurrent supplier change detected; rolling back.');
      }
      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
    }
    console.log(JSON.stringify({
      mode: apply ? 'applied' : 'dry-run',
      products: rows.length,
      suppliersWithItems: planned.size,
      officialSuppliers: OFFICIAL_SUPPLIERS.length,
      changes
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

