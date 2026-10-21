import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { loadComponentWithMocks } from "./load-typescript.mjs";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const runtime = require("react/jsx-runtime");

async function renderSidebar({ collapsed = false, pending = 1, open = false } = {}) {
  const { SiteLogo } = await loadComponentWithMocks(new URL("../src/components/brand/SiteLogo.tsx", import.meta.url), {
    "react/jsx-runtime": runtime,
    "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
    "next/link": "a",
    "@/src/lib/constants": { SITE_NAME: "Dhaka Wholesale" },
  });
  const icons = Object.fromEntries([
    "LayoutDashboard", "Package", "ShoppingCart", "Users", "Star", "Mail", "LogOut",
    "PanelRightClose", "PanelRightOpen", "Sun", "Moon", "X", "Bug", "Settings", "Tag",
    "ShieldCheck", "BadgePercent", "BriefcaseBusiness",
  ].map((name) => [name, "svg"]));
  let stateIndex = 0;
  const states = [collapsed, { pendingOrders: pending, unreadMessages: 0, pendingBugs: 0 }];
  const { AdminSidebar } = await loadComponentWithMocks(new URL("../src/components/admin/AdminSidebar.tsx", import.meta.url), {
    "react/jsx-runtime": runtime,
    react: { useState: () => [states[stateIndex++], () => {}], useEffect() {} },
    "next/link": "a",
    "next/navigation": { usePathname: () => "/admin", useRouter: () => ({ push() {} }) },
    "lucide-react": icons,
    "@/src/providers/ThemeProvider": { useTheme: () => ({ theme: "dark", toggleTheme() {} }) },
    "@/src/lib/admin-api": { fetchDashboard: async () => ({}) },
    "@/src/lib/constants": { API_BASE: "/api" },
    "@/src/components/brand/SiteLogo": { SiteLogo },
  });
  return renderToStaticMarkup(AdminSidebar({ open, onClose() {} }));
}

test("expanded admin branding renders one name beside the logo without a duplicate wordmark", async () => {
  const html = await renderSidebar();
  assert.equal((html.match(/src="\/logo.png"/g) ?? []).length, 1);
  assert.equal((html.match(/>Dhaka Wholesale</g) ?? []).length, 1);
  assert.doesNotMatch(html, />DHAKA<|>WHOLESALE</);
  assert.match(html, /aria-label="1 pending items"/);
  assert.match(html, /aria-label="Collapse sidebar"/);
});

test("collapsed sidebar displays only the logo and an accessible expand control", async () => {
  const html = await renderSidebar({ collapsed: true, pending: 140 });
  assert.match(html, /src="\/logo.png"/);
  assert.doesNotMatch(html, />Dhaka Wholesale<|>DHAKA<|>WHOLESALE<|>Admin</);
  assert.match(html, /aria-label="Expand sidebar"/);
});

test("mobile menu keeps its close control and caps large pending counts", async () => {
  const html = await renderSidebar({ pending: 140, open: true });
  assert.match(html, /aria-label="Close menu"/);
  assert.match(html, /aria-label="140 pending items"/);
  assert.match(html, />99\+</);
});
