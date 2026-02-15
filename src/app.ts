import { formatCurrency, formatDateForInput } from './utils/formatters';
import {
  buildCustomRange,
  buildDailySeries,
  computeAverageOrders,
  computeKpis,
  computeMonthlySeasonality,
  computeOrderHourDistribution,
  computePickupHourDistribution,
  computePopularProducts,
  filterOrdersByRange,
  getDateRange,
  getOrderTotal,
  getPreviousDateRange,
  type StatsRangeKey,
  type StatsSeriesKey,
} from './utils/statistics';
import { 
  getNextBusinessDateTime,
  getPickupDateTime 
} from './utils/business-hours';
import {
  CONTACT_PHONE,
  CONTACT_EMAIL,
  DEFAULT_WHATSAPP_PHONE,
  DEFAULT_ORDER_EMAIL,
  TECH_SUPPORT_MESSAGE,
  CUSTOMER_NAME_REQUIRED,
  CUSTOMER_PHONE_REQUIRED,
  DEFAULT_ABOUT
} from './config/constants';
import type { AppState, OrderMessageParams, OrderFilter } from './types/models';
import { store, getState } from './store/state';
import * as actions from './store/actions';
import { ProductMapper } from './models/ProductMapper';
import { CategoryMapper } from './models/CategoryMapper';
import * as OrderFilterService from './services/OrderFilterService';
import * as OrderExportService from './services/OrderExportService';
import { createSupabaseClient } from './services/SupabaseClient';
import { StorageService } from './services/StorageService';
import { ProductService } from './services/ProductService';
import { CartManager } from './business/CartManager';
import { CheckoutValidator } from './business/CheckoutValidator';
// import { CategoryResolver } from './business/CategoryResolver'; // Unused - for future use
import { OrderBuilder } from './business/OrderBuilder';
import { CategoryUI } from './ui/CategoryUI';
// import { CartUI } from './ui/CartUI'; // Unused - for future use
// import { ProductUI } from './ui/ProductUI'; // Unused - for future use
import { AdminUI } from './ui/AdminUI';
// import { ModalUI } from './ui/ModalUI'; // Unused - for future use
// import { CartHandlers } from './handlers/CartHandlers'; // Unused - for future use
// import { CheckoutHandlers } from './handlers/CheckoutHandlers'; // Unused - for future use

// Extend Window interface for custom properties
declare global {
  interface Window {
    lucide?: { createIcons: () => void };
    __DISABLE_AUTO_INIT__?: boolean;
  }
}

let supabaseClient:any = null;
let storageService: StorageService | null = null;
// @ts-expect-error - Declared for future use
let _productService: ProductService | null = null; // Declared for future use

// Use store-managed state (backward compatible access pattern)
// Direct mutations still work, but actions are preferred for new code
const state = new Proxy({} as AppState, {
  get(_target, prop) {
    return getState()[prop as keyof AppState];
  },
  set(_target, prop, value) {
    store.setState({ [prop]: value } as any);
    return true;
  }
});

const categoryTrackEl = document.getElementById("category-track");
const productsScrollEl = document.getElementById("products-scroll");
const productSearchInput = document.getElementById("product-search") as HTMLInputElement | null;
const cartDrawer = document.getElementById("cart-drawer") as HTMLElement | null;
const cartItemsEl = document.getElementById("cart-items") as HTMLElement | null;
const cartTotalEl = document.getElementById("cart-total") as HTMLElement | null;
const floatingCart = document.getElementById("floating-cart") as HTMLElement | null;
const floatingCount = document.getElementById("floating-count") as HTMLElement | null;
const floatingTotal = document.getElementById("floating-total") as HTMLElement | null;
const overlay = document.getElementById("overlay") as HTMLElement | null;
const adminSection = document.getElementById("admin") as HTMLElement | null;
const adminProductsEl = document.getElementById("admin-products") as HTMLElement | null;
const adminOrdersEl = document.getElementById("admin-orders") as HTMLElement | null;
const adminAuthEl = document.getElementById("admin-auth") as HTMLElement | null;
const adminPanelEl = document.getElementById("admin-panel") as HTMLElement | null;
const adminAuthErrorEl = document.getElementById("admin-auth-error") as HTMLElement | null;
const adminGreetingEl = document.getElementById("admin-greeting") as HTMLElement | null;
const adminLogoutButton = document.getElementById("admin-logout") as HTMLElement | null;
const adminNewOrderButton = document.getElementById("admin-new-order") as HTMLElement | null;
const adminProductsTable = document.getElementById("admin-products-table") as HTMLElement | null;
const adminOrdersTable = document.getElementById("admin-orders-table") as HTMLElement | null;
const adminOrdersSearchInput = document.getElementById("admin-orders-search") as HTMLInputElement | null;
const adminOrdersFilterBtn = document.getElementById("admin-orders-filter-btn") as HTMLElement | null;
const adminOrdersClearFiltersBtn = document.getElementById("admin-orders-clear-filters-btn") as HTMLElement | null;
const adminOrdersExportCsv = document.getElementById("admin-orders-export-csv") as HTMLElement | null;
const adminOrdersExportXlsx = document.getElementById("admin-orders-export-xlsx") as HTMLElement | null;
const adminViewStatsBtn = document.getElementById("admin-view-stats") as HTMLElement | null;
const adminViewManageBtn = document.getElementById("admin-view-manage") as HTMLElement | null;
const adminStatsView = document.getElementById("admin-stats-view") as HTMLElement | null;
const adminManageView = document.getElementById("admin-manage-view") as HTMLElement | null;
const statsRangeSelect = document.getElementById("stats-range") as HTMLSelectElement | null;
const statsRangeStartInput = document.getElementById("stats-range-start") as HTMLInputElement | null;
const statsRangeEndInput = document.getElementById("stats-range-end") as HTMLInputElement | null;
const statsOrdersValue = document.getElementById("stats-orders-value") as HTMLElement | null;
const statsRevenueValue = document.getElementById("stats-revenue-value") as HTMLElement | null;
const statsConversionValue = document.getElementById("stats-conversion-value") as HTMLElement | null;
const statsAovValue = document.getElementById("stats-aov-value") as HTMLElement | null;
const statsOrdersDelta = document.getElementById("stats-orders-delta") as HTMLElement | null;
const statsRevenueDelta = document.getElementById("stats-revenue-delta") as HTMLElement | null;
const statsAovDelta = document.getElementById("stats-aov-delta") as HTMLElement | null;
const statsTrendChart = document.getElementById("stats-trend-chart") as HTMLElement | null;
const statsTrendLegend = document.getElementById("stats-trend-legend") as HTMLElement | null;
const statsPopularList = document.getElementById("stats-popular-list") as HTMLElement | null;
const statsPickupChart = document.getElementById("stats-pickup-chart") as HTMLElement | null;
const statsOrderHourChart = document.getElementById("stats-order-hour-chart") as HTMLElement | null;
const statsAvgDay = document.getElementById("stats-avg-day") as HTMLElement | null;
const statsAvgWeek = document.getElementById("stats-avg-week") as HTMLElement | null;
const statsSeasonalityChart = document.getElementById("stats-seasonality-chart") as HTMLElement | null;
const statsLatestOrders = document.getElementById("stats-latest-orders") as HTMLElement | null;
const statsSeriesButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-stats-series]")
);
const adminOrdersFilterModal = document.getElementById("admin-orders-filter-modal") as HTMLElement | null;
const adminFilterModalClose = document.getElementById("admin-filter-modal-close") as HTMLElement | null;
const adminFilterField = document.getElementById("admin-filter-field") as HTMLSelectElement | null;
const adminFilterOperator = document.getElementById("admin-filter-operator") as HTMLSelectElement | null;
const adminFilterValue = document.getElementById("admin-filter-value") as HTMLInputElement | null;
const adminFilterValueSelect = document.getElementById("admin-filter-value-select") as HTMLSelectElement | null;
const adminFilterValueFrom = document.getElementById("admin-filter-value-from") as HTMLInputElement | null;
const adminFilterValueTo = document.getElementById("admin-filter-value-to") as HTMLInputElement | null;
const adminFilterApply = document.getElementById("admin-filter-apply") as HTMLElement | null;
const adminFilterCancel = document.getElementById("admin-filter-cancel") as HTMLElement | null;
const orderDetailsModal = document.getElementById("order-details-modal") as HTMLElement | null;
const orderDetailsClose = document.getElementById("order-details-close") as HTMLElement | null;
const orderDetailsContent = document.getElementById("order-details-content") as HTMLElement | null;
const aboutContentEl = document.getElementById("about-content") as HTMLElement | null;
const adminAboutInput = document.getElementById("admin-about") as HTMLTextAreaElement | null;
const adminAboutSave = document.getElementById("admin-about-save") as HTMLElement | null;
const adminAboutStatus = document.getElementById("admin-about-status") as HTMLElement | null;

// Submission guards to prevent duplicate order creation
let isCheckoutSubmitting = false;
let isAdminOrderSubmitting = false;

const checkoutError = document.getElementById("checkout-error") as HTMLElement | null;
const checkoutForm = document.getElementById("checkout-form") as HTMLFormElement | null;
const checkoutSubmitButton = document.getElementById("whatsapp-submit") as HTMLButtonElement | null;
const customerNameInput = document.getElementById("customer-name") as HTMLInputElement | null;
const customerPhoneInput = document.getElementById("customer-phone") as HTMLInputElement | null;
const orderModal = document.getElementById("order-modal") as HTMLElement | null;
const orderModalClose = document.getElementById("order-modal-close") as HTMLElement | null;
const orderSave = document.getElementById("order-save") as HTMLElement | null;
const deleteConfirmModal = document.getElementById("delete-confirm-modal") as HTMLElement | null;
const deleteConfirmClose = document.getElementById("delete-confirm-close") as HTMLElement | null;
const deleteConfirmYes = document.getElementById("delete-confirm-yes") as HTMLElement | null;
const deleteConfirmNo = document.getElementById("delete-confirm-no") as HTMLElement | null;
const orderName = document.getElementById("order-name") as HTMLInputElement | null;
const orderDate = document.getElementById("order-date") as HTMLInputElement | null;
const orderPickupDate = document.getElementById("order-pickup-date") as HTMLInputElement | null;
const orderPickupTime = document.getElementById("order-pickup-time") as HTMLInputElement | null;
const orderTotal = document.getElementById("order-total") as HTMLInputElement | null;
const orderTotalHint = document.getElementById("order-total-hint") as HTMLElement | null;
const orderItemProduct = document.getElementById("order-item-product") as HTMLSelectElement | null;
const orderItemQty = document.getElementById("order-item-qty") as HTMLInputElement | null;
const orderItemAdd = document.getElementById("order-item-add") as HTMLElement | null;
const orderItemsList = document.getElementById("order-items-list") as HTMLElement | null;
const orderPaid = document.getElementById("order-paid") as HTMLInputElement | null;
const orderNotes = document.getElementById("order-notes") as HTMLTextAreaElement | null;
const adminSearchInput = document.getElementById("admin-search") as HTMLInputElement | null;
const adminCategoriesEl = document.getElementById("admin-categories") as HTMLElement | null;
const adminCreateCategoryButton = document.getElementById("admin-create-category") as HTMLElement | null;
const ordersAcceptingToggle = document.getElementById("orders-accepting-toggle") as HTMLInputElement | null;
const ordersAcceptingLabel = document.getElementById("orders-accepting-label") as HTMLElement | null;
const productModal = document.getElementById("product-modal") as HTMLElement | null;
const modalClose = document.getElementById("modal-close") as HTMLElement | null;
const modalSave = document.getElementById("modal-save") as HTMLElement | null;
const modalDelete = document.getElementById("modal-delete") as HTMLElement | null;
const modalTitle = document.getElementById("modal-title") as HTMLInputElement | null;
const modalPrice = document.getElementById("modal-price") as HTMLInputElement | null;
const modalCategoryDropdown = document.getElementById("modal-category-dropdown") as HTMLElement | null;
const modalCategoryTrigger = document.getElementById("modal-category-trigger") as HTMLElement | null;
const modalCategorySearch = document.getElementById("modal-category-search") as HTMLElement | null;
const modalCategoryList = document.getElementById("modal-category-list") as HTMLElement | null;
const modalImage = document.getElementById("modal-image") as HTMLInputElement | null;
const modalStock = document.getElementById("modal-stock") as HTMLInputElement | null;
const modalStatus = document.getElementById("modal-status") as HTMLElement | null;
const openCreateModal = document.getElementById("open-create-modal") as HTMLElement | null;
const createModal = document.getElementById("create-modal") as HTMLElement | null;
const createModalClose = document.getElementById("create-modal-close") as HTMLElement | null;
const createSave = document.getElementById("create-save") as HTMLElement | null;
const createTitle = document.getElementById("create-title") as HTMLInputElement | null;
const createPrice = document.getElementById("create-price") as HTMLInputElement | null;
const createCategoryDropdown = document.getElementById("create-category-dropdown") as HTMLElement | null;
const createCategoryTrigger = document.getElementById("create-category-trigger") as HTMLElement | null;
const createCategorySearch = document.getElementById("create-category-search") as HTMLElement | null;
const createCategoryList = document.getElementById("create-category-list") as HTMLElement | null;
const createImage = document.getElementById("create-image") as HTMLInputElement | null;
const categoryModal = document.getElementById("category-modal") as HTMLElement | null;
const categoryModalClose = document.getElementById("category-modal-close") as HTMLElement | null;
const categorySave = document.getElementById("category-save") as HTMLElement | null;
const categoryNameInput = document.getElementById("category-name") as HTMLInputElement | null;
const categoryImageInput = document.getElementById("category-image") as HTMLInputElement | null;
const categoryStatus = document.getElementById("category-status") as HTMLElement | null;
const categoryEditModal = document.getElementById("category-edit-modal") as HTMLElement | null;
const categoryEditClose = document.getElementById("category-edit-close") as HTMLElement | null;
const categoryEditNameInput = document.getElementById("category-edit-name") as HTMLInputElement | null;
const categoryEditImageInput = document.getElementById("category-edit-image") as HTMLInputElement | null;
const categoryEditPreview = document.getElementById("category-edit-preview") as HTMLElement | null;
const categoryEditSave = document.getElementById("category-edit-save") as HTMLElement | null;
const categoryEditStatus = document.getElementById("category-edit-status") as HTMLElement | null;
const contactBakeryPhoneEl = document.getElementById("contact-bakery-phone") as HTMLElement | null;
const contactBakeryPhoneLinkEl = document.getElementById("contact-bakery-phone-link") as HTMLAnchorElement | null;
const contactStorePhoneEl = document.getElementById("contact-store-phone") as HTMLElement | null;
const contactStorePhoneLinkEl = document.getElementById("contact-store-phone-link") as HTMLAnchorElement | null;
const contactWhatsappEl = document.getElementById("contact-whatsapp") as HTMLAnchorElement | null;
const contactWhatsappPhoneEl = document.getElementById("contact-whatsapp-phone") as HTMLElement | null;
const contactEmailEl = document.getElementById("contact-email") as HTMLAnchorElement | null;
const contactEmailTextEl = document.getElementById("contact-email-text") as HTMLElement | null;
const contactAddressEl = document.getElementById("contact-address") as HTMLElement | null;
const contactAddressLinkEl = document.getElementById("contact-address-link") as HTMLAnchorElement | null;
const siteLogoEl = document.getElementById("site-logo") as HTMLImageElement | null;
const adminLogoPreview = document.getElementById("admin-logo-preview") as HTMLImageElement | null;
const adminLogoReplaceBtn = document.getElementById("admin-logo-replace-btn") as HTMLElement | null;
const adminLogoInput = document.getElementById("admin-logo-input") as HTMLInputElement | null;
// New admin editable fields
const adminHeaderTitleInput = document.getElementById("admin-header-title") as HTMLInputElement | null;
const adminHeaderTitleSave = document.getElementById("admin-header-title-save") as HTMLElement | null;
const adminHeaderTitleStatus = document.getElementById("admin-header-title-status");
const adminHeroBadgeInput = document.getElementById("admin-hero-badge") as HTMLInputElement | null;
const adminHeroTitleInput = document.getElementById("admin-hero-title") as HTMLInputElement | null;
const adminHeroDescriptionInput = document.getElementById("admin-hero-description") as HTMLTextAreaElement | null;
const adminHeroChipsContainer = document.getElementById("admin-hero-chips-container") as HTMLElement | null;
const adminHeroAddChipBtn = document.getElementById("admin-hero-add-chip") as HTMLElement | null;
const adminHeroImageFile = document.getElementById("admin-hero-image-file") as HTMLInputElement | null;
const adminHeroImagePreview = document.getElementById("admin-hero-image-preview") as HTMLImageElement | null;
const adminHeroSave = document.getElementById("admin-hero-save") as HTMLElement | null;
const adminHeroStatus = document.getElementById("admin-hero-status") as HTMLElement | null;
const adminContactBakeryPhoneInput = document.getElementById("admin-contact-bakery-phone") as HTMLInputElement | null;
const adminContactStorePhoneInput = document.getElementById("admin-contact-store-phone") as HTMLInputElement | null;
const adminContactWhatsappInput = document.getElementById("admin-contact-whatsapp") as HTMLInputElement | null;
const adminContactEmailInput = document.getElementById("admin-contact-email") as HTMLInputElement | null;
const adminContactAddressInput = document.getElementById("admin-contact-address") as HTMLInputElement | null;
const adminContactSave = document.getElementById("admin-contact-save") as HTMLElement | null;
const adminContactStatus = document.getElementById("admin-contact-status") as HTMLElement | null;
const pickupDateInput = document.getElementById("pickup-date") as HTMLInputElement | null;
const pickupTimeInput = document.getElementById("pickup-time") as HTMLInputElement | null;
const orderChannelModal = document.getElementById("order-channel-modal");
const orderChannelClose = document.getElementById("order-channel-close");
const orderChannelWhatsapp = document.getElementById("order-channel-whatsapp");
const orderChannelEmail = document.getElementById("order-channel-email");
const notesPopover = document.createElement("div");
notesPopover.id = "notes-popover";
notesPopover.className = "notes-popover hidden";
notesPopover.innerHTML = `
  <div class="notes-popover-card">
    <label class="form-label">הערות להזמנה</label>
    <textarea class="form-input notes-textarea" rows="5"></textarea>
  </div>
`;
document.body.appendChild(notesPopover);
const notesTextarea = notesPopover.querySelector(".notes-textarea") as HTMLTextAreaElement | null;
let activeNotesInput: HTMLElement | null = null;
let adminOrderItems: Array<{ id: number | string; qty: number }> = [];
let adminOrderTotalDirty = false;
let checkoutStatusTimer: number | null = null;

