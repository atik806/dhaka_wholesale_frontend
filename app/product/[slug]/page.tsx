import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { fetchProductForPage } from "@/src/lib/server/data";
import { SITE_DESCRIPTION, SITE_NAME } from "@/src/lib/constants";
import { ProductPageClient } from "./ProductPageClient";
import type { Product } from "@/src/types/product";

// Product details change rarely (price/stock aside); cache the page and revalidate every 5 minutes.
export const revalidate = 300;

const SITE_URL = "https://dhakawholesale.com";

type Props = {
  params: Promise<{ slug: string }>;
};

const getProduct = cache((slug: string) => fetchProductForPage(slug));

/** Best-effort product fetch: returns null on both 404 and transient API errors. */
async function safeGetProduct(slug: string): Promise<Product | null> {
  try {
    return await getProduct(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await safeGetProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: SITE_DESCRIPTION,
    };
  }

  const description =
    product.description?.slice(0, 160) ||
    `Buy ${product.name} from ${SITE_NAME}. Cash on delivery across Bangladesh.`;
  const image = product.images?.[0];
  const url = `${SITE_URL}/product/${product.slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: image
        ? [{ url: image, alt: product.name }]
        : [{ url: "/logo.png", alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : ["/logo.png"],
    },
  };
}

function ProductJsonLd({
  slug,
  product,
}: {
  slug: string;
  product: NonNullable<Awaited<ReturnType<typeof fetchProductForPage>>>;
}) {
  const availability =
    product.stock === "out-of-stock"
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.images?.length ? product.images : undefined,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${slug}`,
      priceCurrency: "BDT",
      price: product.price,
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product: Product | null = null;
  let fetchFailed = false;
  try {
    product = await getProduct(slug);
  } catch {
    fetchFailed = true;
  }

  if (fetchFailed) {
    return <ProductPageClient initialProduct={null} />;
  }

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductJsonLd slug={slug} product={product} />
      <ProductPageClient initialProduct={product} />
    </>
  );
}
