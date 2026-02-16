/**
 * Application state management
 */

import { Store } from './Store';
import type { AppState } from '../types/models';
import { DEFAULT_WHATSAPP_PHONE, DEFAULT_ORDER_EMAIL, CONTACT_PHONE } from '../config/constants';

/**
 * Initial application state
 */
const initialState: AppState = {
  products: [],
  cart: {},
  orders: [],
  session: null,
  role: null,
  editingProductId: null,
  sortProducts: { key: "title", dir: "asc" },
  sortOrders: { key: "created_at", dir: "desc" },
  categories: [],
  editingCategoryId: null,
  creatingCategoryId: null,
  siteMetaId: null,
  featuredProducts: [],
  featuredProductIds: [],
  heroChips: [],
  heroImageUrl: "",
  heroBadge: "",
  heroTitle: "",
  heroDescription: "",
  activeCategoryId: null,
  checkoutWhatsappPhone: DEFAULT_WHATSAPP_PHONE,
  pendingDeleteType: null,
  pendingDeleteId: null,
  checkoutEmail: DEFAULT_ORDER_EMAIL,
  storePhone: CONTACT_PHONE,
  bakeryPhone: CONTACT_PHONE,
  pendingOrderLinks: null,
  editingCategoryRowId: null,
  ordersAccepting: true,
  activeOrderFilters: [],
  isFilterModalOpen: false,
  searchOrdersText: '',
  statsRange: "this_month",
  statsSeries: "revenue",
  statsRangeStart: "",
  statsRangeEnd: "",
  adminView: "manage",
};

/**
 * Global application store
 */
export const store = new Store<AppState>(initialState);

/**
 * Convenience getter for direct state access (use sparingly)
 */
export const getState = () => store.getState();

/**
 * Export store instance as default
 */
export default store;
