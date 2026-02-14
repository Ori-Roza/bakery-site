/**
 * State mutation actions
 * All state changes should go through these actions for consistency
 */

import { store } from './state';
import type { Product, Category, Order, SortConfig, OrderLinks } from '../types/models';

/**
 * Product actions
 */
export const setProducts = (products: Product[]): void => {
  store.setState({ products });
};

export const addProduct = (product: Product): void => {
  const products = [...store.getState().products, product];
  store.setState({ products });
};

export const updateProduct = (id: number, updates: Partial<Product>): void => {
  const products = store.getState().products.map(p => 
    p.id === id ? { ...p, ...updates } : p
  );
  store.setState({ products });
};

export const removeProduct = (id: number): void => {
  const products = store.getState().products.filter(p => p.id !== id);
  store.setState({ products });
};

/**
 * Cart actions
 */
export const setCart = (cart: { [productId: string]: number }): void => {
  store.setState({ cart });
};

export const addToCart = (productId: number | string, quantity: number = 1): void => {
  const key = String(productId);
  const cart = { ...store.getState().cart };
  cart[key] = (cart[key] || 0) + quantity;
  store.setState({ cart });
};

export const updateCartQuantity = (productId: number | string, quantity: number): void => {
  const key = String(productId);
  const cart = { ...store.getState().cart };
  if (quantity <= 0) {
    delete cart[key];
  } else {
    cart[key] = quantity;
  }
  store.setState({ cart });
};

export const clearCart = (): void => {
  store.setState({ cart: {} });
};

/**
 * Category actions
 */
export const setCategories = (categories: Category[]): void => {
  store.setState({ categories });
};

export const addCategory = (category: Category): void => {
  const categories = [...store.getState().categories, category];
  store.setState({ categories });
};

export const updateCategory = (id: number, updates: Partial<Category>): void => {
  const categories = store.getState().categories.map(c => 
    c.category_id === id ? { ...c, ...updates } : c
  );
  store.setState({ categories });
};

export const removeCategory = (id: number): void => {
  const categories = store.getState().categories.filter(c => c.category_id !== id);
  store.setState({ categories });
};

export const setActiveCategory = (categoryId: number | null): void => {
  store.setState({ activeCategoryId: categoryId !== null ? String(categoryId) : null });
};

/**
 * Order actions
 */
export const setOrders = (orders: Order[]): void => {
  store.setState({ orders });
};

export const addOrder = (order: Order): void => {
  const orders = [...store.getState().orders, order];
  store.setState({ orders });
};

export const updateOrder = (id: number, updates: Partial<Order>): void => {
  const orders = store.getState().orders.map(o => 
    o.id === id ? { ...o, ...updates } : o
  );
  store.setState({ orders });
};

/**
 * Auth actions
 */
export const setSession = (session: any): void => {
  store.setState({ session });
};

export const setRole = (role: string | null): void => {
  store.setState({ role });
};

export const logout = (): void => {
  store.setState({ session: null, role: null });
};

/**
 * UI state actions
 */
export const setEditingProductId = (id: number | null): void => {
  store.setState({ editingProductId: id !== null ? String(id) : null });
};

export const setEditingCategoryId = (id: number | null): void => {
  store.setState({ editingCategoryId: id !== null ? String(id) : null });
};

export const setCreatingCategoryId = (id: number | null): void => {
  store.setState({ creatingCategoryId: id !== null ? String(id) : null });
};

export const setEditingCategoryRowId = (id: number | null): void => {
  store.setState({ editingCategoryRowId: id !== null ? String(id) : null });
};

export const setSortProducts = (sortConfig: SortConfig): void => {
  store.setState({ sortProducts: sortConfig });
};

export const setSortOrders = (sortConfig: SortConfig): void => {
  store.setState({ sortOrders: sortConfig });
};

export const setPendingDelete = (type: 'product' | 'category' | null, id: number | null): void => {
  store.setState({ pendingDeleteType: type, pendingDeleteId: id });
};

export const setPendingOrderLinks = (links: OrderLinks | null): void => {
  store.setState({ pendingOrderLinks: links });
};

/**
 * Site metadata actions
 */
export const setSiteMetaId = (id: number | null): void => {
  store.setState({ siteMetaId: id });
};

export const setFeaturedProducts = (products: Product[]): void => {
  store.setState({ featuredProducts: products });
};

export const setFeaturedProductIds = (ids: number[]): void => {
  store.setState({ featuredProductIds: ids });
};

export const setHeroContent = (content: {
  heroTitle?: string;
  heroDescription?: string;
  heroBadge?: string;
  heroChips?: string[];
  heroImageUrl?: string;
}): void => {
  store.setState(content);
};

export const setContactInfo = (info: {
  bakeryPhone?: string;
  storePhone?: string;
  checkoutWhatsappPhone?: string;
  checkoutEmail?: string;
}): void => {
  store.setState(info);
};

export const setOrdersAccepting = (accepting: boolean): void => {
  store.setState({ ordersAccepting: accepting });
};
