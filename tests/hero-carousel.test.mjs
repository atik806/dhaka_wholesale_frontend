import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { loadComponentWithMocks } from "./load-typescript.mjs";

const require = createRequire(import.meta.url);
const { getImageProps } = require("next/image");

test("every carousel state uses image props accepted by the installed Next.js", async () => {
  let activeSlide = 0;
  const Image = () => null;
  const { HeroSection } = await loadComponentWithMocks(new URL("../src/components/home/HeroSection.tsx", import.meta.url), {
    "react/jsx-runtime": require("react/jsx-runtime"),
    react: {
      useState: () => [activeSlide, () => {}],
      useEffect: () => {},
      useCallback: (callback) => callback,
    },
    "framer-motion": { motion: { div: "div", p: "p", h1: "h1", li: "li" }, AnimatePresence: "div" },
    "lucide-react": { ChevronLeft: "span", ChevronRight: "span", BadgeCheck: "span", Truck: "span", Wallet: "span" },
    "next/image": Image,
    "next/link": "a",
    "@/src/components/ui/Button": { buttonClasses: () => "button" },
    "@/src/lib/utils": { IMAGE_BLUR_PLACEHOLDER: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///w==" },
  });

  const imageProps = (node) => {
    if (Array.isArray(node)) return node.flatMap(imageProps);
    if (!node || typeof node !== "object") return [];
    if (node.type === Image) return [node.props];
    return imageProps(node.props?.children);
  };
  const numberOfSlides = imageProps(HeroSection()).length;
  assert(numberOfSlides > 1, "the regression must cover a rotating carousel");

  for (activeSlide = 0; activeSlide < numberOfSlides; activeSlide++) {
    const images = imageProps(HeroSection());
    assert.equal(images.length, numberOfSlides);
    for (const props of images) {
      assert.doesNotThrow(
        () => getImageProps(props),
        `Invalid Next image props for ${props.src} while slide ${activeSlide + 1} is active`,
      );
    }
    const firstImage = getImageProps(images[0]).props;
    assert.notEqual(firstImage.loading, "lazy", "the initial hero must never become lazy during rotation");
  }
});