// Data mapping functions (use mapper classes)
const mapDbToProduct = (row: any) => ProductMapper.mapDbToProduct(row);

const mapProductToDb = (product: any, { includeId = false } = {}) => {
  return ProductMapper.mapProductToDb(product, {
    includeId,
    normalizeCategoryId: (value) => CategoryMapper.normalizeCategoryId(value, state.categories)
  });
};

const getCategoryLabel = (product: any) => {
  return ProductMapper.getCategoryLabel(product, state.categories);
};

const normalizeCategoryId = (value: any): any => {
  const result = CategoryMapper.normalizeCategoryId(value, state.categories);
  return result;
};

const normalizeProductId = (value: any): any => {
  const result = CategoryMapper.normalizeProductId(value);
  return result;
};

// const getCategoryThumbnail = (categoryId: any) => { // Unused - for future use
//   return CategoryMapper.getCategoryThumbnail(categoryId, state.categories);
// };

const showTechErrorStatus = (element: any) => {
  if (!element) return;
  element.textContent = TECH_SUPPORT_MESSAGE;
  element.className = "text-sm mt-2 text-rose-600";
};

const updatePickupConstraints = () => {
  if (!pickupDateInput || !pickupTimeInput) return;
  
  // Get next available business date/time
  const minDateTime = getNextBusinessDateTime(new Date());
  const minDate = formatDateForInput(minDateTime);
  pickupDateInput.min = minDate;

  // Check if user selected a date
  if (pickupDateInput.value) {
    // Check if Saturday (6) - not allowed
    if (CheckoutValidator.isSaturday(pickupDateInput.value)) {
      pickupDateInput.value = '';
      if (checkoutError) {
        checkoutError.textContent = "ביום שבת אנו סגורים. בחרו יום אחר.";
        checkoutError.classList.remove("hidden");
        setTimeout(() => checkoutError.classList.add("hidden"), 4000);
      }
      return;
    }
  }
  
  setPickupValidity();
};

const setPickupValidity = () => {
  if (!pickupDateInput || !pickupTimeInput) return;
  
  const message = CheckoutValidator.getPickupValidityMessage(
    pickupDateInput.value,
    pickupTimeInput.value
  );
  
  pickupDateInput.setCustomValidity(message);
  pickupTimeInput.setCustomValidity(message);
};

const validateAndFixPickupDate = () => {
  if (!pickupDateInput || !pickupDateInput.value) return;
  
  // Check if Saturday (6)
  if (CheckoutValidator.isSaturday(pickupDateInput.value)) {
    // Reset to empty
    pickupDateInput.value = '';
    alert("ביום שבת אנו סגורים. בחרו יום אחר.");
    return;
  }
  
  updatePickupConstraints();
};

const validateAndFixPickupTime = () => {
  if (!pickupTimeInput || !pickupTimeInput.value) return;
  
  // With select dropdown, time range is already restricted by HTML options
  // Just call updatePickupConstraints for consistency
  updatePickupConstraints();
};

const setCustomerFieldValidity = () => {
  if (customerNameInput) {
    customerNameInput.setCustomValidity(
      customerNameInput.value.trim() ? "" : CUSTOMER_NAME_REQUIRED
    );
  }
  if (customerPhoneInput) {
    customerPhoneInput.setCustomValidity(
      customerPhoneInput.value.trim() ? "" : CUSTOMER_PHONE_REQUIRED
    );
  }
};

const setActiveCategory = (categoryId: any) => {
  CategoryUI.setActiveCategory(categoryId, state, {
    renderCategoryCarousel,
    renderProducts
  });
};

const renderCategoryCarousel = () => {
  CategoryUI.renderCategoryCarousel(state, categoryTrackEl, setActiveCategory);
};

const ensureCategoryOptions = () => {
  renderCategoryDropdown(modalCategoryDropdown, {
    searchInput: modalCategorySearch,
    listEl: modalCategoryList,
    getSelectedId: () => state.editingCategoryId,
    setSelectedId: (id: any) => {
      state.editingCategoryId = id;
    },
    triggerEl: modalCategoryTrigger,
  });

  renderCategoryDropdown(createCategoryDropdown, {
    searchInput: createCategorySearch,
    listEl: createCategoryList,
    getSelectedId: () => state.creatingCategoryId,
    setSelectedId: (id: any) => {
      state.creatingCategoryId = id;
    },
    triggerEl: createCategoryTrigger,
  });
};

const renderCategoryDropdown = (dropdownEl: any, config: any) => {
  if (!dropdownEl) return;
  const { searchInput, listEl, getSelectedId, setSelectedId, triggerEl } = config;
  const query = searchInput?.value?.trim().toLowerCase() || "";
  const categories = state.categories.length ? state.categories : [];

  const filtered = categories.filter((category) =>
    category.category_name.toLowerCase().includes(query)
  );

  listEl.innerHTML = "";
  filtered.forEach((category) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "dropdown-item";
    if (getSelectedId() === category.category_id) {
      item.classList.add("active");
    }
    item.textContent = category.category_name;
    item.addEventListener("click", () => {
      setSelectedId(category.category_id);
      setCategoryTriggerLabel(
        triggerEl,
        category.category_name,
        category.category_id
      );
      dropdownEl.classList.remove("open");
    });
    listEl.appendChild(item);
  });

  const createLink = document.createElement("button");
  createLink.type = "button";
  createLink.className = "dropdown-link";
  createLink.textContent = "אתה רוצה ליצור קטגוריה חדשה?";
  createLink.addEventListener("click", () => {
    dropdownEl.classList.remove("open");
    openCategoryModal();
  });
  listEl.appendChild(createLink);
};

const setCategoryTriggerLabel = (triggerEl: any, label: any, selectedId: any = null) => {
  if (!triggerEl) return;
  triggerEl.textContent = label || "בחר קטגוריה";
  if (selectedId !== null && selectedId !== undefined) {
    triggerEl.dataset.selectedId = String(selectedId);
    console.log("[setCategoryTriggerLabel] Persisted selectedId:", selectedId, "trigger:", triggerEl);
  } else {
    console.log("[setCategoryTriggerLabel] No selectedId provided");
  }
};

const ensureSupabase = () => {
  if (!supabaseClient) {
    alert(
      "חסרים פרטי Supabase. הגדירו assets/config.js עם SUPABASE_URL ו-SUPABASE_ANON_KEY."
    );
    return false;
  }
  return true;
};

const ensureAdmin = () => {
  if (state.role !== "admin") {
    alert("אין הרשאות ניהול.");
    return false;
  }
  return true;
};

// const getCartItems = () => { // Unused - for future use
//   return CartManager.getCartItems(state.cart, state.products);
// };

const getCartTotals = () => {
  return CartManager.getCartTotals(state.cart, state.products);
};

const updateCartUI = () => {
  const { items, totalQty, totalPrice } = getCartTotals();
  if (!cartItemsEl) return;
  
  cartItemsEl.innerHTML = "";

  if (!items.length) {
    cartItemsEl.innerHTML =
      "<p class='text-sm text-stone-500'>העגלה ריקה כרגע. התחילו לבחור מאפים טעימים.</p>";
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "cart-item";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}" />
      <div class="flex-1">
        <p class="font-semibold text-stone-800">${item.title}</p>
        <p class="text-sm text-stone-500">
          ${item.discountPercentage > 0 ? `<span class="line-through">${formatCurrency(item.price)}</span> ` : ""}
          ${formatCurrency(item.discountedPrice)} ליח'
        </p>
        <div class="flex items-center justify-between mt-2">
          <div class="qty-controls">
            <button data-action="dec" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-id="${item.id}">+</button>
          </div>
          <span class="font-semibold text-amber-900">${formatCurrency(
            item.lineTotal
          )}</span>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(card);
  });

  if (cartTotalEl) cartTotalEl.textContent = formatCurrency(totalPrice);
  if (floatingCount) floatingCount.textContent = String(totalQty);
  if (floatingTotal) floatingTotal.textContent = formatCurrency(totalPrice);
  if (floatingCart) floatingCart.classList.toggle("hidden", totalQty === 0);
};

const renderProducts = () => {
  if (productsScrollEl) {
    const query = productSearchInput?.value?.trim().toLowerCase() || "";
    const activeCategory = state.activeCategoryId;
    const items = [...state.products]
      .filter((product) =>
        product.title.toLowerCase().includes(query)
      )
      .filter((product) => {
        if (!activeCategory) return true;
        return String(product.categoryId) === String(activeCategory);
      })
      .sort((a, b) => a.title.localeCompare(b.title, "he"));

    productsScrollEl.innerHTML = "";
    items.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      const discountedPrice = product.discountPercentage > 0
        ? product.price * (1 - product.discountPercentage / 100)
        : product.price;
      const discountBadge = product.discountPercentage > 0
        ? `<div class="discount-badge">-${Math.round(product.discountPercentage)}%</div>`
        : "";
      card.innerHTML = `
        <div class="relative">
          <img src="${product.image}" alt="${product.title}" class="product-image" />
          ${discountBadge}
        </div>
        <div class="product-content">
          <div class="flex items-start justify-between gap-2">
            <h5 class="font-semibold text-lg">${product.title}</h5>
            <div class="text-right">
              ${product.discountPercentage > 0 ? `<span class="text-xs text-stone-500 line-through">${formatCurrency(product.price)}</span><br/>` : ""}
              <span class="text-amber-900 font-bold">${formatCurrency(discountedPrice)}</span>
            </div>
          </div>
          <button
            class="primary-button"
            data-action="add"
            data-id="${product.id}"
            ${product.inStock ? "" : "disabled"}
          >
            ${product.inStock ? "הוסף לסל" : "אזל מהמלאי"}
          </button>
        </div>
      `;
      productsScrollEl.appendChild(card);
    });
  }
};

const renderAdmin = () => {
  if (!adminProductsEl) return;
  
  adminProductsEl.innerHTML = "";
  const query = adminSearchInput?.value?.trim().toLowerCase() || "";
  const filteredProducts = state.products.filter((product) => {
    return (
      product.title.toLowerCase().includes(query) ||
      getCategoryLabel(product).toLowerCase().includes(query)
    );
  });

  const { key: productKey, dir: productDir } = state.sortProducts;
  filteredProducts.sort((a, b) => {
    let left = (a as any)[productKey];
    let right = (b as any)[productKey];
    if (productKey === "price" || productKey === "discountPercentage") {
      left = Number(left);
      right = Number(right);
    }
    if (productKey === "inStock") {
      left = left ? 1 : 0;
      right = right ? 1 : 0;
    }
    const compare =
      typeof left === "string"
        ? left.localeCompare(String(right), "he")
        : (left as number) - (right as number);
    return productDir === "asc" ? compare : -compare;
  });

  filteredProducts.forEach((product) => {
    const row = document.createElement("tr");
    row.dataset.id = String(product.id);
    row.innerHTML = `
      <td>${product.title}</td>
      <td>${getCategoryLabel(product)}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${product.discountPercentage > 0 ? `${Math.round(product.discountPercentage)}%` : "-"}</td>
      <td>${product.inStock ? "כן" : "לא"}</td>
    `;
    adminProductsEl.appendChild(row);
  });

  if (adminCategoriesEl) {
    adminCategoriesEl.innerHTML = "";
    const categories = [...state.categories].sort((a, b) =>
      a.category_name.localeCompare(b.category_name, "he")
    );
    if (!categories.length) {
      const row = document.createElement("tr");
      row.innerHTML =
        "<td colspan='3' class='text-sm text-stone-500'>אין קטגוריות להצגה.</td>";
      adminCategoriesEl.appendChild(row);
    } else {
      categories.forEach((category) => {
        const row = document.createElement("tr");
        row.dataset.categoryId = String(category.category_id);
        const imageSrc = category.image_url ? (category.image_url.startsWith('assets/') ? category.image_url.substring(7) : category.image_url) : "all_categories.png";
        row.innerHTML = `
          <td>${category.category_name}</td>
          <td>
            <img src="${imageSrc}" alt="${category.category_name}" class="admin-category-image" />
          </td>
          <td>
            <button type="button" class="secondary-button" data-action="delete-category">מחק</button>
          </td>
        `;
        adminCategoriesEl.appendChild(row);
      });
    }
  }

  if (!adminOrdersEl) return;
  
  adminOrdersEl.innerHTML = "";
  const orderQuery = adminOrdersSearchInput?.value?.trim().toLowerCase() || "";
  
  // First apply search filter
  let filteredOrders = state.orders.filter((order) => {
    if (!orderQuery) return true;
    const name = order.customer?.name?.toLowerCase() || "";
    const orderNumber = String(order.order_number ?? "").toLowerCase();
    return name.includes(orderQuery) || orderNumber.includes(orderQuery);
  });

  // Then apply advanced filters
  filteredOrders = OrderFilterService.applyFilters(filteredOrders, state.activeOrderFilters);

  // Render active filter chips
  const adminActiveFiltersEl = document.getElementById("admin-orders-active-filters");
  const adminFilterClearBtn = document.getElementById("admin-orders-clear-filters-btn");
  if (adminActiveFiltersEl) {
    AdminUI.renderActiveFilterChips(
      state.activeOrderFilters,
      adminActiveFiltersEl,
      (filter) => OrderFilterService.formatFilterForDisplay(filter),
      (index) => {
        state.activeOrderFilters.splice(index, 1);
        renderAdmin();
      }
    );
    
    // Toggle clear button visibility
    if (state.activeOrderFilters.length > 0) {
      adminFilterClearBtn?.classList.remove("hidden");
    } else {
      adminFilterClearBtn?.classList.add("hidden");
    }
  }

  const { key: orderKey, dir: orderDir } = state.sortOrders;
  filteredOrders.sort((a, b) => {
    let left;
    let right;
    if (orderKey === "name") {
      left = a.customer?.name || "";
      right = b.customer?.name || "";
    } else if (orderKey === "notes") {
      left = a.notes || "";
      right = b.notes || "";
    } else if (orderKey === "user_notes") {
      left = a.user_notes || "";
      right = b.user_notes || "";
    } else if (orderKey === "created_at") {
      left = new Date(a.created_at).getTime();
      right = new Date(b.created_at).getTime();
    } else if (orderKey === "pickup_date") {
      left = a.pickup_date ? new Date(a.pickup_date).getTime() : 0;
      right = b.pickup_date ? new Date(b.pickup_date).getTime() : 0;
    } else if (orderKey === "order_number") {
      left = Number(a.order_number) || 0;
      right = Number(b.order_number) || 0;
    } else if (orderKey === "paid") {
      left = a.paid ? 1 : 0;
      right = b.paid ? 1 : 0;
    } else if (orderKey === "deleted") {
      left = a.deleted ? 1 : 0;
      right = b.deleted ? 1 : 0;
    } else {
      left = Number((a as any)[orderKey]) || 0;
      right = Number((b as any)[orderKey]) || 0;
    }
    const compare =
      typeof left === "string"
        ? left.localeCompare(String(right), "he")
        : (left as number) - (right as number);
    return orderDir === "asc" ? compare : -compare;
  });

  if (!filteredOrders.length) {
    const row = document.createElement("tr");
    row.innerHTML =
      "<td colspan='9' class='text-sm text-stone-500'>לא קיימת תוצאות להצגה.</td>";
    adminOrdersEl.appendChild(row);
    return;
  }

  filteredOrders.forEach((order) => {
    const row = document.createElement("tr");
    row.dataset.orderId = String(order.id);
    if (order.deleted) {
      row.style.opacity = "0.5";
      row.style.textDecoration = "line-through";
    }
    row.innerHTML = `
      <td>${order.order_number ?? ""}</td>
      <td>${order.customer?.name || 'Unknown'}</td>
      <td>${new Date(order.created_at).toLocaleString("he-IL", { hour12: false })}</td>
      <td>${order.pickup_date ? new Date(order.pickup_date).toLocaleDateString("he-IL", { year: "numeric", month: "2-digit", day: "2-digit" }) + " " + (order.pickup_time || "") : "-"}</td>
      <td class="text-amber-900 font-semibold">${formatCurrency(
        order.total ?? 0
      )}</td>
      <td>
        <input type="checkbox" class="form-checkbox" data-order-field="paid" data-order-id="${
          order.id
        }" ${order.paid ? "checked" : ""} />
      </td>
      <td>
        <input
          class="form-input"
          data-order-field="notes"
          data-order-id="${order.id}"
          value="${order.notes || ""}"
          placeholder="הערות מנהל"
          readonly
        />
      </td>
      <td>
        <div class="text-sm text-stone-600" title="${order.user_notes || ""}">${
          order.user_notes ? (order.user_notes.length > 30 ? order.user_notes.substring(0, 30) + "..." : order.user_notes) : "-"
        }</div>
      </td>
      <td>
        <input type="checkbox" class="form-checkbox" data-order-field="deleted" data-order-id="${
          order.id
        }" ${order.deleted ? "checked" : ""} ${order.paid ? "disabled" : ""} />
      </td>
    `;
    adminOrdersEl.appendChild(row);
  });

  renderStatistics();
};

