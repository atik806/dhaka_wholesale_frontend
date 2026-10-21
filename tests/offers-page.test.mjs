import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { loadComponentWithMocks, loadTypeScriptModule } from './load-typescript.mjs';

const require = createRequire(import.meta.url);
const offers = await loadTypeScriptModule(new URL('../src/lib/offers.ts', import.meta.url));

async function setup({ fail = false, salePrice = '80', loaded = true } = {}) {
  const product = { id: 'helmet', name: 'Helmet', price: 80, basePrice: 100, originalPrice: 120 };
  const sale = { title: 'Flash sale', enabled: true, starts_at: '2099-01-01T00:00:00.000Z', ends_at: '2099-01-02T00:00:00.000Z', products: [{ product_id: product.id, price: 80 }] };
  const states = ['flash', false, false, loaded ? '' : 'Network error', false, '', [], { helmet: { product, salePrice } }, sale, 'Flash sale', '2099-01-01T06:00', '2099-01-02T06:00', '', Date.parse('2098-12-31T00:00:00Z')];
  let stateIndex = 0;
  const calls = [];
  const messages = [];
  const icons = Object.fromEntries(['BadgePercent', 'CalendarClock', 'Loader2', 'PackagePlus', 'Plus', 'Save', 'Search', 'Tag', 'TicketPercent', 'X'].map((name) => [name, 'span']));
  const { default: Page } = await loadComponentWithMocks(new URL('../app/admin/offers/page.tsx', import.meta.url), {
    'react/jsx-runtime': require('react/jsx-runtime'),
    react: {
      useState(initial) {
        const index = stateIndex++;
        if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
        return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
      },
      useEffect() {}, useMemo: (fn) => fn(), useCallback: (fn) => fn,
    },
    'lucide-react': icons,
    '@/src/components/ui/Button': { Button: 'button' },
    '@/src/components/admin/ConfirmDialog': { useConfirm: () => ({ confirm: async () => true, dialog: null }) },
    '@/src/components/admin/OfferProductPicker': { OfferProductPicker: 'product-picker' },
    '@/src/components/admin/PromotionsManager': { PromotionsManager: 'promotions-manager' },
    '@/src/lib/admin-api': { adminFetcher: async (url, options) => {
      calls.push({ url, options });
      if (fail) throw new Error('Save failed');
      return { data: options?.body ? JSON.parse(options.body) : null };
    } },
    '@/src/lib/api': { fetchProducts: async () => ({ products: [] }) },
    '@/src/lib/offers': offers,
    '@/src/lib/utils': { formatPrice: (value) => `৳${value}` },
    '@/src/providers/ToastProvider': { useToast: () => ({ addToast: (message, type) => messages.push({ message, type }) }) },
  });
  const render = () => { stateIndex = 0; return Page(); };
  const nodes = (node) => Array.isArray(node) ? node.flatMap(nodes) : !node || typeof node !== 'object' ? [] : [node, ...nodes(node.props?.children)];
  const text = (node) => Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children) : String(node ?? '');
  const button = (label) => nodes(render()).find((node) => node.type === 'button' && text(node) === label);
  return { render, nodes, button, calls, messages, states, sale };
}

test('publishing a sale uses one complete offer request and never patches product prices', async () => {
  const app = await setup();
  await app.button('Save sale').props.onClick();
  assert.equal(app.calls.length, 1);
  assert.equal(app.calls[0].url, '/offers');
  assert.equal(app.calls[0].options.method, 'PUT');
  assert.deepEqual(JSON.parse(app.calls[0].options.body).products, [{ product_id: 'helmet', price: 80 }]);
  assert.equal(app.messages.at(-1).type, 'success');
});

test('invalid prices are rejected against the stored base price, not an older crossed-out price', async () => {
  const app = await setup({ salePrice: '110' });
  await app.button('Save sale').props.onClick();
  assert.equal(app.calls.length, 0);
  assert.equal(app.messages.at(-1).type, 'error');
});

test('a failed save retains entered values and saved sale status for retry', async () => {
  const app = await setup({ fail: true, salePrice: '75' });
  await app.button('Save sale').props.onClick();
  assert.equal(app.states[7].helmet.salePrice, '75');
  assert.equal(app.states[8], app.sale);
  assert.equal(app.states[2], false);
  assert.equal(app.messages.at(-1).type, 'error');
});

test('ending a saved sale uses the dedicated endpoint and keeps the selection', async () => {
  const app = await setup();
  await app.button('End sale now').props.onClick();
  assert.equal(app.calls.length, 1);
  assert.equal(app.calls[0].url, '/offers/end');
  assert.equal(app.states[8].enabled, false);
  assert.equal(app.states[7].helmet.salePrice, '80');
});

test('load failures show retry instead of exposing an empty save form', async () => {
  const app = await setup({ loaded: false });
  assert.equal(app.button('Save sale'), undefined);
  assert(app.button('Try again'));
});

test('Add products opens the catalog and adds multiple selected products without replacing existing prices', async () => {
  const app = await setup({ salePrice: '75' });
  await app.button('Add products').props.onClick();
  const picker = app.nodes(app.render()).find((node) => node.type === 'product-picker');
  assert(picker, 'the catalog picker must open from the visible Add products button');
  assert.deepEqual(Array.from(picker.props.selectedIds), ['helmet']);
  picker.props.onAdd([
    { id: 'helmet', name: 'Helmet', price: 100 },
    { id: 'jacket', name: 'Jacket', price: 200 },
    { id: 'gloves', name: 'Gloves', price: 300 },
  ]);
  assert.equal(app.states[7].helmet.salePrice, '75');
  assert.equal(app.states[7].jacket.salePrice, '180');
  assert.equal(app.states[7].gloves.salePrice, '270');
  picker.props.onClose();
  assert(!app.nodes(app.render()).some((node) => node.type === 'product-picker'));
});
