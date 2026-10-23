export interface ProductColor {
  name: string;
  hex: string;
  /** Product photo showing this colour, one of the product's images. */
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  /** The category's URL slug, when the API includes it. */
  categorySlug?: string;
  price: number;
  /** Stored price before any timed flash-sale discount. */
  basePrice?: number;
  baseOriginalPrice?: number | null;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: "in-stock" | "low-stock" | "out-of-stock";
  /** Precise units in stock when the API exposes it; undefined for list cards that omit it. */
  stockQuantity?: number;
  description: string;
  tags: string[];
  variants?: {
    sizes?: string[];
    colors?: ProductColor[];
  };
  isNew?: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  description: string;
  parentId: string | null;
  children?: Category[];
}


