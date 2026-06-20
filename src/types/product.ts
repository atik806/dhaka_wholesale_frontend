export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: "in-stock" | "low-stock" | "out-of-stock";
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
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
}