const setAdminView = (view: "stats" | "manage") => {
  state.adminView = view;
  adminStatsView?.classList.toggle("hidden", view !== "stats");
  adminManageView?.classList.toggle("hidden", view !== "manage");
  adminViewStatsBtn?.classList.toggle("active", view === "stats");
  adminViewManageBtn?.classList.toggle("active", view === "manage");
  
  // Render statistics when switching to stats view
  if (view === "stats") {
    renderStatistics();
  }
};

const formatStatsDate = (value: Date): string =>
  value.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const statsStartOfDay = (value: Date): Date =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const statsEndOfDay = (value: Date): Date =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);

const getPreviousStatsRange = (range: { start: Date; end: Date }, key: StatsRangeKey) => {
  if (key !== "custom") {
    return getPreviousDateRange(key);
  }
  const start = statsStartOfDay(range.start);
  const end = statsStartOfDay(range.end);
  const dayMs = 1000 * 60 * 60 * 24;
  const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / dayMs));
  const prevEnd = statsEndOfDay(new Date(start.getTime() - dayMs));
  const prevStart = statsStartOfDay(new Date(start.getTime() - (days + 1) * dayMs));
  return { start: prevStart, end: prevEnd };
};

const formatDeltaText = (value: number) => {
  const rounded = Math.abs(value) < 0.05 ? 0 : value;
  if (rounded === 0) {
    return { text: "ללא שינוי", className: "" };
  }
  const direction = rounded > 0 ? "עלייה" : "ירידה";
  const className = rounded > 0 ? "positive" : "negative";
  return {
    text: `${direction} של ${Math.abs(rounded).toFixed(1)}%`,
    className,
  };
};

const renderBarSeries = (
  container: HTMLElement | null,
  entries: Array<{ label: string; value: number }>,
  labelEvery = 1
): void => {
  if (!container) return;
  if (!entries.length) {
    container.innerHTML =
      "<div class='text-sm text-stone-500 w-full text-center'>אין נתונים להצגה</div>";
    return;
  }

  const maxValue = Math.max(...entries.map((entry) => entry.value), 1);
  container.innerHTML = entries
    .map((entry, index) => {
      const height = Math.max(6, (entry.value / maxValue) * 160);
      const label = index % labelEvery === 0 ? entry.label : "";
      const title = `${entry.label} · ${entry.value}`;
      return `
        <div class="stats-bar-group" title="${title}">
          <div class="stats-bar" style="height: ${height}px"></div>
          <div class="stats-bar-label">${label}</div>
        </div>
      `;
    })
    .join("");
};

const getStatsItemTitle = (item: any): string => {
  if (!item) return "-";
  if (item.title) return String(item.title);
  if (item.products) {
    const related = Array.isArray(item.products) ? item.products[0] : item.products;
    if (related?.title) return String(related.title);
  }
  return "-";
};

const renderStatistics = () => {
  if (!statsOrdersValue || !statsTrendChart) return;

  const selectedRange =
    (statsRangeSelect?.value || state.statsRange || "this_month") as StatsRangeKey;
  state.statsRange = selectedRange;
  if (statsRangeSelect && statsRangeSelect.value !== selectedRange) {
    statsRangeSelect.value = selectedRange;
  }

  const baseRange = getDateRange(
    selectedRange === "custom" ? "this_month" : selectedRange
  );

  if (statsRangeStartInput && statsRangeEndInput) {
    if (selectedRange !== "custom") {
      statsRangeStartInput.value = formatDateForInput(baseRange.start);
      statsRangeEndInput.value = formatDateForInput(baseRange.end);
      state.statsRangeStart = statsRangeStartInput.value;
      state.statsRangeEnd = statsRangeEndInput.value;
    } else {
      if (!statsRangeStartInput.value && !statsRangeEndInput.value) {
        statsRangeStartInput.value = state.statsRangeStart || formatDateForInput(baseRange.start);
        statsRangeEndInput.value = state.statsRangeEnd || formatDateForInput(baseRange.end);
        state.statsRangeStart = statsRangeStartInput.value;
        state.statsRangeEnd = statsRangeEndInput.value;
      }
      if (state.statsRangeStart && !statsRangeStartInput.value) {
        statsRangeStartInput.value = state.statsRangeStart;
      }
      if (state.statsRangeEnd && !statsRangeEndInput.value) {
        statsRangeEndInput.value = state.statsRangeEnd;
      }
    }
  }

  const selectedSeries = (state.statsSeries || "revenue") as StatsSeriesKey;
  const range = buildCustomRange(
    statsRangeStartInput?.value,
    statsRangeEndInput?.value,
    baseRange
  );
  const previousRange = getPreviousStatsRange(range, selectedRange);
  const rangeOrders = filterOrdersByRange(state.orders, range);
  const previousOrders = filterOrdersByRange(state.orders, previousRange);
  const kpis = computeKpis(rangeOrders, previousOrders);

  statsOrdersValue.textContent = String(kpis.totalOrders);
  if (statsRevenueValue) {
    statsRevenueValue.textContent = formatCurrency(kpis.totalRevenue);
  }
  if (statsConversionValue) {
    statsConversionValue.textContent = `${kpis.conversionRate.toFixed(1)}%`;
  }
  if (statsAovValue) {
    statsAovValue.textContent = formatCurrency(kpis.averageOrderValue);
  }

  const applyDelta = (el: HTMLElement | null, value: number) => {
    if (!el) return;
    const { text, className } = formatDeltaText(value);
    el.textContent = text;
    el.classList.remove("positive", "negative");
    if (className) {
      el.classList.add(className);
    }
  };

  applyDelta(statsOrdersDelta, kpis.deltaOrders);
  applyDelta(statsRevenueDelta, kpis.deltaRevenue);
  applyDelta(statsAovDelta, kpis.deltaAverageOrder);

  statsSeriesButtons.forEach((button) => {
    const isActive = button.dataset.statsSeries === selectedSeries;
    button.classList.toggle("active", isActive);
  });

  const series = buildDailySeries(rangeOrders, range);
  const seriesEntries = series.map((entry) => ({
    label: entry.label,
    value: selectedSeries === "revenue" ? entry.revenue : entry.orders,
  }));
  const labelEvery = Math.max(1, Math.ceil(seriesEntries.length / 8));
  renderBarSeries(statsTrendChart, seriesEntries, labelEvery);

  if (statsTrendLegend) {
    statsTrendLegend.textContent = `טווח: ${formatStatsDate(
      range.start
    )} - ${formatStatsDate(range.end)}`;
  }

  if (statsPopularList) {
    const popular = computePopularProducts(rangeOrders, 5);
    if (!popular.length) {
      statsPopularList.innerHTML =
        "<div class='text-sm text-stone-500'>אין נתונים להצגה</div>";
    } else {
      statsPopularList.innerHTML = popular
        .map((item) => {
          const width = Math.max(6, item.share);
          return `
            <div class="stats-list-item">
              <div class="stats-list-header">
                <span>${item.title}</span>
                <span>${item.qty} · ${item.share.toFixed(1)}%</span>
              </div>
              <div class="stats-list-bar">
                <div class="stats-list-bar-fill" style="width: ${width}%"></div>
              </div>
            </div>
          `;
        })
        .join("");
    }
  }

  renderBarSeries(
    statsPickupChart,
    computePickupHourDistribution(rangeOrders).map((entry) => ({
      label: entry.label,
      value: entry.count,
    })),
    1
  );

  renderBarSeries(
    statsOrderHourChart,
    computeOrderHourDistribution(rangeOrders).map((entry) => ({
      label: entry.label,
      value: entry.count,
    })),
    1
  );

  const averages = computeAverageOrders(rangeOrders, range);
  if (statsAvgDay) {
    statsAvgDay.textContent = averages.perDay.toFixed(1);
  }
  if (statsAvgWeek) {
    statsAvgWeek.textContent = averages.perWeek.toFixed(1);
  }

  renderBarSeries(
    statsSeasonalityChart,
    computeMonthlySeasonality(state.orders).map((entry) => ({
      label: entry.label,
      value: entry.count,
    })),
    1
  );

  if (statsLatestOrders) {
    const latest = [...rangeOrders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);

    if (!latest.length) {
      statsLatestOrders.innerHTML =
        "<tr><td colspan='7' class='text-sm text-stone-500'>אין נתונים להצגה</td></tr>";
    } else {
      statsLatestOrders.innerHTML = latest
        .map((order) => {
          const relatedItems = Array.isArray(order.order_items) ? order.order_items : [];
          const items = relatedItems.length ? relatedItems : order.items || [];
          const firstItem = items[0] as any;
          const title = getStatsItemTitle(firstItem);
          const extraCount = items.length > 1 ? ` ועוד ${items.length - 1}` : "";
          const total = getOrderTotal(order);
          const status = order.deleted
            ? { label: "בוטל", className: "cancelled" }
            : order.paid
            ? { label: "הושלם", className: "completed" }
            : { label: "ממתין", className: "pending" };
          return `
            <tr>
              <td>${title}${extraCount}</td>
              <td>${order.order_number ?? order.id ?? ""}</td>
              <td>${formatStatsDate(new Date(order.created_at))}</td>
              <td>${order.customer?.name || ""}</td>
              <td><span class="stats-status-pill ${status.className}">${status.label}</span></td>
              <td>${formatCurrency(total)}</td>
              <td>
                <button class="secondary-button text-xs" data-stats-action="view-order" data-order-id="${
                  order.id
                }">צפייה</button>
              </td>
            </tr>
          `;
        })
        .join("");
    }
  }
};

const updateRoute = () => {
  const isAdmin = window.location.hash === "#admin";
  adminSection?.classList.toggle("hidden", !isAdmin);
  document.getElementById("catalog")?.classList.toggle("hidden", isAdmin);
  document.getElementById("checkout")?.classList.toggle("hidden", isAdmin);
  document.getElementById("contact")?.classList.toggle("hidden", isAdmin);
  document.getElementById("about")?.classList.toggle("hidden", isAdmin);
  document.getElementById("hero")?.classList.toggle("hidden", isAdmin);
  // Update button visibility based on admin page and auth state
  const isAuthenticated = state.session !== null;
  if (isAdmin && isAuthenticated) {
    adminLogoReplaceBtn?.classList.remove("hidden");
  } else {
    adminLogoReplaceBtn?.classList.add("hidden");
  }
  if (!isAdmin) {
    document.getElementById("catalog")?.classList.remove("hidden");
    document.getElementById("checkout")?.classList.remove("hidden");
  }
};

const setAdminUI = (isAuthenticated: boolean) => {
  adminAuthEl?.classList.toggle("hidden", isAuthenticated);
  adminPanelEl?.classList.toggle("hidden", !isAuthenticated);
  adminGreetingEl?.classList.toggle("hidden", !isAuthenticated);
  adminLogoutButton?.classList.toggle("hidden", !isAuthenticated);
  // Show button only if authenticated AND on admin page
  const isAdmin = window.location.hash === "#admin";
  if (isAuthenticated && isAdmin) {
    adminLogoReplaceBtn?.classList.remove("hidden");
  } else {
    adminLogoReplaceBtn?.classList.add("hidden");
  }
};


const setAboutContent = (text: string) => {
  if (!aboutContentEl) return;
  const safeText = (text || DEFAULT_ABOUT).trim();
  aboutContentEl.innerHTML = safeText.replace(/\n/g, "<br />");
  if (adminAboutInput) {
    adminAboutInput.value = safeText;
  }
};

// const sanitizeFileName = (text: string) => {
//   if (!text) return 'file';
//   // Convert to lowercase, replace spaces with dashes, remove non-ASCII/non-alphanumeric
//   const sanitized = text
//     .toLowerCase()
//     .replace(/\s+/g, '-')
//     .replace(/[^a-z0-9_-]/g, '')
//     .replace(/-+/g, '-')
//     .replace(/^-|-$/g, '');
//   // Fallback if everything was stripped out
//   return sanitized || 'file';
// };

const uploadProductImage = async (file: File, prefix: string) => {
  if (!file) return null;
  if (!ensureSupabase() || !storageService) return null;
  return await storageService.uploadProductImage(file, prefix);
};

const uploadCategoryImage = async (file: File, prefix: string) => {
  if (!file) return null;
  if (!ensureSupabase() || !storageService) return null;
  return await storageService.uploadCategoryImage(file, prefix);
};

const openCart = () => {
  cartDrawer?.classList.add("open");
  overlay?.classList.remove("hidden");
  // Prevent body scroll on mobile when cart is open
  // Avoid position:fixed on body — it breaks fixed children and scroll on iOS Safari
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
};

const closeCart = () => {
  cartDrawer?.classList.remove("open");
  overlay?.classList.add("hidden");
  // Re-enable body scroll
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
};

const addToCart = (id: any) => {
  state.cart = CartManager.addToCart(state.cart, id);
  updateCartUI();
  openCart();
};

const updateQty = (id: any, delta: any) => {
  state.cart = CartManager.updateQuantity(state.cart, id, delta);
  updateCartUI();
};

// const setQty = (id: any, value: any) => {
//   state.cart = CartManager.setQuantity(state.cart, id, value);
//   updateCartUI();
// };

// Order building functions (use OrderBuilder class)
const buildOrderMessage = (params: OrderMessageParams) => {
  return OrderBuilder.buildOrderMessage({
    items: params.items as any,
    customerName: params.name,
    customerPhone: params.phone,
    pickupDate: params.date,
    pickupTime: params.time,
    totalPrice: params.totalPrice,
    userNotes: params.userNotes
  });
};

const buildOrderLinks = (message: string) => {
  return OrderBuilder.buildOrderLinks(message, {
    whatsappPhone: state.checkoutWhatsappPhone,
    email: state.checkoutEmail
  });
};

const openOrderChannelModal = (links: any) => {
  if (!orderChannelModal) return;
  state.pendingOrderLinks = links;
  orderChannelModal.classList.remove("hidden");
};

const closeOrderChannelModal = () => {
  if (!orderChannelModal) return;
  orderChannelModal.classList.add("hidden");
  state.pendingOrderLinks = null;
};

const clearCheckoutStatus = () => {
  if (!checkoutError) return;
  checkoutError.textContent = "";
  checkoutError.className = "text-sm text-rose-600 hidden mt-2";
  if (checkoutStatusTimer) {
    window.clearTimeout(checkoutStatusTimer);
    checkoutStatusTimer = null;
  }
};

