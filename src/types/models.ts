/**
 * TypeScript interfaces for application models
 */

/**
 * Product model
 */
export interface Product {
  id: number | string;
  title: string;
  price: number;
  discountPercentage: number;
  categoryId: number | string | null;
  categoryName?: string;
  image: string;
  inStock: boolean;
  [key: string]: any; // Allow dynamic property access for sorting
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
  id?: number;
  category_id: number | string;
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
  customer_name?: string;
  customer_phone?: string;
  customer?: {
    name: string;
    phone: string;
  };
  pickup_date: string;
  pickup_time: string;
  total_price?: number;
  total?: number;
  paid: boolean;
  notes?: string;
  user_notes?: string;
  order_number?: number | string;
  items: OrderItem[];
  order_items?: OrderItemRelation[];
  created_at: string;
  deleted?: boolean;
  status?: string;
  [key: string]: any; // Allow dynamic property access for sorting
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
 * Order item relation (orders <-> products)
 */
export interface OrderItemRelation {
  order_id: string;
  product_id: number;
  qty: number;
  products?: Product | ProductDbRow;
}

/**
 * Cart item
 */
export interface CartItem {
  id: number | string;
  title: string;
  price: number;
  discountPercentage?: number;
  discountedPrice?: number;
  image?: string;
  qty: number;
  lineTotal: number;
}

/**
 * Cart totals
 */
export interface CartTotals {
  items: CartItem[];
  totalQty: number;
  totalPrice: number;
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
  editingProductId: string | null;
  sortProducts: SortConfig;
  sortOrders: SortConfig;
  categories: Category[];
  editingCategoryId: string | null;
  creatingCategoryId: string | null;
  siteMetaId: number | null;
  featuredProducts: Product[];
  featuredProductIds: number[];
  heroChips: string[];
  heroImageUrl: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  activeCategoryId: string | null;
  checkoutWhatsappPhone: string;
  pendingDeleteType: 'product' | 'category' | null;
  pendingDeleteId: string | number | null;
  checkoutEmail: string;
  storePhone: string;
  bakeryPhone: string;
  pendingOrderLinks: { whatsappUrl: string; emailUrl: string } | null;
  editingCategoryRowId: string | null;
  ordersAccepting: boolean;
  activeOrderFilters: OrderFilter[];
  isFilterModalOpen: boolean;
  searchOrdersText: string;
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
  userNotes?: string;
}

/**
 * Order links
 */
export interface OrderLinks {
  whatsappUrl: string;
  emailUrl: string;
}

/**
 * Order filter
 */
export interface OrderFilter {
  field: string;
  operator: string;
  value: any;
}

/**
 * Filter field definition
 */
export interface FilterFieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  operators: Array<{ value: string; label: string }>;
}
