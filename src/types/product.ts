export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
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
    colors?: { name: string; hex: string }[];
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


