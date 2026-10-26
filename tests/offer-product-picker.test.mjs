import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { loadComponentWithMocks } from './load-typescript.mjs';

const require = createRequire(import.meta.url);
const products = Array.from({ length: 45 }, (_, index) => ({ id: `product-${index}`, name: `Product ${index}`, price: 100 + index, category: 'Accessories', images: [] }));

async function setup({ selectedIds = [], error = null } = {}) {
  const states = ['', '', 1, {}];
  let index = 0;
  let activeKey;
  let fetcher;
  let closed = false;
  const added = [];
  const requests = [];
  const icons = Object.fromEntries(['Check', 'ChevronLeft', 'ChevronRight', 'Loader2', 'Package', 'Search', 'X'].map((name) => [name, 'span']));
  const { OfferProductPicker } = await loadComponentWithMocks(new URL('../src/components/admin/OfferProductPicker.tsx', import.meta.url), {
    'react/jsx-runtime': require('react/jsx-runtime'),
    react: {
      useState: () => {
        const current = index++;
        return [states[current], (value) => { states[current] = typeof value === 'function' ? value(states[current]) : value; }];
      },
      useEffect() {}, useRef: () => ({ current: null }), useId: () => 'picker-title',
    },
    '@/src/components/ui/Image': 'img',
    'lucide-react': icons,
    swr: (key, fn) => {
      activeKey = key; fetcher = fn;
      const [, page] = key;
      return { data: { products: products.slice((page - 1) * 20, page * 20), total: 45, totalPages: 3 }, isLoading: false, error, mutate: () => {} };
    },
    '@/src/components/ui/Button': { Button: 'button' },
    '@/src/lib/api': { fetchProducts: async (params) => { requests.push(params); return { products: [] }; } },
    '@/src/lib/utils': { formatPrice: (value) => `৳${value}`, safeImage: () => '/placeholder.svg' },
  });
  const render = () => { index = 0; return OfferProductPicker({ selectedIds, onAdd: (values) => added.push(...values), onClose: () => { closed = true; } }); };
  const nodes = (node) => Array.isArray(node) ? node.flatMap(nodes) : node && typeof node === 'object' ? [node, ...nodes(node.props?.children)] : [];
  const text = (node) => Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children) : String(node ?? '');
  const button = (label) => nodes(render()).find((node) => node.type === 'button' && text(node) === label);
  const checkbox = (name) => nodes(render()).find((node) => node.type === 'input' && node.props['aria-label'] === `Select ${name}`);
  const fetch = async () => { render(); await fetcher(activeKey); };
  return { render, nodes, button, checkbox, fetch, requests, added, states, isClosed: () => closed };
}

test('opening the picker lists catalog products without requiring a search', async () => {
  const app = await setup();
  assert.equal(app.nodes(app.render()).filter((node) => node.type === 'input' && node.props.type === 'checkbox').length, 20);
  await app.fetch();
  assert.equal(app.requests[0].search, undefined);
  assert.equal(app.requests[0].page, 1);
  assert.equal(app.requests[0].limit, 20);
  assert.equal(app.button('Previous').props.disabled, true);
});

test('all catalog pages are reachable and selections are retained across pages', async () => {
  const app = await setup();
  app.checkbox('Product 0').props.onChange();
  app.button('Next').props.onClick();
  assert(app.checkbox('Product 20'));
  app.checkbox('Product 20').props.onChange();
  app.button('Next').props.onClick();
  assert(app.checkbox('Product 44'));
  assert.equal(app.button('Next').props.disabled, true);
  await app.fetch();
  assert.equal(app.requests.at(-1).page, 3);
  app.button('Add selected products (2)').props.onClick();
  assert.deepEqual(app.added.map((product) => product.id), ['product-0', 'product-20']);
  assert.equal(app.isClosed(), true);
});

test('products already in the sale are checked and cannot be added twice', async () => {
  const app = await setup({ selectedIds: ['product-0'] });
  assert.equal(app.checkbox('Product 0').props.checked, true);
  assert.equal(app.checkbox('Product 0').props.disabled, true);
  app.checkbox('Product 0').props.onChange();
  assert.equal(app.button('Add selected products (0)').props.disabled, true);
});

test('cancel discards pending selections', async () => {
  const app = await setup();
  app.checkbox('Product 0').props.onChange();
  app.button('Cancel').props.onClick();
  assert.equal(app.isClosed(), true);
  assert.deepEqual(app.added, []);
});

test('catalog failures offer retry instead of an empty product list', async () => {
  const app = await setup({ error: new Error('Offline') });
  assert(app.button('Try again'));
  assert.equal(app.nodes(app.render()).filter((node) => node.type === 'input' && node.props.type === 'checkbox').length, 0);
});
