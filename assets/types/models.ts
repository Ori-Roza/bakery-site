/**
 * TypeScript interfaces for application models
 */

/**
 * Product model
 */
export interface Product {
  id: number;
  title: string;
  price: number;
  discountPercentage: number;
  categoryId: number | null;
  categoryName?: string;
  image: string;
  inStock: boolean;
}

/**
 * Product database row
 */
export interface ProductDbRow {
  id: number;
  title: string;
  price: number | string;
  discount_percentage: number | string;
  category_id?: number | null;
  categoryId?: number | null;
  category?: string;
  image: string;
  in_stock: boolean;
  categories?: {
    name: string;
  };
}

/**
 * Category model
 */
export interface Category {
  category_id: number;
  category_name: string;
  image_url?: string;
}

/**
 * Category database row
 */
export interface CategoryDbRow {
  id: number;
  name: string;
  image_url?: string;
}

/**
 * Order model
 */
export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  pickup_date: string;
  pickup_time: string;
  total_price: number;
  paid: boolean;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  deleted?: boolean;
}

/**
 * Order item
 */
export interface OrderItem {
  title: string;
  qty: number;
  price: number;
  lineTotal: number;
}

/**
 * Cart item
 */
export interface CartItem {
  id: number;
  title: string;
  price: number;
  qty: number;
  lineTotal: number;
}

/**
 * Site metadata/CMS content
 */
export interface SiteMeta {
  id: number;
  about_text?: string;
  header_title?: string;
  hero_title?: string;
  hero_description?: string;
  hero_badge?: string;
  hero_chips?: string[];
  hero_image_url?: string;
  orders_accepting?: boolean;
  logo_url?: string;
  contact_bakery_phone?: string;
  contact_store_phone?: string;
  contact_whatsapp?: string;
  contact_email?: string;
  contact_address?: string;
}

/**
 * Featured product mapping
 */
export interface FeaturedProduct {
  id: number;
  site_metadata_id: number;
  product_id: number;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  key: string;
  dir: 'asc' | 'desc';
}

/**
 * Application state
 */
export interface AppState {
  products: Product[];
  cart: { [productId: string]: number };
  orders: Order[];
  session: any | null;
  role: string | null;
  editingProductId: number | null;
  sortProducts: SortConfig;
  sortOrders: SortConfig;
  categories: Category[];
  editingCategoryId: number | null;
  creatingCategoryId: number | null;
  siteMetaId: number | null;
  featuredProducts: Product[];
  featuredProductIds: number[];
  heroChips: string[];
  heroImageUrl: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  activeCategoryId: number | null;
  checkoutWhatsappPhone: string;
  pendingDeleteType: 'product' | 'category' | null;
  pendingDeleteId: number | null;
  checkoutEmail: string;
  storePhone: string;
  bakeryPhone: string;
  pendingOrderLinks: { whatsappUrl: string; emailUrl: string } | null;
  editingCategoryRowId: number | null;
  ordersAccepting: boolean;
}

/**
 * Order message parameters
 */
export interface OrderMessageParams {
  name: string;
  phone: string;
  date: string;
  time: string;
  items: OrderItem[];
  totalPrice: number;
}

/**
 * Order links
 */
export interface OrderLinks {
  whatsappUrl: string;
  emailUrl: string;
}
