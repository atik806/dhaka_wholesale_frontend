import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { loadTypeScriptModule } from "./load-typescript.mjs";

const { THEME_INIT_SCRIPT, parseTheme, readStoredTheme, saveTheme } = await loadTypeScriptModule(new URL("../src/lib/theme.ts", import.meta.url));

function browser(saved, { blocked = false, initiallyDark = false } = {}) {
  let dark = initiallyDark;
  const values = new Map(saved === undefined ? [] : [["theme", saved]]);
  const storage = {
    getItem(key) {
      if (blocked) throw new Error("Storage unavailable");
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (blocked) throw new Error("Storage unavailable");
      values.set(key, value);
    },
  };
  const document = { documentElement: { classList: {
    toggle(name, value) { assert.equal(name, "dark"); dark = value; },
    contains() { return dark; },
  } } };
  return { storage, document, values, isDark: () => dark };
}

test("first visit is light even when the device prefers dark", () => {
  const page = browser(undefined, { initiallyDark: true });
  runInNewContext(THEME_INIT_SCRIPT, {
    document: page.document,
    localStorage: page.storage,
    matchMedia() { throw new Error("Device preference must not choose the theme"); },
  });
  assert.equal(page.isDark(), false);
  assert.equal(page.values.has("theme"), false);
});

test("saved dark and light are restored before hydration without overwriting storage", () => {
  for (const saved of ["dark", "light"]) {
    const page = browser(saved);
    runInNewContext(THEME_INIT_SCRIPT, { document: page.document, localStorage: page.storage });
    assert.equal(page.isDark(), saved === "dark");
    assert.equal(page.values.get("theme"), saved);
  }
});

test("invalid, missing, and blocked storage safely use light", () => {
  for (const saved of [undefined, "", "system", "DARK", "<script>"]) {
    const page = browser(saved, { initiallyDark: true });
    runInNewContext(THEME_INIT_SCRIPT, { document: page.document, localStorage: page.storage });
    assert.equal(page.isDark(), false);
  }
  const page = browser("dark", { blocked: true, initiallyDark: true });
  assert.doesNotThrow(() => runInNewContext(THEME_INIT_SCRIPT, { document: page.document, localStorage: page.storage }));
  assert.equal(page.isDark(), false);
});

test("explicit changes persist and are restored on the next page", (t) => {
  const page = browser();
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  t.after(() => { globalThis.window = previousWindow; globalThis.document = previousDocument; });
  globalThis.window = { localStorage: page.storage };
  globalThis.document = page.document;

  for (const theme of ["dark", "light"]) {
    saveTheme(theme);
    assert.equal(page.isDark(), theme === "dark");
    assert.equal(readStoredTheme(), theme);
    const nextPage = browser(page.values.get("theme"));
    runInNewContext(THEME_INIT_SCRIPT, { document: nextPage.document, localStorage: nextPage.storage });
    assert.equal(nextPage.isDark(), theme === "dark");
  }
});

test("the theme switch still works when saving is blocked", (t) => {
  const page = browser(undefined, { blocked: true });
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  t.after(() => { globalThis.window = previousWindow; globalThis.document = previousDocument; });
  globalThis.window = { localStorage: page.storage };
  globalThis.document = page.document;
  assert.equal(readStoredTheme(), "light");
  assert.doesNotThrow(() => saveTheme("dark"));
  assert.equal(page.isDark(), true);
  assert.doesNotThrow(() => saveTheme("light"));
  assert.equal(page.isDark(), false);
});

test("only an explicit dark preference selects dark mode", () => {
  assert.equal(parseTheme("dark"), "dark");
  for (const value of ["light", null, "system", "", "DARK"]) assert.equal(parseTheme(value), "light");
});
