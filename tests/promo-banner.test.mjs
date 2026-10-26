import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import {
  loadComponentWithMocks,
  loadTypeScriptModule,
} from "./load-typescript.mjs";

const require = createRequire(import.meta.url);
const settings = {
  badge: "Warehouse special",
  title: "Our custom promotion",
  subtitle: "Custom description",
  button_text: "Browse products",
  button_link: "/shop",
  enabled: true,
};

async function loadBanner(promo) {
  return loadComponentWithMocks(
    new URL("../src/components/home/PromoBanner.tsx", import.meta.url),
    {
      "react/jsx-runtime": require("react/jsx-runtime"),
      react: {
        useState: () => [Date.parse("2026-10-21T10:00:00Z"), () => {}],
        useEffect: () => {},
      },
      swr: {
        __esModule: true,
        default: () => ({
          data: {
            title: "Flash sale overrides",
            enabled: true,
            starts_at: "2026-10-21T00:00:00Z",
            ends_at: "2026-10-22T00:00:00Z",
          },
        }),
      },
      "lucide-react": { ArrowRight: "span", Sparkles: "span" },
      "next/link": "a",
      "@/src/components/ui/Button": { buttonClasses: () => "button" },
      "@/src/hooks/useApi": { usePromoBanner: () => ({ data: promo }) },
      "@/src/lib/constants": { OFFER_POLL_MS: 60000 },
      "@/src/lib/api": { fetchFlashSale: async () => null },
      "@/src/lib/offers": await loadTypeScriptModule(
        new URL("../src/lib/offers.ts", import.meta.url),
      ),
      "@/src/lib/utils": { safePromoLink: (value) => value },
      "@/src/lib/promo-banner": await loadTypeScriptModule(
        new URL("../src/lib/promo-banner.ts", import.meta.url),
      ),
    },
  );
}

test("a configured flash sale cannot replace saved promo banner content", async () => {
  const { PromoBanner } = await loadBanner({ success: true, data: settings });
  const tree = JSON.stringify(PromoBanner({}));
  assert.match(tree, /Our custom promotion/);
  assert.doesNotMatch(tree, /Flash sale overrides/);
});

test("turning off the promo banner hides it even when a flash sale exists", async () => {
  const { PromoBanner } = await loadBanner({
    data: { ...settings, enabled: false },
  });
  assert.equal(PromoBanner({}), null);
});