const setCheckoutStatus = (
  message: string,
  variant: "error" | "success",
  autoHideMs?: number
) => {
  if (!checkoutError) return;
  checkoutError.textContent = message;
  checkoutError.className = `text-sm mt-2 ${
    variant === "error" ? "text-rose-600" : "text-green-600"
  }`;
  checkoutError.scrollIntoView({ behavior: "smooth", block: "center" });
  if (checkoutStatusTimer) {
    window.clearTimeout(checkoutStatusTimer);
    checkoutStatusTimer = null;
  }
  if (autoHideMs) {
    checkoutStatusTimer = window.setTimeout(() => {
      clearCheckoutStatus();
    }, autoHideMs);
  }
};

const generateOrderId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `order_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const isMockMode = () => {
  if (typeof window !== "undefined" && (window as any).__MOCK_MODE__ === true) {
    return true;
  }
  return Boolean((supabaseClient as any)?.__db || (supabaseClient as any)?.__isMock);
};

// Cross-tab duplicate detection using sessionStorage
const RECENT_SUBMISSIONS_KEY = 'bakery_recent_submissions';
const SUBMISSION_WINDOW_MS = 10000; // 10 seconds

const createOrderFingerprint = (orderData: any): string => {
  // Create a unique fingerprint of the order to detect duplicates
  const parts = [
    JSON.stringify(orderData.items?.map((i: any) => `${i.id}:${i.qty}`) || []),
    orderData.customer?.name || '',
    orderData.customer?.phone || '',
    orderData.pickup_date || '',
    orderData.pickup_time || '',
    orderData.total || 0,
  ];
  return parts.join('|');
};

const checkRecentSubmission = (fingerprint: string): boolean => {
  try {
    const now = Date.now();
    const stored = sessionStorage.getItem(RECENT_SUBMISSIONS_KEY);
    const recent = stored ? JSON.parse(stored) : [];
    
    // Clean up old entries and check for duplicates
    const validSubmissions = recent.filter((s: any) => 
      now - s.time < SUBMISSION_WINDOW_MS
    );
    
    // Check if this fingerprint exists in recent submissions
    return validSubmissions.some((s: any) => s.fingerprint === fingerprint);
  } catch {
    return false;
  }
};

const recordSubmission = (fingerprint: string): void => {
  try {
    const now = Date.now();
    const stored = sessionStorage.getItem(RECENT_SUBMISSIONS_KEY);
    const recent = stored ? JSON.parse(stored) : [];
    
    // Clean up old entries
    const validSubmissions = recent.filter((s: any) => 
      now - s.time < SUBMISSION_WINDOW_MS
    );
    
    // Add new submission
    validSubmissions.push({ fingerprint, time: now });
    
    sessionStorage.setItem(RECENT_SUBMISSIONS_KEY, JSON.stringify(validSubmissions));
  } catch {
    // Ignore storage errors
  }
};

const parseAdminOrderItems = () => {
  return [...adminOrderItems];
};

const getAdminProductPrice = (product: any) => {
  const basePrice = Number(product?.price) || 0;
  const discount = Number(product?.discountPercentage) || 0;
  if (discount <= 0) return basePrice;
  return basePrice * (1 - discount / 100);
};

const calculateAdminOrderTotal = (items: Array<{ id: number | string; qty: number }>) => {
  return items.reduce((sum, item) => {
    const product = state.products.find((p) => String(p.id) === String(item.id));
    if (!product) return sum;
    const price = getAdminProductPrice(product);
    return sum + price * (item.qty || 1);
  }, 0);
};

const renderAdminOrderItems = () => {
  if (orderItemsList) {
    if (!adminOrderItems.length) {
      orderItemsList.innerHTML = "<div class='text-xs text-stone-500'>אין מוצרים להזמנה.</div>";
    } else {
      orderItemsList.innerHTML = adminOrderItems
        .map((item) => {
          const product = state.products.find((p) => String(p.id) === String(item.id));
          const title = product?.title || "";
          const price = product ? getAdminProductPrice(product) : 0;
          const lineTotal = price * (item.qty || 1);
          return `
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm text-stone-700">${title}</div>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  class="form-input"
                  value="${item.qty || 1}"
                  data-order-item-qty="${item.id}"
                />
                <span class="text-sm text-stone-600">${formatCurrency(lineTotal)}</span>
                <button type="button" class="secondary-button" data-order-item-remove="${item.id}">מחק</button>
              </div>
            </div>
          `;
        })
        .join("");
    }
  }

  const computedTotal = calculateAdminOrderTotal(adminOrderItems);
  if (orderTotalHint) {
    orderTotalHint.textContent = adminOrderItems.length
      ? `סה"כ מחושב: ${formatCurrency(computedTotal)}`
      : "";
  }
  if (orderTotal && !adminOrderTotalDirty) {
    orderTotal.value = adminOrderItems.length ? String(Math.round(computedTotal)) : "";
  }
};

const seedAdminOrderProductSelect = () => {
  if (!orderItemProduct) return;
  const options = state.products
    .map((product) => {
      const price = getAdminProductPrice(product);
      return `<option value="${product.id}">${product.title} (${formatCurrency(price)})</option>`;
    })
    .join("");
  orderItemProduct.innerHTML = options || "";
};

const insertOrderItemsForOrder = async (
  orderId: string | null | undefined,
  items: Array<{ id: number | string; qty: number }>,
  onError?: () => void
) => {
  if (!orderId || !items.length) return { ok: true };
  const orderItemsPayload = items
    .map((item) => {
      const productId = normalizeProductId(item.id);
      if (!productId) return null;
      return {
        order_id: orderId,
        product_id: productId,
        qty: item.qty || 1,
      };
    })
    .filter(Boolean);

  if (!orderItemsPayload.length) return { ok: true };

  const { error } = await supabaseClient
    .from("order_items")
    .insert(orderItemsPayload as any[]);

  if (error) {
    console.error(error);
    onError?.();
    return { ok: false, error };
  }

  return { ok: true };
};

const clearCheckoutState = () => {
  state.cart = CartManager.clearCart();
  if (checkoutForm) {
    checkoutForm.reset();
  }
  updateCartUI();
  clearCheckoutStatus();
};

const handleCheckout = async (event: Event) => {
  event.preventDefault();
  if (!ensureSupabase()) return;
  
  // Prevent duplicate submissions
  if (isCheckoutSubmitting) return;
  
  // Check if orders are being accepted
  if (!state.ordersAccepting) {
    if (checkoutError) {
      checkoutError.textContent = "מצטערים, כרגע איננו מקבלים הזמנות חדשות.";
      checkoutError.classList.remove("hidden");
    }
    return;
  }
  
  // Clear any previous status
  clearCheckoutStatus();
  
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const payload = {
    name: (formData.get("name") as string || "").trim(),
    phone: (formData.get("phone") as string || "").trim(),
    date: formData.get("date") as string,
    time: formData.get("time") as string,
    user_notes: (formData.get("user_notes") as string || "").trim(),
  };

  setPickupValidity();
  
  // Check each input's validity individually (JSDOM might not handle form.checkValidity properly)
  if (pickupDateInput && !pickupDateInput.validity.valid) {
    if (checkoutError) {
      checkoutError.textContent = pickupDateInput.validationMessage;
      checkoutError.classList.remove("hidden");
    }
    return;
  }
  
  if (pickupTimeInput && !pickupTimeInput.validity.valid) {
    if (checkoutError) {
      checkoutError.textContent = pickupTimeInput.validationMessage;
      checkoutError.classList.remove("hidden");
    }
    return;
  }
  
  if (!form) return;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const { items, totalPrice } = getCartTotals();
  if (!items.length) {
    if (checkoutError) {
      checkoutError.textContent = "העגלה ריקה. הוסיפו מוצרים לפני שליחת ההזמנה.";
      checkoutError.classList.remove("hidden");
    }
    return;
  }

  const message = buildOrderMessage({
    ...payload,
    items,
    totalPrice,
  });
  const links = buildOrderLinks(message);

  // Create order fingerprint for cross-tab duplicate detection
  const orderFingerprint = createOrderFingerprint({
    items,
    customer: payload,
    pickup_date: payload.date,
    pickup_time: payload.time,
    total: totalPrice,
  });

  // Check if this order was recently submitted (cross-tab protection)
  if (checkRecentSubmission(orderFingerprint)) {
    if (checkoutError) {
      checkoutError.textContent = "הזמנה זהה נשלחה לאחרונה. אנא רענן את הדף אם ברצונך לשלוח הזמנה נוספת.";
      checkoutError.classList.remove("hidden");
    }
    return;
  }

  // Record this submission attempt
  recordSubmission(orderFingerprint);

  // Set submitting flag and disable button
  isCheckoutSubmitting = true;
  if (checkoutSubmitButton) {
    checkoutSubmitButton.disabled = true;
    checkoutSubmitButton.textContent = "שולח...";
  }

  try {
    const orderId = generateOrderId();
    const { data: orderData, error } = await supabaseClient.from("orders").insert([
      {
        id: orderId,
        order_number: undefined, // Will be auto-generated by database trigger
        items,
        total: totalPrice,
        customer: payload,
        paid: false,
        notes: "",
        user_notes: payload.user_notes,
        pickup_date: payload.date,
        pickup_time: payload.time,
        created_at: new Date().toISOString(),
      },
    ]).select("id").single();

    if (error) {
      console.error(error);
      setCheckoutStatus(TECH_SUPPORT_MESSAGE, "error");
      return;
    }

    await insertOrderItemsForOrder(orderData?.id ?? orderId, items);

    await fetchOrders();
    closeCart();
    // Delay modal open slightly to let cart close first (iOS Safari fix)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        openOrderChannelModal(links);
      });
    });
  } finally {
    // Re-enable button and reset flag
    isCheckoutSubmitting = false;
    if (checkoutSubmitButton) {
      checkoutSubmitButton.disabled = false;
      checkoutSubmitButton.textContent = "שלח הזמנה";
    }
  }
};

const handleCreateOrder = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;

  // Prevent duplicate submissions
  if (isAdminOrderSubmitting) return;

  const name = orderName?.value.trim() || "";
  const createdAt = new Date().toISOString(); // Always use current time
  const pickupDate = orderPickupDate?.value || "";
  const pickupTime = orderPickupTime?.value || "";
  let total = Number(orderTotal?.value) || 0;
  const paid = orderPaid?.checked || false;
  const notes = orderNotes?.value.trim() || "";

  if (!name) {
    alert("יש להזין שם.");
    return;
  }

  if (!pickupDate) {
    alert("יש לבחור תאריך איסוף.");
    return;
  }

  if (!pickupTime) {
    alert("יש לבחור שעת איסוף.");
    return;
  }

  const adminItems = parseAdminOrderItems();
  const computedTotal = calculateAdminOrderTotal(adminItems);
  if (!adminOrderTotalDirty) {
    total = computedTotal;
  }
  const adminItemsDetailed = adminItems
    .map((item) => {
      const product = state.products.find((p) => String(p.id) === String(item.id));
      if (!product) return null;
      const price = getAdminProductPrice(product);
      return {
        id: product.id,
        title: product.title,
        price,
        qty: item.qty || 1,
        lineTotal: price * (item.qty || 1),
      };
    })
    .filter(Boolean);
  
  // Create order fingerprint for cross-tab duplicate detection
  const orderFingerprint = createOrderFingerprint({
    items: adminItemsDetailed,
    customer: { name },
    pickup_date: pickupDate,
    pickup_time: pickupTime,
    total,
  });

  // Check if this order was recently submitted (cross-tab protection)
  if (checkRecentSubmission(orderFingerprint)) {
    alert("הזמנה זהה נשלחה לאחרונה. אנא המתן מספר שניות ונסה שוב.");
    return;
  }

  // Record this submission attempt
  recordSubmission(orderFingerprint);
  
  // Set submitting flag and disable button
  isAdminOrderSubmitting = true;
  if (orderSave) {
    orderSave.setAttribute('disabled', 'true');
    orderSave.textContent = "שומר...";
  }

  try {
    const orderId = generateOrderId();
    const { data: orderData, error } = await supabaseClient.from("orders").insert([
      {
        id: orderId,
        order_number: undefined, // Will be auto-generated by database trigger
        items: adminItemsDetailed as any[],
        total,
        customer: { name },
        paid,
        notes,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        created_at: createdAt,
      },
    ]).select("id").single();

    if (error) {
      console.error(error);
      alert(TECH_SUPPORT_MESSAGE);
      return;
    }

    await insertOrderItemsForOrder(orderData?.id ?? orderId, adminItems, () => {
      alert(TECH_SUPPORT_MESSAGE);
    });

    if (orderName) orderName.value = "";
    if (orderDate) orderDate.value = "";
    if (orderPickupDate) orderPickupDate.value = "";
    if (orderPickupTime) orderPickupTime.value = "";
    if (orderTotal) orderTotal.value = "";
    if (orderPaid) orderPaid.checked = false;
    if (orderNotes) orderNotes.value = "";
    closeOrderModal();
    await fetchOrders();
    renderAdmin();
  } finally {
    // Re-enable button and reset flag
    isAdminOrderSubmitting = false;
    if (orderSave) {
      orderSave.removeAttribute('disabled');
      orderSave.textContent = "שמירה";
    }
  }
};

const handleAdminChange = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;

  const product = state.products.find(
    (item) => item.id === state.editingProductId
  );
  if (!product) return;

  const productId = normalizeProductId(product.id);
  if (!productId) {
    if (modalStatus) {
      modalStatus.textContent = "מזהה מוצר לא תקין. יש לרענן את הדף.";
      modalStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  const categoryId = normalizeCategoryId(
    state.editingCategoryId || modalCategoryTrigger?.dataset?.selectedId
  );
  console.log("[handleAdminChange] state.editingCategoryId:", state.editingCategoryId);
  console.log("[handleAdminChange] trigger.dataset.selectedId:", modalCategoryTrigger?.dataset?.selectedId);
  console.log("[handleAdminChange] Resolved categoryId:", categoryId);
  if (!categoryId) {
    if (modalStatus) {
      modalStatus.textContent = "יש לבחור קטגוריה.";
      modalStatus.className = "text-sm mt-2 text-rose-600";
    }
    console.error("[handleAdminChange] No valid categoryId");
    return;
  }

  const category = state.categories.find(
    (item) => item.category_id === categoryId
  );

  let imageUrl = product.image;
  if (modalImage?.files?.length && modalImage.files[0]) {
    const uploaded = await uploadProductImage(modalImage.files[0], String(product.id));
    if (uploaded) imageUrl = uploaded;
  }

  product.title = modalTitle?.value.trim() || product.title;
  product.price = Number(modalPrice?.value) || 0;
  product.categoryId = categoryId;
  product.categoryName = category?.category_name || product.categoryName || "";
  product.image = imageUrl;
  product.inStock = modalStock?.checked || false;
  const modalDiscount = document.getElementById("modal-discount") as HTMLInputElement | null;
  product.discountPercentage = modalDiscount ? Number(modalDiscount.value) || 0 : 0;

  const { error } = await supabaseClient
    .from("products")
    .update(mapProductToDb(product))
    .eq("id", productId);
  if (error) {
    console.error(error);
    if (modalStatus) {
      showTechErrorStatus(modalStatus);
    }
    return;
  }

  await fetchProducts();
  renderProducts();
  renderAdmin();
  closeModal();
};

// const generateId = (title: any) =>
//   `${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

const handleCreateProduct = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;

  const categoryId = normalizeCategoryId(state.creatingCategoryId);
  if (!categoryId) {
    alert("יש לבחור קטגוריה.");
    return;
  }

  const category = state.categories.find(
    (item) => item.category_id === categoryId
  );
  if (!createImage?.files?.length) {
    alert("יש להעלות תמונה למוצר.");
    return;
  }
  const file = createImage.files[0];
  if (!file) return;
  const uploadedUrl = await uploadProductImage(
    file,
    createTitle?.value.trim() || "product"
  );
  if (!uploadedUrl) return;
  const product = {
    title: createTitle?.value.trim() || "",
    price: Number(createPrice?.value) || 0,
    categoryId,
    categoryName: category?.category_name || "",
    image: uploadedUrl,
    inStock: true,
  };

  const { error } = await supabaseClient
    .from("products")
    .insert([mapProductToDb(product)]);

  if (error) {
    console.error(error);
    alert(TECH_SUPPORT_MESSAGE);
    return;
  }

  if (createTitle) createTitle.value = "";
  if (createPrice) createPrice.value = "";
  state.creatingCategoryId = null;
  setCategoryTriggerLabel(createCategoryTrigger, "בחר קטגוריה");
  if (createImage) createImage.value = "";
  closeCreateModal();
  await fetchProducts();
  renderProducts();
  renderAdmin();
};

