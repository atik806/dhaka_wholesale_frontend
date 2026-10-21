import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import {
  loadComponentWithMocks,
  loadTypeScriptModule,
} from "./load-typescript.mjs";

const require = createRequire(import.meta.url);
const original = {
  badge: "Offer",
  title: "Saved title",
  subtitle: "Details",
  button_text: "Shop",
  button_link: "/shop",
  enabled: true,
};

function find(node, predicate) {
  if (Array.isArray(node)) return node.flatMap((item) => find(item, predicate));
  if (!node || typeof node !== "object") return [];
  return [
    ...(predicate(node) ? [node] : []),
    ...find(node.props?.children, predicate),
  ];
}

async function harness(fetcher) {
  const hooks = [];
  let cursor = 0;
  let effects = [];
  const dependencyChanged = (old, next) =>
    !old || next.some((value, index) => value !== old[index]);
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks))
        hooks[index] = typeof initial === "function" ? initial() : initial;
      return [
        hooks[index],
        (value) => {
          hooks[index] =
            typeof value === "function" ? value(hooks[index]) : value;
        },
      ];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { current: initial };
      return hooks[index];
    },
    useCallback(callback, dependencies) {
      const index = cursor++;
      if (
        !hooks[index] ||
        dependencyChanged(hooks[index].dependencies, dependencies)
      )
        hooks[index] = { callback, dependencies };
      return hooks[index].callback;
    },
    useEffect(callback, dependencies = []) {
      const index = cursor++;
      if (
        !hooks[index] ||
        dependencyChanged(hooks[index].dependencies, dependencies)
      ) {
        const previous = hooks[index];
        hooks[index] = { dependencies };
        effects.push(() => {
          previous?.cleanup?.();
          hooks[index].cleanup = callback();
        });
      }
    },
  };
  let polling;
  const notices = [];
  const mutations = [];
  const { default: Page } = await loadComponentWithMocks(
    new URL("../app/admin/site-settings/page.tsx", import.meta.url),
    {
      "react/jsx-runtime": require("react/jsx-runtime"),
      react,
      "lucide-react": Object.fromEntries(
        ["Save", "Eye", "EyeOff", "Megaphone", "Loader2", "ArrowRight"].map(
          (icon) => [icon, "span"],
        ),
      ),
      swr: {
        useSWRConfig: () => ({
          mutate: (...args) => {
            mutations.push(args);
            return Promise.resolve();
          },
        }),
      },
      "@/src/lib/admin-api": { adminFetcher: fetcher },
      "@/src/providers/ToastProvider": {
        useToast: () => ({ addToast: (...args) => notices.push(args) }),
      },
      "@/src/hooks/useRealtimeInvalidate": {
        useRealtimeInvalidate: (options) => {
          polling = options;
        },
      },
      "@/src/lib/promo-banner": await loadTypeScriptModule(
        new URL("../src/lib/promo-banner.ts", import.meta.url),
      ),
    },
    {
      window: { addEventListener() {}, removeEventListener() {} },
      localStorage: { setItem() {} },
      setTimeout: () => 1,
      clearTimeout() {},
      Error,
    },
  );
  const render = () => {
    cursor = 0;
    const tree = Page();
    const queued = effects;
    effects = [];
    queued.forEach((effect) => effect());
    return tree;
  };
  const settle = async () => {
    await new Promise(setImmediate);
    return render();
  };
  render();
  await settle();
  return {
    render,
    settle,
    get polling() {
      return polling;
    },
    notices,
    mutations,
  };
}

test("a background response cannot overwrite edits made while it was loading", async () => {
  let resolvePoll;
  let reads = 0;
  const page = await harness(async () => {
    if (++reads === 1) return { data: { promo_banner: original } };
    return new Promise((resolve) => {
      resolvePoll = resolve;
    });
  });
  const pending = page.polling.onInvalidate();
  const tree = page.render();
  find(tree, (node) => node.props?.id === "promo-title")[0].props.onChange({
    target: { value: "Unsaved draft" },
  });
  resolvePoll({ data: { promo_banner: original } });
  await pending;
  const updated = page.render();
  assert.equal(
    find(updated, (node) => node.props?.id === "promo-title")[0].props.value,
    "Unsaved draft",
  );
  assert.equal(page.polling.enabled, false);
});

test("a failed save retains the draft and exposes the server error", async () => {
  const page = await harness(async (_url, options) => {
    if (options?.method === "PUT") throw new Error("Database unavailable");
    return { data: { promo_banner: original } };
  });
  find(
    page.render(),
    (node) => node.props?.id === "promo-title",
  )[0].props.onChange({ target: { value: "Draft to preserve" } });
  await page.render().props.onSubmit({ preventDefault() {} });
  const tree = page.render();
  assert.equal(
    find(tree, (node) => node.props?.id === "promo-title")[0].props.value,
    "Draft to preserve",
  );
  assert.match(
    JSON.stringify(find(tree, (node) => node.props?.role === "alert")),
    /Database unavailable/,
  );
  assert.equal(page.mutations.length, 0);
});

test("saving visibility updates the homepage cache after the API succeeds", async () => {
  let saved;
  const page = await harness(async (_url, options) => {
    if (options?.method === "PUT")
      saved = JSON.parse(options.body).promo_banner;
    return { data: { promo_banner: original } };
  });
  find(
    page.render(),
    (node) => node.props?.role === "switch",
  )[0].props.onClick();
  await page.render().props.onSubmit({ preventDefault() {} });
  assert.equal(saved.enabled, false);
  assert.equal(page.mutations[0][0], "/site-settings/promo_banner");
  assert.equal(page.mutations[0][1].enabled, false);
  assert.equal(
    find(page.render(), (node) => node.props?.type === "submit")[0].props
      .disabled,
    true,
  );
});

test("a load failure prevents saving fallback values over stored settings", async () => {
  const page = await harness(async () => {
    throw new Error("Failed to load settings");
  });
  const tree = page.render();
  assert.equal(
    find(tree, (node) => node.type === "fieldset")[0].props.disabled,
    true,
  );
  assert.equal(
    find(tree, (node) => node.props?.type === "submit")[0].props.disabled,
    true,
  );
  assert.match(
    JSON.stringify(find(tree, (node) => node.props?.role === "alert")),
    /Failed to load settings/,
  );
});
