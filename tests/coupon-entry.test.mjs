import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { loadComponentWithMocks } from './load-typescript.mjs';
const require = createRequire(import.meta.url);

async function setup({ code = '', reject = false } = {}) {
  const states = [];
  let index = 0;
  const codes = [];
  let removed = false;
  const { CouponEntry } = await loadComponentWithMocks(new URL('../src/components/checkout/CouponEntry.tsx', import.meta.url), {
    'react/jsx-runtime': require('react/jsx-runtime'),
    react: { useState(initial) { const slot = index++; if (!(slot in states)) states[slot] = initial; return [states[slot], (value) => { states[slot] = value; }]; } },
    'lucide-react': { TicketPercent: 'span', X: 'span' },
    '@/src/components/ui/Button': { Button: 'button' },
  }, { Error });
  const render = () => { index = 0; return CouponEntry({ code, onApply: async (value) => { if (reject) throw new Error('Coupon is expired'); codes.push(value); }, onRemove: () => { removed = true; } }); };
  const nodes = (node) => Array.isArray(node) ? node.flatMap(nodes) : node && typeof node === 'object' ? [node, ...nodes(node.props?.children)] : [];
  return { render, nodes, states, codes, removed: () => removed };
}

test('checkout normalizes a coupon code before requesting validation', async () => {
  const app = await setup();
  app.nodes(app.render()).find((node) => node.type === 'input').props.onChange({ target: { value: ' save10 ' } });
  app.nodes(app.render()).find((node) => node.type === 'button').props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(app.codes, ['SAVE10']);
  assert.equal(app.states[0], '');
});
test('invalid coupon errors are visible and do not report a successful application', async () => {
  const app = await setup({ reject: true });
  app.nodes(app.render()).find((node) => node.type === 'input').props.onChange({ target: { value: 'OLD10' } });
  app.nodes(app.render()).find((node) => node.type === 'button').props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(app.states[2], 'Coupon is expired');
  assert.deepEqual(app.codes, []);
  assert(app.nodes(app.render()).some((node) => node.props?.role === 'alert'));
});
test('an applied coupon can be removed', async () => {
  const app = await setup({ code: 'SAVE10' });
  app.nodes(app.render()).find((node) => node.props?.['aria-label'] === 'Remove coupon').props.onClick();
  assert.equal(app.removed(), true);
});