const handleDeleteProduct = async (id: any) => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;

  const productId = normalizeProductId(id);
  if (!productId) {
    alert("מזהה מוצר לא תקין. יש לרענן את הדף.");
    return;
  }

  if (isMockMode()) {
    const { error } = await supabaseClient
      .from("products")
      .delete()
      .eq("id", productId);
    if (error) {
      console.error(error);
      alert(TECH_SUPPORT_MESSAGE);
      return;
    }
    await fetchProducts();
    renderProducts();
    renderAdmin();
    closeModal();
    return;
  }

  const { data: relatedOrders, error: relatedOrdersError } = await supabaseClient
    .from("order_items")
    .select("order_id, orders(paid, deleted)")
    .eq("product_id", productId);

  if (relatedOrdersError) {
    console.error(relatedOrdersError);
    alert(TECH_SUPPORT_MESSAGE);
    return;
  }

  const hasUnpaidOrder = (relatedOrders || []).some((row: any) => {
    const order = Array.isArray(row.orders) ? row.orders[0] : row.orders;
    return order && order.paid !== true && !order.deleted;
  });

  if (hasUnpaidOrder) {
    alert("לא ניתן למחוק מוצר שיש לו הזמנה שלא שולמה.");
    return;
  }

  const { error } = await supabaseClient
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) {
    console.error(error);
    alert(TECH_SUPPORT_MESSAGE);
    return;
  }
  await fetchProducts();
  renderProducts();
  renderAdmin();
  closeModal();
};

const handleAdminLogin = async (event: Event) => {
  event.preventDefault();
  if (!ensureSupabase()) return;

  adminAuthErrorEl?.classList.add("hidden");
  const formData = new FormData(event.target as HTMLFormElement);
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error, data } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    adminAuthErrorEl && (adminAuthErrorEl.textContent = "פרטי ההתחברות שגויים.");
    adminAuthErrorEl?.classList.remove("hidden");
    return;
  }

  state.session = data.session;
  await fetchProfile();
  if (state.role !== "admin") {
    adminAuthErrorEl && (adminAuthErrorEl.textContent = "אין הרשאות ניהול לחשבון זה.");
    adminAuthErrorEl?.classList.remove("hidden");
    await supabaseClient.auth.signOut();
    state.session = null;
    state.role = null;
    setAdminUI(false);
    return;
  }

  adminGreetingEl && (adminGreetingEl.textContent = `Hello ${state.session.user.email}`);

  setAdminUI(true);
  setAdminView(state.adminView === "manage" ? "manage" : "stats");
  await fetchOrders();
  renderAdmin();
};

const handleLogout = async () => {
  if (!ensureSupabase()) return;
  await supabaseClient.auth.signOut();
  state.session = null;
  state.role = null;
  adminGreetingEl && (adminGreetingEl.textContent = "");
  setAdminUI(false);
};

const fetchProducts = async () => {
  if (!ensureSupabase()) return;

  const { data, error } = await supabaseClient
    .from("products")
    .select("id,title,price,discount_percentage,image,in_stock,category_id")
    .order("id", { ascending: true });

  console.log("[fetchProducts] data:", data);

  if (error) {
    console.error("[fetchProducts] error:", error);
    state.products = [];
    return;
  }

  if (!data || data.length === 0) {
    state.products = [];
    ensureCategoryOptions();
    renderCategoryCarousel();
    return;
  }

  state.products = data.map(mapDbToProduct);
  renderCategoryCarousel();

};

const fetchCategories = async () => {
  if (!ensureSupabase()) {
    console.log("[fetchCategories] Supabase not configured, skipping");
    return;
  }
  console.log("[fetchCategories] Fetching from database...");
  const { data, error } = await supabaseClient
    .from("categories")
    .select("id,name,image_url");

  if (error) {
    console.error("[fetchCategories] Error:", error);
    state.categories = [];
    return;
  }

  console.log("[fetchCategories] Fetched raw data:", data);
  state.categories = (data || []).map((item: any) => ({
    category_id: item.id,
    category_name: item.name,
    image_url: item.image_url || "",
  }));
  console.log("[fetchCategories] Mapped categories:", state.categories);
  ensureCategoryOptions();
  renderCategoryCarousel();
};

const fetchSiteMeta = async () => {
  if (!ensureSupabase()) {
    setAboutContent(DEFAULT_ABOUT);
    return;
  }
  const { data, error } = await supabaseClient
    .from("site_metadata")
    .select("*")
    .limit(1);

  if (error) {
    console.error(error);
    setAboutContent(DEFAULT_ABOUT);
    updateContactBakeryPhone(CONTACT_PHONE);
    updateContactStorePhone(CONTACT_PHONE);
    updateContactWhatsapp(CONTACT_PHONE);
    updateContactEmail(CONTACT_EMAIL);
    return;
  }

  if (!data || !data.length) {
    setAboutContent(DEFAULT_ABOUT);
    state.siteMetaId = null;
    updateContactBakeryPhone(CONTACT_PHONE);
    updateContactStorePhone(CONTACT_PHONE);
    updateContactWhatsapp(CONTACT_PHONE);
    updateContactEmail(CONTACT_EMAIL);
    return;
  }

  state.siteMetaId = data[0].id;
  setAboutContent(data[0].about_section || DEFAULT_ABOUT);
  
  // Set orders accepting state
  state.ordersAccepting = data[0].orders_accepting !== false; // Default to true
  if (ordersAcceptingToggle) {
    ordersAcceptingToggle && (ordersAcceptingToggle.checked = state.ordersAccepting);
  }
  if (ordersAcceptingLabel) {
    ordersAcceptingLabel.textContent = state.ordersAccepting ? 'פתוח' : 'סגור';
  }
  updateCheckoutFormVisibility();
  
  // Update logo if URL exists in database, otherwise ensure default logo is visible
  if (data[0].logo_url) {
    console.log("[fetchSiteMeta] Setting logo from DB:", data[0].logo_url);
    setLogo(data[0].logo_url);
  } else {
    console.log("[fetchSiteMeta] No logo_url in DB, keeping default");
  }
  
  // Set admin inputs with fetched values (only for existing columns)
  if (adminContactBakeryPhoneInput) {
    adminContactBakeryPhoneInput && (adminContactBakeryPhoneInput.value = data[0].bakery_telephone || "");
  }
  if (adminContactStorePhoneInput) {
    adminContactStorePhoneInput && (adminContactStorePhoneInput.value = data[0].store_phone || "");
  }
  if (adminContactWhatsappInput) {
    // Strip the + prefix for display in admin input
    const whatsappValue = data[0].contact_whatsapp || "";
    adminContactWhatsappInput && (adminContactWhatsappInput.value = whatsappValue.startsWith('+') ? whatsappValue.substring(1) : whatsappValue);
  }
  if (adminContactEmailInput) {
    adminContactEmailInput && (adminContactEmailInput.value = data[0].contact_email || "");
  }
  if (adminContactAddressInput) {
    adminContactAddressInput && (adminContactAddressInput.value = data[0].contact_address || "");
  }
  
  // Load hero fields if they exist
  if (adminHeroBadgeInput && data[0].hero_badge) {
    adminHeroBadgeInput && (adminHeroBadgeInput.value = data[0].hero_badge);
    state.heroBadge = data[0].hero_badge;
    const heroBadge = document.getElementById("hero-badge");
    if (heroBadge) {
      heroBadge.textContent = data[0].hero_badge;
    }
  }
  if (adminHeroTitleInput && data[0].hero_title) {
    adminHeroTitleInput && (adminHeroTitleInput.value = data[0].hero_title);
    state.heroTitle = data[0].hero_title;
    const heroTitle = document.querySelector("#hero h2");
    if (heroTitle) {
      heroTitle.textContent = data[0].hero_title;
    }
  }
  if (adminHeroDescriptionInput && data[0].hero_description) {
    adminHeroDescriptionInput && (adminHeroDescriptionInput.value = data[0].hero_description);
    state.heroDescription = data[0].hero_description;
    const heroDesc = document.getElementById("hero-description");
    if (heroDesc) {
      heroDesc.textContent = data[0].hero_description;
    }
  }
  if (data[0].hero_chips) {
    state.heroChips = Array.isArray(data[0].hero_chips) ? data[0].hero_chips : [];
    renderHeroChipsAdmin();
    renderHeroChipsDisplay();
  }
  if (data[0].hero_image_url) {
    state.heroImageUrl = data[0].hero_image_url;
    if (adminHeroImagePreview) {
      adminHeroImagePreview.innerHTML = `
        <img src="${data[0].hero_image_url}" alt="תצוגה מקדימה" class="max-h-32 rounded" />
      `;
    }
    const heroImage = document.getElementById("hero-image") as HTMLImageElement | null;
    if (heroImage) {
      heroImage.src = data[0].hero_image_url;
    }
  }
  
  // Update contact display
  if (data[0].bakery_telephone) {
    updateContactBakeryPhone(data[0].bakery_telephone);
  }
  if (data[0].store_phone) {
    updateContactStorePhone(data[0].store_phone);
  } else {
    updateContactStorePhone(CONTACT_PHONE);
  }
  if (data[0].contact_whatsapp) {
    updateContactWhatsapp(data[0].contact_whatsapp);
  }
  if (data[0].contact_email) {
    updateContactEmail(data[0].contact_email);
  }
  if (data[0].contact_address) {
    updateContactAddress(data[0].contact_address);
  }

};

const updateOrdersAccepting = async (accepting: boolean) => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  
  state.ordersAccepting = accepting;
  
  if (!state.siteMetaId) {
    console.error("[updateOrdersAccepting] No site_metadata ID");
    return;
  }
  
  const { error } = await supabaseClient
    .from("site_metadata")
    .update({ orders_accepting: accepting })
    .eq("id", state.siteMetaId);
  
  if (error) {
    console.error("[updateOrdersAccepting] Error:", error);
    alert(TECH_SUPPORT_MESSAGE);
    // Revert toggle
    if (ordersAcceptingToggle) {
      ordersAcceptingToggle.checked = !accepting;
    }
    state.ordersAccepting = !accepting;
    return;
  }
  
  console.log("[updateOrdersAccepting] Updated to:", accepting);
  updateCheckoutFormVisibility();
};

const updateCheckoutFormVisibility = () => {
  if (!checkoutForm) return;
  
  if (state.ordersAccepting) {
    checkoutForm.classList.remove('opacity-50', 'pointer-events-none');
    if (checkoutError) {
      checkoutError.textContent = "";
      checkoutError.classList.add("hidden");
    }
  } else {
    checkoutForm.classList.add('opacity-50', 'pointer-events-none');
    if (checkoutError) {
      checkoutError.textContent = "מצטערים, כרגע איננו מקבלים הזמנות חדשות.";
      checkoutError.classList.remove("hidden");
    }
  }
};

const saveAboutContent = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  if (adminAboutStatus) {
    adminAboutStatus.textContent = "שומר...";
    adminAboutStatus.className = "text-sm mt-2 text-stone-500";
  }
  const text = adminAboutInput?.value.trim() || DEFAULT_ABOUT;
  if (!text) {
    alert("יש להזין טקסט אודות.");
    if (adminAboutStatus) {
      adminAboutStatus.textContent = "שגיאה: נא להזין טקסט אודות.";
      adminAboutStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  const payload = { about_section: text };
  let error;
  if (state.siteMetaId) {
    ({ error } = await supabaseClient
      .from("site_metadata")
      .update(payload)
      .eq("id", state.siteMetaId));
  } else {
    ({ error } = await supabaseClient.from("site_metadata").insert([payload]));
  }

  if (error) {
    console.error(error);
    alert(TECH_SUPPORT_MESSAGE);
    if (adminAboutStatus) {
      showTechErrorStatus(adminAboutStatus);
    }
    return;
  }

  await fetchSiteMeta();
  if (adminAboutStatus) {
    adminAboutStatus.textContent = "נשמר בהצלחה ✓";
    adminAboutStatus.className = "text-sm mt-2 text-green-600";
  }
};

const setLogo = (url: string) => {
  if (siteLogoEl) {
    siteLogoEl.src = url;
  }
  if (adminLogoPreview) {
    adminLogoPreview.src = url;
  }
};

const uploadLogoImage = async (file: File) => {
  if (!file) return null;
  if (!ensureSupabase()) return null;
  
  const ext = file.name.split(".").pop();
  const fileName = `logo-${Date.now()}.${ext}`;
  const filePath = `logos/${fileName}`;

  const { error } = await supabaseClient
    .storage
    .from("product-images")
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error(error);
    alert(TECH_SUPPORT_MESSAGE);
    return null;
  }

  const { data } = supabaseClient.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

const uploadHeroImage = async (file: File) => {
  if (!file) return null;
  if (!ensureSupabase()) return null;
  
  const ext = file.name.split(".").pop();
  const fileName = `hero-${Date.now()}.${ext}`;
  const filePath = `hero-images/${fileName}`;

  const { error } = await supabaseClient
    .storage
    .from("product-images")
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error(error);
    alert(TECH_SUPPORT_MESSAGE);
    return null;
  }

  const { data } = supabaseClient.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

const saveHeroImage = async (file: File) => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  
  if (!file) {
    alert("יש לבחור קובץ תמונה.");
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert("יש לבחור קובץ תמונה בלבד.");
    return;
  }

  const heroImageUrl = await uploadHeroImage(file);
  if (!heroImageUrl) {
    return;
  }

  state.heroImageUrl = heroImageUrl;
  
  // Show preview
  if (adminHeroImagePreview) {
    adminHeroImagePreview.innerHTML = `
      <img src="${heroImageUrl}" alt="תצוגה מקדימה" class="max-h-32 rounded" />
    `;
  }
  
  // Clear the file input
  if (adminHeroImageFile) {
    adminHeroImageFile.value = "";
  }
};

const saveLogoImage = async (file: File) => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  
  if (!file) {
    alert("יש לבחור קובץ תמונה.");
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert("יש לבחור קובץ תמונה בלבד.");
    return;
  }

  const logoUrl = await uploadLogoImage(file);
  if (!logoUrl) {
    return;
  }

  const payload = { logo_url: logoUrl };
  let error;
  
  if (state.siteMetaId) {
    ({ error } = await supabaseClient
      .from("site_metadata")
      .update(payload)
      .eq("id", state.siteMetaId));
  } else {
    ({ error } = await supabaseClient.from("site_metadata").insert([payload]));
  }

  if (error) {
    console.error(error);
    alert(TECH_SUPPORT_MESSAGE);
    return;
  }

  setLogo(logoUrl);
  await fetchSiteMeta();
  
  alert("הלוגו נשמר בהצלחה!");
  
  // Clear the file input
  if (adminLogoInput) adminLogoInput.value = "";
};

// const updateContactPhone = (phone: any) => {
//   // contactPhone display is now handled by updateContactBakeryPhone
//   // This function kept for backward compatibility
// };

const updateContactBakeryPhone = (phone: string) => {
  const safePhone = phone || CONTACT_PHONE;
  state.bakeryPhone = safePhone;
  if (contactBakeryPhoneEl) {
    contactBakeryPhoneEl.textContent = safePhone;
  }
  if (contactBakeryPhoneLinkEl) {
    contactBakeryPhoneLinkEl.href = `tel:${safePhone}`;
  }
};

const updateContactStorePhone = (phone: string) => {
  const safePhone = phone || CONTACT_PHONE;
  state.storePhone = safePhone;
  if (contactStorePhoneEl) {
    contactStorePhoneEl.textContent = safePhone;
  }
  if (contactStorePhoneLinkEl) {
    contactStorePhoneLinkEl.href = `tel:${safePhone}`;
  }
};

const updateContactWhatsapp = (whatsapp: string) => {
  if (!whatsapp) {
    state.checkoutWhatsappPhone = DEFAULT_WHATSAPP_PHONE;
    return;
  }
  // Remove all non-digit characters
  const cleanPhone = whatsapp.replace(/\D/g, '');
  
  let numberOnly = cleanPhone;
  if (cleanPhone.startsWith('972')) {
    numberOnly = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('0')) {
    numberOnly = cleanPhone.substring(1);
  }
  const waPhone = `972${numberOnly}`;
  const displayPhone = `0${numberOnly}`;
  state.checkoutWhatsappPhone = waPhone || DEFAULT_WHATSAPP_PHONE;
  
  if (contactWhatsappPhoneEl) {
    contactWhatsappPhoneEl.textContent = displayPhone;
  }
  if (contactWhatsappEl) {
    const encodedMessage = encodeURIComponent("שלום, אני מעוניין להזמין");
    contactWhatsappEl.href = `https://wa.me/${waPhone}?text=${encodedMessage}`;
  }
};

const updateContactEmail = (email: string) => {
  state.checkoutEmail = email || DEFAULT_ORDER_EMAIL;
  if (contactEmailEl) {
    contactEmailEl.href = `mailto:${email}`;
  }
  if (contactEmailTextEl) {
    contactEmailTextEl.textContent = email;
  }
};

