import assert from 'node:assert/strict';
import { test } from 'node:test';
import axios from 'axios';
import { enablePrototypeStorage } from './prototypeStorage.js';

test('comparison endpoint enforces Super Admin, validates dates, reads both branches, and emits local change events', async () => {
  const original = { window: globalThis.window, localStorage: globalThis.localStorage, adapter: axios.defaults.adapter };
  const values = new Map();
  const events = [];
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  globalThis.window = { location: { origin: 'http://localhost' }, fetch: async () => {}, dispatchEvent: event => events.push(event.type) };
  try {
    enablePrototypeStorage();
    const request = () => axios.get('http://localhost/api/reports/branch-comparison', { params: { start: '2026-10-01', end: '2026-10-31' } });
    await assert.rejects(request(), error => error.response.status === 403);
    for (const role of ['Admin', 'Sales Encoder', 'Inventory Staff', 'Sales Encoder + Inventory Staff']) {
      localStorage.setItem('user', JSON.stringify({ role, branch: 'Manggahan' }));
      await assert.rejects(request(), error => error.response.status === 403);
    }
    localStorage.setItem('user', JSON.stringify({ role: 'Super Admin', branch: 'Manggahan' }));
    localStorage.setItem('token', 'storesync-prototype-token');
    await assert.rejects(axios.get('http://localhost/api/reports/branch-comparison'), error => error.response.status === 400);
    await assert.rejects(axios.get('http://localhost/api/reports/branch-comparison', { params: { start: '2026-11-01', end: '2026-10-01' } }), error => error.response.status === 400);
    const { data } = await request();
    assert.deepEqual([...new Set(data.products.map(item => item.branch))].sort(), ['Manggahan', 'San Rafael']);
    assert.deepEqual([...new Set(data.sales.map(item => item.branch))].sort(), ['Manggahan', 'San Rafael']);
    assert.ok(data.snapshotAt);
    assert.ok(data.sales.every(item => !('customer_name' in item)));
    const branchScoped = await axios.get('http://localhost/api/inventory');
    assert.ok(branchScoped.data.products.every(item => item.branch === 'Manggahan'));
    await axios.post('http://localhost/api/inventory', { name: 'Test item', category: 'Steel' });
    assert.ok(events.includes('storesync-data-changed'));
  } finally {
    axios.defaults.adapter = original.adapter;
    globalThis.window = original.window;
    globalThis.localStorage = original.localStorage;
  }
});
