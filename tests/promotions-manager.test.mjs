import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { loadComponentWithMocks, loadTypeScriptModule } from './load-typescript.mjs';

const require = createRequire(import.meta.url);
const offers = await loadTypeScriptModule(new URL('../src/lib/offers.ts', import.meta.url));
const a = '00000000-0000-4000-8000-000000000001';
const b = '00000000-0000-4000-8000-000000000002';
const window = { enabled: true, starts_at: '2099-01-01T00:00:00Z', ends_at: '2099-01-02T00:00:00Z' };

async function setup(kind, { config = { combos: [], coupons: [] }, failure = false } = {}) {
  const states = [];
  let index = 0;
  const calls = [];
  const messages = [];
  let reloads = 0;
  const icons = Object.fromEntries(['Edit', 'Loader2', 'PackagePlus', 'Plus', 'TicketPercent', 'Trash2', 'X'].map((name) => [name, 'span']));
  const { PromotionsManager } = await loadComponentWithMocks(new URL('../src/components/admin/PromotionsManager.tsx', import.meta.url), {
    'react/jsx-runtime': require('react/jsx-runtime'),
    react: {
      useState(initial) { const slot = index++; if (!(slot in states)) states[slot] = typeof initial === 'function' ? initial() : initial; return [states[slot], (value) => { states[slot] = typeof value === 'function' ? value(states[slot]) : value; }]; },
      useEffect() {}, useRef: () => ({ current: null }),
    },
    'lucide-react': icons,
    '@/src/components/ui/Button': { Button: 'button' },
    './OfferProductPicker': { OfferProductPicker: 'product-picker' },
    './ConfirmDialog': { useConfirm: () => ({ confirm: async () => true, dialog: null }) },
    '@/src/lib/admin-api': { adminFetcher: async (url, options) => { calls.push({ url, options }); if (failure) throw new Error('Save rejected'); return { data: {} }; } },
    '@/src/lib/api': { fetchProducts: async () => ({ products: [] }) },
    '@/src/lib/offers': offers,
    '@/src/lib/utils': { formatPrice: (value) => `৳${value}` },
    '@/src/providers/ToastProvider': { useToast: () => ({ addToast: (message, type) => messages.push({ message, type }) }) },
  }, { crypto: { randomUUID: () => a }, Error });
  const render = () => { index = 0; return PromotionsManager({ kind, config, onUpdate: async () => { reloads++; } }); };
  const nodes = (node) => Array.isArray(node) ? node.flatMap(nodes) : node && typeof node === 'object' ? [node, ...nodes(node.props?.children)] : [];
  const text = (node) => Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children) : String(node ?? '');
  const button = (label) => nodes(render()).find((node) => node.type === 'button' && (text(node) === label || node.props['aria-label'] === label));
  const field = (label) => { const node = nodes(render()).find((node) => node.type === 'label' && text(node).startsWith(label)); return nodes(node).find((child) => child.type === 'input' || child.type === 'select'); };
  const submit = async () => { const form = nodes(render()).find((node) => node.type === 'form'); await form.props.onSubmit({ preventDefault() {} }); };
  return { render, nodes, button, field, submit, states, calls, messages, reloads: () => reloads };
}

test('a combo can be created by choosing catalog products and setting a bundle price', async () => {
  const app = await setup('combos');
  app.button('Add combo deal').props.onClick();
  app.field('Combo name').props.onChange({ target: { value: 'Riding kit' } });
  app.button('Add products').props.onClick();
  const picker = app.nodes(app.render()).find((node) => node.type === 'product-picker');
  assert.equal(picker.props.maxProducts, 20);
  picker.props.onAdd([{ id: a, name: 'Helmet', price: 100 }, { id: b, name: 'Gloves', price: 50 }]);
  picker.props.onClose();
  app.field('Combo price').props.onChange({ target: { value: '120' } });
  await app.submit();
  assert.equal(app.calls[0].url, '/offers/combos');
  const body = JSON.parse(app.calls[0].options.body);
  assert.equal(body.title, 'Riding kit');
  assert.equal(body.price, 120);
  assert.deepEqual(body.products, [{ product_id: a, quantity: 1 }, { product_id: b, quantity: 1 }]);
  assert.equal(app.reloads(), 1);
  assert.equal(app.states[0], null);
});

test('a coupon can be created with code, discount type, minimum spend and cap', async () => {
  const app = await setup('coupons');
  app.button('Add coupon').props.onClick();
  app.field('Coupon code').props.onChange({ target: { value: 'welcome10' } });
  app.field('Discount type').props.onChange({ target: { value: 'fixed' } });
  app.field('Discount value').props.onChange({ target: { value: '100' } });
  app.field('Minimum spend').props.onChange({ target: { value: '500' } });
  app.field('Discount cap').props.onChange({ target: { value: '80' } });
  await app.submit();
  assert.equal(app.calls[0].url, '/offers/coupons');
  const body = JSON.parse(app.calls[0].options.body);
  assert.equal(body.code, 'WELCOME10'); assert.equal(body.type, 'fixed');
  assert.equal(body.minimum_spend, 500); assert.equal(body.maximum_discount, 80);
});

test('existing coupon codes can be edited, paused and deleted', async () => {
  const coupon = { ...window, id: b, code: 'SAVE10', type: 'percentage', value: 10, minimum_spend: 0, maximum_discount: null };
  const app = await setup('coupons', { config: { combos: [], coupons: [coupon] } });
  app.button('Edit').props.onClick();
  assert.equal(app.field('Coupon code').props.readOnly, true);
  app.field('Discount value').props.onChange({ target: { value: '20' } });
  await app.submit();
  assert.equal(JSON.parse(app.calls[0].options.body).value, 20);
  await app.button('Pause').props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(JSON.parse(app.calls[1].options.body).enabled, false);
  await app.button('Delete SAVE10').props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(app.calls[2].url, `/offers/coupons/${b}`);
  assert.equal(app.calls[2].options.method, 'DELETE');
});

test('failed saves retain the editor and entered data for correction', async () => {
  const app = await setup('coupons', { failure: true });
  app.button('Add coupon').props.onClick();
  app.field('Coupon code').props.onChange({ target: { value: 'SAVE10' } });
  await app.submit();
  assert.equal(app.states[1].code, 'SAVE10');
  assert.equal(app.states[6], 'Save rejected');
  assert.equal(app.states[5], false);
  assert.equal(app.reloads(), 0);
});

test('combos with fewer than two products cannot be saved', async () => {
  const app = await setup('combos');
  app.button('Add combo deal').props.onClick();
  await app.submit();
  assert.equal(app.calls.length, 0);
  assert.match(app.states[6], /two different products/);
});