const updateContactAddress = (address: string) => {
  if (contactAddressEl) {
    contactAddressEl.textContent = address;
  }
  if (contactAddressLinkEl) {
    // Detect device/OS and use appropriate maps URL
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    let mapsUrl;
    
    if (isIOS || isAndroid) {
      // Mobile (both iOS and Android): Use Waze URL as first option
      mapsUrl = `https://waze.com/ul?q=${encodeURIComponent(address)}`;
    } else {
      // Desktop: Use Google Maps which opens in browser
      mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
    }
    
    contactAddressLinkEl.href = mapsUrl;
  }
};

const saveHeaderTitle = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  if (adminHeaderTitleStatus) {
    adminHeaderTitleStatus.textContent = "שומר...";
    adminHeaderTitleStatus.className = "text-sm mt-2 text-stone-500";
  }
  
  const title = adminHeaderTitleInput?.value.trim() || "";
  if (!title) {
    alert("יש להזין כותרת.");
    if (adminHeaderTitleStatus) {
      adminHeaderTitleStatus.textContent = "שגיאה: נא להזין כותרת.";
      adminHeaderTitleStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  const payload = { header_title: title };
  let error;
  if (state.siteMetaId) {
    ({ error } = await supabaseClient
      .from("site_metadata")
      .update(payload)
      .eq("id", state.siteMetaId));
  } else {
    ({ error } = await supabaseClient.from("site_metadata").insert([payload]));
  }

  if (error) {
    console.error(error);
    if (adminHeaderTitleStatus) {
      showTechErrorStatus(adminHeaderTitleStatus);
    }
    return;
  }

  if (adminHeaderTitleStatus) {
    adminHeaderTitleStatus.textContent = "נשמר בהצלחה ✓";
    adminHeaderTitleStatus.className = "text-sm mt-2 text-green-600";
  }
  
  // Update header description on page
  const headerDesc = document.getElementById("header-description");
  if (headerDesc) {
    headerDesc.textContent = title;
  }
  
  await fetchSiteMeta();
};

const saveHero = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  if (adminHeroStatus) {
    adminHeroStatus.textContent = "שומר...";
    adminHeroStatus.className = "text-sm mt-2 text-stone-500";
  }
  
  const badge = adminHeroBadgeInput ? adminHeroBadgeInput.value.trim() : "";
  const title = adminHeroTitleInput?.value.trim() || "";
  const description = adminHeroDescriptionInput?.value.trim() || "";
  const imageUrl = state.heroImageUrl;
  
  // Collect chip values from dynamic inputs
  const chips = Array.from(document.querySelectorAll(".hero-chip-input"))
    .map((input) => (input as HTMLInputElement).value.trim())
    .filter((chip) => chip.length > 0);
  
  if (!title || !description) {
    alert("יש למלא לפחות כותרת ותיאור.");
    if (adminHeroStatus) {
      adminHeroStatus.textContent = "שגיאה: נא למלא לפחות כותרת ותיאור.";
      adminHeroStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  const payload: any = {
    hero_title: title,
    hero_description: description,
    hero_chips: chips,
    hero_image_url: imageUrl,
  };

  if (adminHeroBadgeInput) {
    payload.hero_badge = badge;
  }
  
  let error;
  if (state.siteMetaId) {
    ({ error } = await supabaseClient
      .from("site_metadata")
      .update(payload)
      .eq("id", state.siteMetaId));
  } else {
    ({ error } = await supabaseClient.from("site_metadata").insert([payload]));
  }

  if (error) {
    console.error(error);
    if (adminHeroStatus) {
      showTechErrorStatus(adminHeroStatus);
    }
    return;
  }

  // Update the hero elements on page immediately
  if (adminHeroBadgeInput) {
    const heroBadge = document.getElementById("hero-badge");
    if (heroBadge && badge) {
      heroBadge.textContent = badge;
    }
  }
  
  const heroTitle = document.querySelector("#hero h2");
  if (heroTitle) {
    heroTitle.textContent = title;
  }
  
  const heroDesc = document.getElementById("hero-description");
  if (heroDesc) {
    heroDesc.textContent = description;
  }
  
  renderHeroChipsDisplay();
  
  const heroImage = document.getElementById("hero-image") as HTMLImageElement | null;
  if (heroImage && imageUrl) {
    heroImage.src = imageUrl;
  }
  
  if (adminHeroStatus) {
    adminHeroStatus.textContent = "נשמר בהצלחה ✓";
    adminHeroStatus.className = "text-sm mt-2 text-green-600";
  }
  await fetchSiteMeta();
};

const renderHeroChipsAdmin = () => {
  if (!adminHeroChipsContainer) return;
  adminHeroChipsContainer.innerHTML = "";
  
  state.heroChips.forEach((chip, index) => {
    const chipDiv = document.createElement("div");
    chipDiv.className = "flex gap-2 items-center";
    chipDiv.innerHTML = `
      <input 
        type="text" 
        class="form-input flex-1 hero-chip-input" 
        data-index="${index}"
        value="${chip}"
        placeholder="הקלד תיאור"
      />
      <button type="button" class="remove-chip-btn text-red-600 hover:text-red-800" data-index="${index}">
        ✕
      </button>
    `;
    adminHeroChipsContainer.appendChild(chipDiv);
    
    const input = chipDiv.querySelector(".hero-chip-input") as HTMLInputElement | null;
    if (input) {
      input.addEventListener("input", (e) => {
        state.heroChips[index] = (e.target as HTMLInputElement).value;
      });
    }
    
    const removeBtn = chipDiv.querySelector(".remove-chip-btn");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        state.heroChips.splice(index, 1);
        renderHeroChipsAdmin();
      });
    }
  });
};

const renderHeroChipsDisplay = () => {
  const heroChipsEl = document.getElementById("hero-chips");
  if (!heroChipsEl) return;
  heroChipsEl.innerHTML = "";
  
  state.heroChips.forEach((chipText) => {
    const span = document.createElement("span");
    span.className = "info-chip flex items-center gap-2";
    span.innerHTML = `
      <i data-lucide="sparkles" class="w-4 h-4"></i>
      ${chipText}
    `;
    heroChipsEl.appendChild(span);
  });
  
  if ((window as any).lucide) {
    (window as any).lucide.createIcons();
  }
};

const saveContactInfo = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  
  console.log("[saveContactInfo] Starting save operation");
  
  if (adminContactStatus) {
    adminContactStatus.textContent = "שומר...";
    adminContactStatus.className = "text-sm mt-2 text-stone-500";
  }

  const bakeryPhone = adminContactBakeryPhoneInput?.value.trim() || "";
  const storePhone = adminContactStorePhoneInput
    ? adminContactStorePhoneInput.value.trim()
    : bakeryPhone;
  let whatsapp = adminContactWhatsappInput?.value.trim() || "";
  const email = adminContactEmailInput?.value.trim() || "";
  const address = adminContactAddressInput?.value.trim() || "";

  console.log("[saveContactInfo] Form values:", { bakeryPhone, storePhone, whatsapp, email, address });

  if (!bakeryPhone || !storePhone || !whatsapp || !email || !address) {
    alert("יש למלא את כל השדות.");
    if (adminContactStatus) {
      adminContactStatus.textContent = "שגיאה: יש למלא את כל השדות.";
      adminContactStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  // Normalize WhatsApp number: remove all non-digits and add + prefix
  whatsapp = '+' + whatsapp.replace(/\D/g, '');
  console.log("[saveContactInfo] Normalized whatsapp:", whatsapp);

  const payload = {
    bakery_telephone: bakeryPhone,
    store_phone: storePhone,
    contact_whatsapp: whatsapp,
    contact_email: email,
    contact_address: address,
  };
  
  console.log("[saveContactInfo] Payload:", payload);
  
  let error;
  try {
    if (state.siteMetaId) {
      console.log("[saveContactInfo] Updating existing record with ID:", state.siteMetaId);
      ({ error } = await supabaseClient
        .from("site_metadata")
        .update(payload)
        .eq("id", state.siteMetaId));
    } else {
      console.log("[saveContactInfo] Inserting new record");
      ({ error } = await supabaseClient.from("site_metadata").insert([payload]));
    }
  } catch (err) {
    console.error("[saveContactInfo] Exception during database operation:", err);
    error = err;
  }

  if (error) {
    console.error("[saveContactInfo] Database error:", error);
    if (adminContactStatus) {
      showTechErrorStatus(adminContactStatus);
    }
    return;
  }

  console.log("[saveContactInfo] Save successful, updating UI");
  
  updateContactBakeryPhone(bakeryPhone);
  updateContactStorePhone(storePhone);
  updateContactWhatsapp(whatsapp);
  updateContactEmail(email);
  updateContactAddress(address);

  if (adminContactStatus) {
    adminContactStatus.textContent = "נשמר בהצלחה ✓";
    adminContactStatus.className = "text-sm mt-2 text-green-600";
  }
  
  console.log("[saveContactInfo] UI updated, fetching latest data");
  await fetchSiteMeta();
};

// @ts-expect-error - Function declared for future use
const _fetchFeaturedProducts = async () => {
  if (!ensureSupabase()) return;
  if (!state.siteMetaId) {
    console.warn("[fetchFeaturedProducts] No siteMetaId set");
    state.featuredProductIds = [];
    return;
  }

  const { data, error } = await supabaseClient
    .from("featured_products")
    .select("product_id")
    .eq("site_metadata_id", state.siteMetaId);

  if (error) {
    console.error(error);
    state.featuredProductIds = [];
    return;
  }

  state.featuredProductIds = (data || []).map((item: any) => item.product_id);
};

const fetchOrders = async () => {
  if (!ensureSupabase()) return;

  let { data, error } = isMockMode()
    ? await supabaseClient
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
    : await supabaseClient
        .from("orders")
        .select("*, order_items(order_id, product_id, qty, products(id,title,price,discount_percentage,image,in_stock,category_id))")
        .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    ({ data, error } = await supabaseClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false }));
  }

  if (error) {
    console.error(error);
    return;
  }

  state.orders = data || [];
};

const fetchProfile = async () => {
  if (!ensureSupabase()) return;
  if (!state.session) return;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("user_id", state.session.user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  state.role = data?.role || null;
};

const openAdminIfSession = async () => {
  if (!ensureSupabase()) return;
  const { data } = await supabaseClient.auth.getSession();
  state.session = data.session;
  if (!state.session) {
    setAdminUI(false);
    return;
  }

  await fetchProfile();
  const isAdmin = state.role === "admin";
  setAdminUI(isAdmin);
  if (isAdmin) {
    adminGreetingEl && (adminGreetingEl.textContent = `Hello ${state.session.user.email}`);
    await fetchOrders();
    setAdminView(state.adminView === "manage" ? "manage" : "stats");
    renderAdmin();
  }
};

const updateOrderField = async (id: any, field: string, value: any) => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  const { error } = await supabaseClient
    .from("orders")
    .update({ [field]: value })
    .eq("id", id);
  if (error) {
    console.error(error);
    return;
  }
  await fetchOrders();
  renderAdmin();
};

const showOrderDetails = (order: any) => {
  const relatedItems = Array.isArray(order.order_items) ? order.order_items : [];
  const items = (relatedItems.length ? relatedItems : (order.items || []))
    .map((item: any) => {
      const relatedProduct = Array.isArray(item.products)
        ? item.products[0]
        : item.products;
      const title = relatedProduct?.title || item.title || "";
      const qty = item.qty || 1;
      return `${title} x ${qty}`;
    })
    .join("<br />");
  if (orderDetailsContent) {
    orderDetailsContent.innerHTML = `
      <div><strong>מזהה הזמנה:</strong> ${order.order_number ?? order.id ?? ""}</div>
      <div><strong>שם:</strong> ${order.customer?.name || ""}</div>
      <div><strong>טלפון:</strong> ${order.customer?.phone || ""}</div>
      <div><strong>תאריך:</strong> ${new Date(order.created_at).toLocaleString(
        "he-IL",
        { hour12: false }
      )}</div>
      <div><strong>סכום:</strong> ${formatCurrency(order.total)}</div>
      <div><strong>שולם:</strong> ${order.paid ? "כן" : "לא"}</div>
      <div><strong>הערות מנהל:</strong> ${order.notes || "-"}</div>
      <div><strong>הערות לקוח:</strong> ${order.user_notes || "-"}</div>
      <div><strong>פריטים:</strong><br />${items || "-"}</div>
    `;
  }
  orderDetailsModal?.classList.remove("hidden");
};

const openModal = (product: any) => {
  console.log("[openModal] Opening for product:", product);
  state.editingProductId = product.id;
  if (modalTitle) modalTitle.value = product.title;
  if (modalPrice) modalPrice.value = product.price;
  const modalDiscount = document.getElementById("modal-discount") as HTMLInputElement | null;
  if (modalDiscount) {
    modalDiscount.value = String(product.discountPercentage || 0);
  }
  const initialCategoryId = normalizeCategoryId(product.categoryId);
  console.log("[openModal] After normalizeProductId, initialCategoryId:", initialCategoryId);
  if (initialCategoryId) {
    state.editingCategoryId = String(initialCategoryId);
    console.log("[openModal] Using normalizedId, set state.editingCategoryId:", initialCategoryId);
  } else if (product.categoryName || product.category) {
    const match = state.categories.find(
      (item) => item.category_name === (product.categoryName || product.category)
    );
    state.editingCategoryId = match ? String(match.category_id) : null;
    console.log("[openModal] Looked up by name, state.editingCategoryId:", state.editingCategoryId);
  } else {
    state.editingCategoryId = null;
    console.log("[openModal] No category info, set state.editingCategoryId to null");
  }
  ensureCategoryOptions();
  console.log("[openModal] Before setCategoryTriggerLabel, state.editingCategoryId:", state.editingCategoryId);
  setCategoryTriggerLabel(
    modalCategoryTrigger,
    getCategoryLabel(product),
    state.editingCategoryId
  );
  if (modalImage) modalImage.value = "";
  if (modalStock) modalStock.checked = product.inStock;
  if (modalStatus) {
    modalStatus.textContent = "";
    modalStatus.className = "text-sm mt-2";
  }
  productModal?.classList.remove("hidden");
};

const closeModal = () => {
  productModal?.classList.add("hidden");
  state.editingProductId = null;
};

const openCreateProductModal = () => {
  if (!state.creatingCategoryId && state.categories.length && state.categories[0]) {
    state.creatingCategoryId = String(state.categories[0].category_id);
    setCategoryTriggerLabel(
      createCategoryTrigger,
      state.categories[0].category_name,
      state.categories[0].category_id
    );
  }
  ensureCategoryOptions();
  createModal?.classList.remove("hidden");
};

const openCategoryModal = () => {
  categoryModal?.classList.remove("hidden");
  if (categoryStatus) {
    categoryStatus.textContent = "";
    categoryStatus.className = "text-sm mt-2";
  }
};

const closeCategoryModal = () => {
  categoryModal?.classList.add("hidden");
};

const openCategoryEditModal = (category: any) => {
  if (!categoryEditModal) return;
  state.editingCategoryRowId = category.category_id;
  if (categoryEditNameInput) categoryEditNameInput.value = category.category_name;
  if (categoryEditImageInput) {
    categoryEditImageInput.value = "";
  }
  if (categoryEditPreview) {
    const previewSrc = category.image_url ? (category.image_url.startsWith('assets/') ? category.image_url.substring(7) : category.image_url) : "all_categories.png";
    categoryEditPreview.innerHTML = `
      <img src="${previewSrc}" alt="${category.category_name}" class="admin-category-image" />
    `;
  }
  if (categoryEditStatus) {
    categoryEditStatus.textContent = "";
    categoryEditStatus.className = "text-sm mt-2";
  }
  categoryEditModal.classList.remove("hidden");
};

const closeCategoryEditModal = () => {
  if (!categoryEditModal) return;
  categoryEditModal.classList.add("hidden");
  state.editingCategoryRowId = null;
  if (categoryEditStatus) {
    categoryEditStatus.textContent = "";
    categoryEditStatus.className = "text-sm mt-2";
  }
};

const handleUpdateCategory = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  if (!state.editingCategoryRowId) return;

  const name = categoryEditNameInput?.value.trim() || "";
  if (!name) {
    if (categoryEditStatus) {
      categoryEditStatus.textContent = "יש להזין שם קטגוריה.";
      categoryEditStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  const duplicate = state.categories.some(
    (category) =>
      category.category_name === name &&
      String(category.category_id) !== String(state.editingCategoryRowId)
  );
  if (duplicate) {
    if (categoryEditStatus) {
      categoryEditStatus.textContent = "הקטגוריה כבר קיימת.";
      categoryEditStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  if (categoryEditStatus) {
    categoryEditStatus.textContent = "שומר...";
    categoryEditStatus.className = "text-sm mt-2 text-stone-500";
  }

  const category = state.categories.find(
    (item) => String(item.category_id) === String(state.editingCategoryRowId)
  );
  let imageUrl = category?.image_url ? (category.image_url.startsWith('assets/') ? category.image_url.substring(7) : category.image_url) : "all_categories.png";
  if (categoryEditImageInput?.files?.length) {
    const file = categoryEditImageInput.files[0];
    if (!file) return;
    const uploadedUrl = await uploadCategoryImage(file, name || "category");
    if (!uploadedUrl) {
      if (categoryEditStatus) {
        showTechErrorStatus(categoryEditStatus);
      }
      return;
    }
    imageUrl = uploadedUrl;
  }

  const updateData = { name, image_url: imageUrl };
  console.log("[handleUpdateCategory] Attempting update:", {
    categoryId: state.editingCategoryRowId,
    updateData: updateData,
    currentCategory: category
  });

  const { data, error, count } = await supabaseClient
    .from("categories")
    .update(updateData)
    .eq("id", state.editingCategoryRowId)
    .select();

  console.log("[handleUpdateCategory] Update response:", { data, error, count, rowsAffected: data?.length });

  if (error) {
    console.error("[handleUpdateCategory] Update failed:", error);
    console.error("[handleUpdateCategory] Error details:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    
    // Check for RLS policy error
    if (error.code === 'PGRST301' || error.message?.includes('policy')) {
      alert('שגיאת הרשאות: נא לוודא שמדיניות RLS מוגדרת בטבלת categories. ראה את קובץ ההגירה: migrations/001_categories_table_and_policies.sql');
    } else {
      alert(TECH_SUPPORT_MESSAGE);
    }
    
    if (categoryEditStatus) {
      showTechErrorStatus(categoryEditStatus);
    }
    return;
  }

  if (!data || data.length === 0) {
    console.error("[handleUpdateCategory] No rows updated! Category ID not found:", state.editingCategoryRowId);
    alert('שגיאה: הקטגוריה לא נמצאה. ייתכן שהיא נמחקה על ידי משתמש אחר.');
    if (categoryEditStatus) {
      categoryEditStatus.textContent = "הקטגוריה לא נמצאה";
      categoryEditStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  console.log("[handleUpdateCategory] Successfully updated category", state.editingCategoryRowId, "New data:", data[0]);

  await fetchCategories();
  renderAdmin();
  renderCategoryCarousel();
  closeCategoryEditModal();
};

const handleCreateCategory = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  const name = categoryNameInput?.value.trim() || "";
  if (!name) {
    if (categoryStatus) {
      categoryStatus.textContent = "יש להזין שם קטגוריה.";
      categoryStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }
  const duplicate = state.categories.some(
    (category) => category.category_name === name
  );
  if (duplicate) {
    if (categoryStatus) {
      categoryStatus.textContent = "הקטגוריה כבר קיימת.";
      categoryStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }
  if (categoryStatus) {
    categoryStatus.textContent = "שומר...";
    categoryStatus.className = "text-sm mt-2 text-stone-500";
  }

  let imageUrl = "all_categories.png";
  if (categoryImageInput?.files?.length) {
    const file = categoryImageInput.files[0];
    if (!file) return;
    const uploadedUrl = await uploadCategoryImage(file, name || "category");
    if (!uploadedUrl) {
      if (categoryStatus) {
        showTechErrorStatus(categoryStatus);
      }
      return;
    }
    imageUrl = uploadedUrl;
  }
  const { error } = await supabaseClient.from("categories").insert([
    { name, image_url: imageUrl },
  ]);
  if (error) {
    console.error(error);
    if (categoryStatus) {
      showTechErrorStatus(categoryStatus);
    }
    return;
  }
  if (categoryNameInput) categoryNameInput.value = "";
  if (categoryImageInput) {
    categoryImageInput.value = "";
  }
  if (categoryStatus) {
    categoryStatus.textContent = "נשמר בהצלחה ✓";
    categoryStatus.className = "text-sm mt-2 text-green-600";
  }
  closeCategoryModal();
  await fetchCategories();
  ensureCategoryOptions();
  renderAdmin();
  renderCategoryCarousel();
};

const handleDeleteCategory = async (categoryId: any) => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  const normalizedId = Number(categoryId);
  if (!Number.isFinite(normalizedId)) {
    alert("מזהה קטגוריה לא תקין. יש לרענן את הדף.");
    return;
  }

  const hasActiveProducts = state.products.some(
    (product) =>
      String(product.categoryId) === String(normalizedId) && product.inStock
  );
  if (hasActiveProducts) {
    alert("אי אפשר למחוק קטגוריה שמקושרת למוצרים פעילים");
    return;
  }

  const category = state.categories.find(
    (item) => String(item.category_id) === String(normalizedId)
  );
  const categoryName = category?.category_name || "";
  
  console.log("[handleDeleteCategory] Opening delete confirmation for category:", { id: normalizedId, name: categoryName });
  
  // Open confirmation modal instead of using window.confirm
  openDeleteConfirm('category', normalizedId, categoryName);
};

const confirmDeleteCategory = async () => {
  const normalizedId = state.pendingDeleteId;
  console.log("[confirmDeleteCategory] Confirming deletion for category ID:", normalizedId, "Type:", typeof normalizedId);
  
  if (!normalizedId) {
    console.error("[confirmDeleteCategory] No pending delete ID");
    return;
  }
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;

  const { data, error, count } = await supabaseClient
    .from("categories")
    .delete()
    .eq("id", normalizedId)
    .select();
    
  console.log("[confirmDeleteCategory] Delete response:", { data, error, count, rowsAffected: data?.length });
    
  if (error) {
    console.error("[confirmDeleteCategory] Delete failed:", error);
    console.error("[confirmDeleteCategory] Error details:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    
    // Check for RLS policy error
    if (error.code === 'PGRST301' || error.message?.includes('policy')) {
      alert('שגיאת הרשאות: נא לוודא שמדיניות RLS מוגדרת בטבלת categories. ראה את קובץ ההגירה: migrations/001_categories_table_and_policies.sql');
    } else {
      alert(TECH_SUPPORT_MESSAGE);
    }
    return;
  }

  if (!data || data.length === 0) {
    console.error("[confirmDeleteCategory] No rows deleted! Category ID not found:", normalizedId);
    alert('שגיאה: הקטגוריה לא נמצאה. ייתכן שהיא נמחקה על ידי משתמש אחר.');
    return;
  }

  console.log("[confirmDeleteCategory] Successfully deleted category", normalizedId);

  await fetchCategories();
  renderAdmin();
  renderCategoryCarousel();
};

const closeCreateModal = () => {
  createModal?.classList.add("hidden");
};

const openOrderModal = () => {
  orderModal?.classList.remove("hidden");
  adminOrderItems = [];
  adminOrderTotalDirty = false;
  seedAdminOrderProductSelect();
  renderAdminOrderItems();
};

const closeOrderModal = () => {
  orderModal?.classList.add("hidden");
  adminOrderItems = [];
  adminOrderTotalDirty = false;
};

const openDeleteConfirm = (type: 'product' | 'category' = 'product', id: any = null, name = '') => {
  state.pendingDeleteType = type;
  state.pendingDeleteId = id;
  
  const modalTitle = deleteConfirmModal?.querySelector('.admin-title');
  const modalMessage = deleteConfirmModal?.querySelector('p');
  
  if (type === 'category') {
    if (modalTitle) modalTitle.textContent = 'מחיקת קטגוריה';
    if (modalMessage) modalMessage.textContent = name 
      ? `אתם בטוחים שתרצו למחוק את הקטגוריה "${name}"?`
      : 'למחוק את הקטגוריה?';
  } else {
    if (modalTitle) modalTitle.textContent = 'מחיקת מוצר';
    if (modalMessage) modalMessage.textContent = 'האם אתה בטוח שאתה רוצה למחוק את המוצר?';
  }
  
  deleteConfirmModal?.classList.remove("hidden");
};

const closeDeleteConfirm = () => {
  deleteConfirmModal?.classList.add("hidden");
  state.pendingDeleteType = null;
  state.pendingDeleteId = null;
};

const openNotesPopover = (inputEl: HTMLElement) => {
  if (!inputEl) return;
  activeNotesInput = inputEl;
  if (notesTextarea) notesTextarea.value = (inputEl as HTMLInputElement).value || "";
  const rect = inputEl.getBoundingClientRect();
  const popoverWidth = Math.min(360, window.innerWidth - 24);
  const popoverHeight = 220;
  let top = rect.bottom + 8;
  if (top + popoverHeight > window.innerHeight) {
    top = rect.top - popoverHeight - 8;
  }
  const left = Math.min(rect.left, window.innerWidth - popoverWidth - 12);
  notesPopover.style.top = `${Math.max(top, 12)}px`;
  notesPopover.style.left = `${Math.max(left, 12)}px`;
  notesPopover.classList.remove("hidden");
  requestAnimationFrame(() => notesTextarea?.focus());
};

const closeNotesPopover = (shouldSave = false) => {
  if (!activeNotesInput) {
    notesPopover.classList.add("hidden");
    return;
  }
  if (shouldSave) {
    const trimmed = notesTextarea?.value.trim() || "";
    (activeNotesInput as HTMLInputElement).value = trimmed;
    updateOrderField(activeNotesInput.dataset.orderId, "notes", trimmed);
  }
  notesPopover.classList.add("hidden");
  activeNotesInput = null;
};

const resetFilterModal = () => {
  if (adminFilterField) adminFilterField.value = "";
  if (adminFilterOperator) {
    adminFilterOperator.innerHTML = '<option value="">בחר תנאי...</option>';
    adminFilterOperator.disabled = true;
  }
  if (adminFilterValue) {
    adminFilterValue.value = "";
    adminFilterValue.type = "text";
    adminFilterValue.classList.remove("hidden");
  }
  if (adminFilterValueSelect) {
    adminFilterValueSelect.value = "";
    adminFilterValueSelect.classList.add("hidden");
  }
  if (adminFilterValueFrom) {
    adminFilterValueFrom.value = "";
    adminFilterValueFrom.type = "text";
    adminFilterValueFrom.classList.add("hidden");
  }
  if (adminFilterValueTo) {
    adminFilterValueTo.value = "";
    adminFilterValueTo.type = "text";
    adminFilterValueTo.classList.add("hidden");
  }
};

const updateFilterOperators = () => {
  if (!adminFilterField || !adminFilterOperator) return;
  const fieldName = adminFilterField.value;
  const operators = OrderFilterService.getOperatorsForField(fieldName);

  adminFilterOperator.innerHTML = '<option value="">בחר תנאי...</option>';
  operators.forEach((op) => {
    const option = document.createElement("option");
    option.value = op.value;
    option.textContent = op.label;
    adminFilterOperator.appendChild(option);
  });

  adminFilterOperator.disabled = operators.length === 0;
  adminFilterOperator.value = "";
  updateFilterValueInputs();
};

const updateFilterValueInputs = () => {
  if (!adminFilterField || !adminFilterOperator) return;
  const fieldName = adminFilterField.value;
  const operator = adminFilterOperator.value;
  const fieldDef = OrderFilterService.getFieldDef(fieldName);

  if (!adminFilterValue || !adminFilterValueFrom || !adminFilterValueTo || !adminFilterValueSelect) {
    return;
  }

  // Reset visibility
  adminFilterValue.classList.add("hidden");
  adminFilterValueSelect.classList.add("hidden");
  adminFilterValueFrom.classList.add("hidden");
  adminFilterValueTo.classList.add("hidden");

  if (!fieldDef) {
    return;
  }

  if (fieldDef.type === 'boolean') {
    adminFilterValueSelect.classList.remove("hidden");
    return;
  }

  if (operator === 'between') {
    adminFilterValueFrom.classList.remove("hidden");
    adminFilterValueTo.classList.remove("hidden");

    if (fieldDef.type === 'number') {
      adminFilterValueFrom.type = 'number';
      adminFilterValueTo.type = 'number';
    } else if (fieldDef.type === 'date') {
      adminFilterValueFrom.type = 'date';
      adminFilterValueTo.type = 'date';
    } else {
      adminFilterValueFrom.type = 'text';
      adminFilterValueTo.type = 'text';
    }
    return;
  }

  adminFilterValue.classList.remove("hidden");
  if (fieldDef.type === 'number') {
    adminFilterValue.type = 'number';
  } else if (fieldDef.type === 'date') {
    adminFilterValue.type = 'date';
  } else {
    adminFilterValue.type = 'text';
  }
};

const getFilteredOrdersForExport = () => {
  const orderQuery = adminOrdersSearchInput?.value?.trim().toLowerCase() || "";
  let filteredOrders = state.orders.filter((order) => {
    if (!orderQuery) return true;
    const name = order.customer?.name?.toLowerCase() || "";
    const orderNumber = String(order.order_number ?? "").toLowerCase();
    return name.includes(orderQuery) || orderNumber.includes(orderQuery);
  });
  filteredOrders = OrderFilterService.applyFilters(filteredOrders, state.activeOrderFilters);
  return filteredOrders;
};

const setupListeners = () => {
  // Logo click to go back to home
  if (siteLogoEl) {
    siteLogoEl.addEventListener("click", () => {
      window.location.hash = "#";
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  const updateSortIndicators = (tableEl: HTMLElement | null, sortState: any) => {
    if (!tableEl) return;
    tableEl
      .querySelectorAll("th[data-sort]")
      .forEach((header: any) => {
        if (header.dataset.sort === sortState.key) {
          header.dataset.sortDir = sortState.dir;
        } else {
          delete header.dataset.sortDir;
        }
      });
  };

  adminProductsTable?.addEventListener("click", (event) => {
    const header = (event.target as HTMLElement | null)?.closest("th[data-sort]");
    if (!header) return;
    const key = (header as HTMLElement).dataset.sort;
    if (state.sortProducts.key === key) {
      state.sortProducts.dir = state.sortProducts.dir === "asc" ? "desc" : "asc";
    } else {
      state.sortProducts.key = key || "";
      state.sortProducts.dir = "asc";
    }
    updateSortIndicators(adminProductsTable, state.sortProducts);
    renderAdmin();
  });

  adminOrdersTable?.addEventListener("click", (event) => {
    const header = (event.target as HTMLElement | null)?.closest("th[data-sort]");
    if (!header) return;
    const key = (header as HTMLElement).dataset.sort;
    if (state.sortOrders.key === key) {
      state.sortOrders.dir = state.sortOrders.dir === "asc" ? "desc" : "asc";
    } else {
      state.sortOrders.key = key || "";
      state.sortOrders.dir = "asc";
    }
    updateSortIndicators(adminOrdersTable, state.sortOrders);
    renderAdmin();
  });
  document.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement | null)?.closest("button");
    if (button) {
      if ((button as HTMLElement).dataset.action === "add") {
        addToCart(button.dataset.id);
      }

      if (button.dataset.action === "inc") {
        updateQty(button.dataset.id, 1);
      }

      if (button.dataset.action === "dec") {
        updateQty(button.dataset.id, -1);
      }
    }

    const row = (event.target as HTMLElement | null)?.closest("tr");
    if (row && (row as HTMLElement).dataset.id && row.parentElement === adminProductsEl) {
      const product = state.products.find(
        (item) => String(item.id) === (row as HTMLElement).dataset.id
      );
      if (product) {
        openModal(product);
      }
    }
  });

  if (adminCategoriesEl) {
    adminCategoriesEl.addEventListener("click", (event) => {
      const deleteButton = (event.target as HTMLElement | null)?.closest(
        "button[data-action='delete-category']"
      );
      if (deleteButton) {
        const row = (event.target as HTMLElement | null)?.closest("tr");
        if (!row || !(row as HTMLElement).dataset.categoryId) return;
        handleDeleteCategory((row as HTMLElement).dataset.categoryId);
        return;
      }
      const row = (event.target as HTMLElement | null)?.closest("tr");
      if (!row || !(row as HTMLElement).dataset.categoryId) return;
      const category = state.categories.find(
        (item) => String(item.category_id) === String((row as HTMLElement).dataset.categoryId)
      );
      if (category) {
        openCategoryEditModal(category);
      }
    });
  }

  document.getElementById("close-cart")?.addEventListener("click", closeCart);
  overlay?.addEventListener("click", closeCart);
  floatingCart?.addEventListener("click", openCart);

  document
    .getElementById("checkout-scroll")
    ?.addEventListener("click", () => {
      closeCart();
      setTimeout(() => {
        const checkoutSection = document.getElementById("checkout");
        checkoutSection?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // Focus first input to ensure keyboard appears on mobile
        const firstInput = checkoutSection?.querySelector("input");
        if (firstInput) (firstInput as HTMLInputElement).focus();
      }, 300);
    });

  document
    .getElementById("checkout-form")
    ?.addEventListener("submit", handleCheckout);

  if (pickupDateInput) {
    pickupDateInput.addEventListener("change", validateAndFixPickupDate);
    pickupDateInput.addEventListener("input", validateAndFixPickupDate);
  }
  if (pickupTimeInput) {
    pickupTimeInput.addEventListener("input", validateAndFixPickupTime);
    pickupTimeInput.addEventListener("change", validateAndFixPickupTime);
  }
  if (customerNameInput) {
    customerNameInput.addEventListener("input", setCustomerFieldValidity);
  }
  if (customerPhoneInput) {
    customerPhoneInput.addEventListener("input", setCustomerFieldValidity);
  }

  if (orderChannelClose) {
    orderChannelClose.addEventListener("click", closeOrderChannelModal);
  }
  if (orderChannelModal) {
    orderChannelModal.addEventListener("click", (event) => {
      if (event.target === orderChannelModal) {
        closeOrderChannelModal();
      }
    });
  }
  if (orderChannelWhatsapp) {
    orderChannelWhatsapp.addEventListener("click", () => {
      const whatsappUrl = state.pendingOrderLinks?.whatsappUrl;
      if (!whatsappUrl) return;
      clearCheckoutState();
      closeOrderChannelModal();
      setCheckoutStatus("ההזמנה נשלחה בהצלחה", "success", 4000);
      try {
        if (typeof window.open === "function") {
          window.open(whatsappUrl, "_blank", "noopener");
        }
      } catch {
        // Intentionally ignore in non-browser environments
      }
    });
  }
  if (orderChannelEmail) {
    orderChannelEmail.addEventListener("click", () => {
      const emailUrl = state.pendingOrderLinks?.emailUrl;
      if (!emailUrl) return;
      clearCheckoutState();
      closeOrderChannelModal();
      setCheckoutStatus("ההזמנה נשלחה בהצלחה", "success", 4000);
      window.location.href = emailUrl;
    });
  }

  adminNewOrderButton?.addEventListener("click", openOrderModal);
  orderModalClose?.addEventListener("click", closeOrderModal);
  orderSave?.addEventListener("click", handleCreateOrder);
  orderTotal?.addEventListener("input", () => {
    adminOrderTotalDirty = true;
  });
  orderItemAdd?.addEventListener("click", () => {
    if (!orderItemProduct) return;
    const selectedId = orderItemProduct.value;
    if (!selectedId) return;
    const qty = Math.max(1, Number(orderItemQty?.value) || 1);
    const existing = adminOrderItems.find((item) => String(item.id) === String(selectedId));
    if (existing) {
      existing.qty += qty;
    } else {
      adminOrderItems.push({ id: selectedId, qty });
    }
    if (orderItemQty) orderItemQty.value = "1";
    renderAdminOrderItems();
  });
  orderItemsList?.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement | null;
    const productId = target?.dataset?.orderItemQty;
    if (!productId) return;
    const qty = Math.max(1, Number(target.value) || 1);
    const item = adminOrderItems.find((entry) => String(entry.id) === String(productId));
    if (item) {
      item.qty = qty;
      renderAdminOrderItems();
    }
  });
  orderItemsList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const productId = target?.dataset?.orderItemRemove;
    if (!productId) return;
    adminOrderItems = adminOrderItems.filter((item) => String(item.id) !== String(productId));
    renderAdminOrderItems();
  });
  orderDetailsClose?.addEventListener("click", () => {
    orderDetailsModal?.classList.add("hidden");
  });

  adminOrdersEl?.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement | null;
    const field = target?.dataset.orderField;
    const id = target?.dataset.orderId;
    if (!field || !id || !target) return;

    if (field === "paid") {
      updateOrderField(id, "paid", target.checked);
      return;
    }

    if (field === "deleted") {
      const order = state.orders.find((item) => String(item.id) === String(id));
      if (order?.paid) {
        target.checked = false;
        alert("לא ניתן למחוק הזמנה ששולמה.");
        return;
      }
      updateOrderField(id, "deleted", target.checked);
    }
  });

  adminOrdersEl?.addEventListener(
    "click",
    (event) => {
      const notesInput = (event.target as HTMLElement | null)?.closest(
        'input[data-order-field="notes"]'
      );
      if (notesInput) {
        event.preventDefault();
        event.stopPropagation();
        openNotesPopover(notesInput as HTMLElement);
        return;
      }
    },
    true
  );

  adminOrdersEl?.addEventListener("click", (event) => {
    if ((event.target as HTMLElement | null)?.closest("input")) return;
    const row = (event.target as HTMLElement | null)?.closest("tr");
    if (!row || !(row as HTMLElement).dataset.orderId) return;
    const order = state.orders.find((item) => String(item.id) === (row as HTMLElement).dataset.orderId);
    if (!order) return;
    showOrderDetails(order);
  });

  document.addEventListener("click", (event) => {
    if (notesPopover.classList.contains("hidden")) return;
    const isNotesInput = (event.target as HTMLElement | null)?.closest(
      'input[data-order-field="notes"]'
    );
    if (notesPopover.contains(event.target as Node) || isNotesInput) return;
    closeNotesPopover(true);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNotesPopover(false);
    }
  });

  adminSearchInput?.addEventListener("input", renderAdmin);
  adminOrdersSearchInput?.addEventListener("input", renderAdmin);
  adminOrdersFilterBtn?.addEventListener("click", () => {
    resetFilterModal();
    adminOrdersFilterModal?.classList.remove("hidden");
  });
  adminFilterModalClose?.addEventListener("click", () => {
    adminOrdersFilterModal?.classList.add("hidden");
  });
  adminFilterCancel?.addEventListener("click", () => {
    adminOrdersFilterModal?.classList.add("hidden");
  });
  adminFilterField?.addEventListener("change", updateFilterOperators);
  adminFilterOperator?.addEventListener("change", updateFilterValueInputs);
  adminFilterApply?.addEventListener("click", () => {
    if (!adminFilterField || !adminFilterOperator) return;
    const field = adminFilterField.value;
    const operator = adminFilterOperator.value;

    if (!field || !operator) {
      alert("יש לבחור שדה ותנאי.");
      return;
    }

    const fieldDef = OrderFilterService.getFieldDef(field);
    let value: any = null;

    if (fieldDef?.type === 'boolean') {
      value = adminFilterValueSelect?.value || "";
    } else if (operator === 'between') {
      const fromValue = adminFilterValueFrom?.value || "";
      const toValue = adminFilterValueTo?.value || "";
      value = [fromValue, toValue];
    } else {
      value = adminFilterValue?.value || "";
    }

    const newFilter: OrderFilter = { field, operator, value };
    const validation = OrderFilterService.validateFilter(newFilter);
    if (!validation.valid) {
      alert("יש למלא ערך תקין לסינון.");
      return;
    }

    state.activeOrderFilters.push(newFilter);
    adminOrdersFilterModal?.classList.add("hidden");
    renderAdmin();
  });
  adminOrdersClearFiltersBtn?.addEventListener("click", () => {
    state.activeOrderFilters = [];
    renderAdmin();
  });
  adminOrdersExportCsv?.addEventListener("click", () => {
    const filteredOrders = getFilteredOrdersForExport();
    OrderExportService.exportOrdersAsCSV(filteredOrders);
  });
  adminOrdersExportXlsx?.addEventListener("click", () => {
    const filteredOrders = getFilteredOrdersForExport();
    OrderExportService.exportOrdersAsXLSX(filteredOrders);
  });

  adminViewStatsBtn?.addEventListener("click", () => {
    setAdminView("stats");
  });
  adminViewManageBtn?.addEventListener("click", () => {
    setAdminView("manage");
  });

  statsRangeSelect?.addEventListener("change", () => {
    state.statsRange = statsRangeSelect.value;
    renderStatistics();
  });

  statsRangeStartInput?.addEventListener("change", () => {
    state.statsRangeStart = statsRangeStartInput.value;
    if (statsRangeSelect) statsRangeSelect.value = "custom";
    state.statsRange = "custom";
    renderStatistics();
  });

  statsRangeEndInput?.addEventListener("change", () => {
    state.statsRangeEnd = statsRangeEndInput.value;
    if (statsRangeSelect) statsRangeSelect.value = "custom";
    state.statsRange = "custom";
    renderStatistics();
  });

  statsSeriesButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const series = button.dataset.statsSeries as StatsSeriesKey | undefined;
      if (!series) return;
      state.statsSeries = series;
      renderStatistics();
    });
  });

  statsLatestOrders?.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement | null)?.closest(
      "button[data-stats-action='view-order']"
    ) as HTMLElement | null;
    if (!button) return;
    const orderId = button.dataset.orderId;
    if (!orderId) return;
    const order = state.orders.find((item) => String(item.id) === String(orderId));
    if (!order) return;
    showOrderDetails(order);
  });

  if (productSearchInput) {

    productSearchInput.addEventListener("input", renderProducts);
  }
  if (adminAboutSave) {
    adminAboutSave.addEventListener("click", saveAboutContent);
  }
  if (ordersAcceptingToggle) {
    ordersAcceptingToggle.addEventListener("change", (e) => {
      const accepting = (e.target as HTMLInputElement).checked;
      if (ordersAcceptingLabel) {
        ordersAcceptingLabel.textContent = accepting ? 'פתוח' : 'סגור';
      }
      updateOrdersAccepting(accepting);
    });
  }
  if (adminHeaderTitleSave) {
    adminHeaderTitleSave.addEventListener("click", saveHeaderTitle);
  }
  if (adminHeroSave) {
    adminHeroSave.addEventListener("click", saveHero);
  }
  if (adminHeroBadgeInput) {
    adminHeroBadgeInput.addEventListener("input", (e) => {
      state.heroBadge = (e.target as HTMLInputElement).value;
    });
  }
  if (adminHeroTitleInput) {
    adminHeroTitleInput.addEventListener("input", (e) => {
      state.heroTitle = (e.target as HTMLInputElement).value;
    });
  }
  if (adminHeroDescriptionInput) {
    adminHeroDescriptionInput.addEventListener("input", (e) => {
      state.heroDescription = (e.target as HTMLTextAreaElement).value;
    });
  }
  if (adminHeroAddChipBtn) {
    adminHeroAddChipBtn.addEventListener("click", () => {
      state.heroChips.push("");
      renderHeroChipsAdmin();
    });
  }
  if (adminContactSave) {
    adminContactSave.addEventListener("click", saveContactInfo);
  }
  
  // Logo replacement button and file input handlers
  if (adminLogoReplaceBtn) {
    adminLogoReplaceBtn.addEventListener("click", () => {
      adminLogoInput?.click();
    });
  }
  
  if (adminLogoInput) {
    adminLogoInput.addEventListener("change", async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        await saveLogoImage(file);
      }
    });
  }
  
  if (adminHeroImageFile) {
    adminHeroImageFile.addEventListener("change", async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        await saveHeroImage(file);
      }
    });
  }
  
  modalSave?.addEventListener("click", handleAdminChange);
  modalClose?.addEventListener("click", closeModal);
  modalDelete?.addEventListener("click", () => {
    if (state.editingProductId) {
      openDeleteConfirm();
    }
  });

  deleteConfirmClose?.addEventListener("click", closeDeleteConfirm);
  deleteConfirmNo?.addEventListener("click", closeDeleteConfirm);
  deleteConfirmYes?.addEventListener("click", async () => {
    console.log("[deleteConfirmYes] Clicked. Pending delete:", { type: state.pendingDeleteType, id: state.pendingDeleteId });
    
    if (state.pendingDeleteType === 'category' && state.pendingDeleteId) {
      await confirmDeleteCategory();
    } else if (state.editingProductId) {
      handleDeleteProduct(state.editingProductId);
    }
    closeDeleteConfirm();
  });

  openCreateModal?.addEventListener("click", openCreateProductModal);
  createModalClose?.addEventListener("click", closeCreateModal);
  createSave?.addEventListener("click", handleCreateProduct);

  modalCategoryTrigger?.addEventListener("click", () => {
    modalCategoryDropdown?.classList.toggle("open");
  });
  createCategoryTrigger?.addEventListener("click", () => {
    createCategoryDropdown?.classList.toggle("open");
  });
  modalCategorySearch?.addEventListener("input", () =>
    renderCategoryDropdown(modalCategoryDropdown, {
      searchInput: modalCategorySearch,
      listEl: modalCategoryList,
      getSelectedId: () => state.editingCategoryId,
      setSelectedId: (id: any) => {
        state.editingCategoryId = id;
      },
      triggerEl: modalCategoryTrigger,
    })
  );
  createCategorySearch?.addEventListener("input", () =>
    renderCategoryDropdown(createCategoryDropdown, {
      searchInput: createCategorySearch,
      listEl: createCategoryList,
      getSelectedId: () => state.creatingCategoryId,
      setSelectedId: (id: any) => {
        state.creatingCategoryId = id;
      },
      triggerEl: createCategoryTrigger,
    })
  );

  categoryModalClose?.addEventListener("click", closeCategoryModal);
  categorySave?.addEventListener("click", handleCreateCategory);
  if (adminCreateCategoryButton) {
    adminCreateCategoryButton.addEventListener("click", openCategoryModal);
  }

  if (categoryEditClose) {
    categoryEditClose.addEventListener("click", closeCategoryEditModal);
  }
  if (categoryEditSave) {
    categoryEditSave.addEventListener("click", handleUpdateCategory);
  }

  document.addEventListener("click", (event) => {
    if (
      !modalCategoryDropdown?.contains(event.target as Node) &&
      modalCategoryDropdown?.classList.contains("open")
    ) {
      modalCategoryDropdown.classList.remove("open");
    }
    if (
      !createCategoryDropdown?.contains(event.target as Node) &&
      createCategoryDropdown?.classList.contains("open")
    ) {
      createCategoryDropdown.classList.remove("open");
    }
  });

  document
    .getElementById("admin-login-form")
    ?.addEventListener("submit", handleAdminLogin);

  adminLogoutButton?.addEventListener("click", handleLogout);

  window.addEventListener("hashchange", updateRoute);
};

const init = async () => {
  console.log("[init] Starting initialization...");
  supabaseClient = await createSupabaseClient();
  
  // Initialize services if client is available
  if (supabaseClient) {
    storageService = new StorageService(supabaseClient);
    _productService = new ProductService(supabaseClient);
  }
  
  setupListeners();
  updateRoute();
  updatePickupConstraints();

  // Contact info is now loaded from database in fetchSiteMeta()

  if (!supabaseClient) {
    console.log("[init] No Supabase client, exiting early");
    state.products = [];
    state.featuredProducts = [];
    renderProducts();
    renderCategoryCarousel();
    updateCartUI();
    setAdminUI(false);
    setAboutContent(DEFAULT_ABOUT);
    if (window.lucide) {
      window.lucide.createIcons();
    }
    return;
  }

  console.log("[init] Supabase client found, fetching categories...");
  await fetchCategories();
  console.log("[init] After fetchCategories, state.categories:", state.categories);
  
  await fetchSiteMeta();
  console.log("[init] After fetchSiteMeta, state.siteMetaId:", state.siteMetaId);
  
  await fetchProducts();
  console.log("[init] After fetchProducts, state.products.length:", state.products.length);

  // In dev mode, also fetch orders to populate statistics dashboard
  if (isMockMode()) {
    await fetchOrders();
    console.log("[init] After fetchOrders (mock mode), state.orders.length:", state.orders.length);
  }

  renderProducts();
  updateCartUI();
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((_event: any, session: any) => {
      state.session = session;
    });
  }
  await openAdminIfSession();
  
  // In mock mode, auto-enable admin with stats view if no session exists
  if (isMockMode() && !state.session) {
    state.session = { user: { id: 'mock-admin', email: 'admin@bakery.local' } } as any;
    state.role = 'admin';
    setAdminUI(true);
    setAdminView('stats');
    console.log('[init] Auto-login for mock mode admin access');
  }
  const productHeaders = document.getElementById("admin-products-table");
  const orderHeaders = document.getElementById("admin-orders-table");
  if (productHeaders) {
    productHeaders
      .querySelectorAll("th[data-sort]")
      .forEach((header) => {
        if ((header as HTMLElement).dataset.sort === state.sortProducts.key) {
          (header as HTMLElement).dataset.sortDir = state.sortProducts.dir;
        }
      });
  }
  if (orderHeaders) {
    orderHeaders
      .querySelectorAll("th[data-sort]")
      .forEach((header) => {
        if ((header as HTMLElement).dataset.sort === state.sortOrders.key) {
          (header as HTMLElement).dataset.sortDir = state.sortOrders.dir;
        }
      });
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const shouldAutoInit =
  typeof window !== "undefined" && !window.__DISABLE_AUTO_INIT__;

if (shouldAutoInit) {
  init();
}

export { init };

export const __test__ = {
  state,
  store,
  actions,
  mapDbToProduct,
  mapProductToDb,
  normalizeCategoryId,
  normalizeProductId,
  getNextBusinessDateTime,
  getPickupDateTime,
  buildOrderMessage,
  buildOrderLinks,
};
