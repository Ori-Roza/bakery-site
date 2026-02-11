import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const CONTACT_PHONE = "050-123-4567";
const CONTACT_PHONE_INTL = "972501234567";
const CONTACT_EMAIL = "ori.roza@bluevine.com";
const DEFAULT_WHATSAPP_PHONE = CONTACT_PHONE_INTL;
const DEFAULT_ORDER_EMAIL = CONTACT_EMAIL;
const TECH_SUPPORT_MESSAGE = "אירעה שגיאה, נא פנו לחנות";
const CUSTOMER_NAME_REQUIRED = "נא להזין שם מלא";
const CUSTOMER_PHONE_REQUIRED = "נא להזין מספר טלפון";

const SUPABASE_CONFIG = window.__SUPABASE__ || {};
const supabaseClient =
  SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey
    ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
    : null;

const state = {
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
  checkoutEmail: DEFAULT_ORDER_EMAIL,
  storePhone: CONTACT_PHONE,
  bakeryPhone: CONTACT_PHONE,
  pendingOrderLinks: null,
  editingCategoryRowId: null,
};

const categoryTrackEl = document.getElementById("category-track");
const productsScrollEl = document.getElementById("products-scroll");
const productSearchInput = document.getElementById("product-search");
const cartDrawer = document.getElementById("cart-drawer");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const floatingCart = document.getElementById("floating-cart");
const floatingCount = document.getElementById("floating-count");
const floatingTotal = document.getElementById("floating-total");
const overlay = document.getElementById("overlay");
const adminSection = document.getElementById("admin");
const adminProductsEl = document.getElementById("admin-products");
const adminOrdersEl = document.getElementById("admin-orders");
const adminAuthEl = document.getElementById("admin-auth");
const adminPanelEl = document.getElementById("admin-panel");
const adminAuthErrorEl = document.getElementById("admin-auth-error");
const adminGreetingEl = document.getElementById("admin-greeting");
const adminLogoutButton = document.getElementById("admin-logout");
const adminNewOrderButton = document.getElementById("admin-new-order");
const adminProductsTable = document.getElementById("admin-products-table");
const adminCategoriesTable = document.getElementById("admin-categories-table");
const adminOrdersTable = document.getElementById("admin-orders-table");
const adminOrdersSearchInput = document.getElementById("admin-orders-search");
const orderDetailsModal = document.getElementById("order-details-modal");
const orderDetailsClose = document.getElementById("order-details-close");
const orderDetailsContent = document.getElementById("order-details-content");
const aboutContentEl = document.getElementById("about-content");
const adminAboutInput = document.getElementById("admin-about");
const adminAboutSave = document.getElementById("admin-about-save");
const adminAboutStatus = document.getElementById("admin-about-status");
const checkoutError = document.getElementById("checkout-error");
const checkoutForm = document.getElementById("checkout-form");
const customerNameInput = document.getElementById("customer-name");
const customerPhoneInput = document.getElementById("customer-phone");
const orderModal = document.getElementById("order-modal");
const orderModalClose = document.getElementById("order-modal-close");
const orderSave = document.getElementById("order-save");
const deleteConfirmModal = document.getElementById("delete-confirm-modal");
const deleteConfirmClose = document.getElementById("delete-confirm-close");
const deleteConfirmYes = document.getElementById("delete-confirm-yes");
const deleteConfirmNo = document.getElementById("delete-confirm-no");
const orderName = document.getElementById("order-name");
const orderDate = document.getElementById("order-date");
const orderTotal = document.getElementById("order-total");
const orderPaid = document.getElementById("order-paid");
const orderNotes = document.getElementById("order-notes");
const adminSearchInput = document.getElementById("admin-search");
const adminCategoriesEl = document.getElementById("admin-categories");
const adminCreateCategoryButton = document.getElementById("admin-create-category");
const productModal = document.getElementById("product-modal");
const modalClose = document.getElementById("modal-close");
const modalSave = document.getElementById("modal-save");
const modalDelete = document.getElementById("modal-delete");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalCategoryDropdown = document.getElementById("modal-category-dropdown");
const modalCategoryTrigger = document.getElementById("modal-category-trigger");
const modalCategorySearch = document.getElementById("modal-category-search");
const modalCategoryList = document.getElementById("modal-category-list");
const modalImage = document.getElementById("modal-image");
const modalStock = document.getElementById("modal-stock");
const modalStatus = document.getElementById("modal-status");
const openCreateModal = document.getElementById("open-create-modal");
const createModal = document.getElementById("create-modal");
const createModalClose = document.getElementById("create-modal-close");
const createSave = document.getElementById("create-save");
const createTitle = document.getElementById("create-title");
const createPrice = document.getElementById("create-price");
const createCategoryDropdown = document.getElementById("create-category-dropdown");
const createCategoryTrigger = document.getElementById("create-category-trigger");
const createCategorySearch = document.getElementById("create-category-search");
const createCategoryList = document.getElementById("create-category-list");
const createImage = document.getElementById("create-image");
const categoryModal = document.getElementById("category-modal");
const categoryModalClose = document.getElementById("category-modal-close");
const categorySave = document.getElementById("category-save");
const categoryNameInput = document.getElementById("category-name");
const categoryImageInput = document.getElementById("category-image");
const categoryStatus = document.getElementById("category-status");
const categoryEditModal = document.getElementById("category-edit-modal");
const categoryEditClose = document.getElementById("category-edit-close");
const categoryEditNameInput = document.getElementById("category-edit-name");
const categoryEditImageInput = document.getElementById("category-edit-image");
const categoryEditPreview = document.getElementById("category-edit-preview");
const categoryEditSave = document.getElementById("category-edit-save");
const categoryEditStatus = document.getElementById("category-edit-status");
const contactBakeryPhoneEl = document.getElementById("contact-bakery-phone");
const contactBakeryPhoneLinkEl = document.getElementById("contact-bakery-phone-link");
const contactStorePhoneEl = document.getElementById("contact-store-phone");
const contactStorePhoneLinkEl = document.getElementById("contact-store-phone-link");
const contactWhatsappEl = document.getElementById("contact-whatsapp");
const contactWhatsappPhoneEl = document.getElementById("contact-whatsapp-phone");
const contactEmailEl = document.getElementById("contact-email");
const contactEmailTextEl = document.getElementById("contact-email-text");
const contactAddressEl = document.getElementById("contact-address");
const contactAddressLinkEl = document.getElementById("contact-address-link");
const siteLogoEl = document.getElementById("site-logo");
const adminLogoPreview = document.getElementById("admin-logo-preview");
const adminLogoReplaceBtn = document.getElementById("admin-logo-replace-btn");
const adminLogoInput = document.getElementById("admin-logo-input");
// New admin editable fields
const adminHeaderTitleInput = document.getElementById("admin-header-title");
const adminHeaderTitleSave = document.getElementById("admin-header-title-save");
const adminHeaderTitleStatus = document.getElementById("admin-header-title-status");
const adminHeroBadgeInput = document.getElementById("admin-hero-badge");
const adminHeroTitleInput = document.getElementById("admin-hero-title");
const adminHeroDescriptionInput = document.getElementById("admin-hero-description");
const adminHeroChipsContainer = document.getElementById("admin-hero-chips-container");
const adminHeroAddChipBtn = document.getElementById("admin-hero-add-chip");
const adminHeroImageFile = document.getElementById("admin-hero-image-file");
const adminHeroImagePreview = document.getElementById("admin-hero-image-preview");
const adminHeroSave = document.getElementById("admin-hero-save");
const adminHeroStatus = document.getElementById("admin-hero-status");
const adminFeaturedProductsContainer = document.getElementById("admin-featured-products");
const adminFeaturedSave = document.getElementById("admin-featured-save");
const adminFeaturedStatus = document.getElementById("admin-featured-status");
const adminContactBakeryPhoneInput = document.getElementById("admin-contact-bakery-phone");
const adminContactStorePhoneInput = document.getElementById("admin-contact-store-phone");
const adminContactWhatsappInput = document.getElementById("admin-contact-whatsapp");
const adminContactEmailInput = document.getElementById("admin-contact-email");
const adminContactAddressInput = document.getElementById("admin-contact-address");
const adminContactSave = document.getElementById("admin-contact-save");
const adminContactStatus = document.getElementById("admin-contact-status");
const pickupDateInput = document.getElementById("pickup-date");
const pickupTimeInput = document.getElementById("pickup-time");
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
const notesTextarea = notesPopover.querySelector(".notes-textarea");
let activeNotesInput = null;

const formatCurrency = (value) => `₪${Number(value).toFixed(0)}`;
const DEFAULT_ABOUT =
  "בית מאפה ברכת יעקב הוא מאפייה משפחתית עם אהבה לבצק, לחום של התנור ולטעמים של בית. אנו אופים מדי יום חלות, לחמים ומאפים טריים מחומרי גלם איכותיים, עם הקפדה על טריות, שירות אישי וחוויה נעימה לכל המשפחה.\n\nהמטרה שלנו היא לשלב בין מסורת לאיכות מודרנית — כדי שתוכלו ליהנות מארוחה חמה, שולחן שבת עשיר ורגעים מתוקים לאורך השבוע.";

const mapDbToProduct = (row) => ({
  id: row.id,
  title: row.title,
  price: Number(row.price),
  discountPercentage: Number(row.discount_percentage) || 0,
  categoryId: row.category_id || row.categoryId || row.category_id,
  categoryName: row.categories?.name || row.category || "",
  image: row.image,
  inStock: row.in_stock,
});

const mapProductToDb = (product, { includeId = false } = {}) => {
  const payload = {
    title: product.title,
    price: product.price,
    discount_percentage: product.discountPercentage || 0,
    category_id: normalizeCategoryId(
      product.categoryId || product.category_id || null
    ),
    image: product.image,
    in_stock: product.inStock,
  };
  if (includeId) {
    const numericId = Number(product.id);
    if (Number.isFinite(numericId)) {
      payload.id = numericId;
    }
  }
  return payload;
};

const getCategoryLabel = (product) => {
  if (product.categoryName || product.category) {
    return product.categoryName || product.category || "";
  }
  const category = state.categories.find(
    (item) => String(item.category_id) === String(product.categoryId)
  );
  return category?.category_name || "";
};

const normalizeCategoryId = (value) => {
  console.log("[normalizeCategoryId] Input:", value, "Type:", typeof value);
  if (value === null || value === undefined || value === "") {
    console.log("[normalizeCategoryId] Value is null/undefined/empty, returning null");
    return null;
  }
  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) {
    console.log("[normalizeCategoryId] Converted to number:", asNumber);
    return asNumber;
  }
  const match = state.categories.find((item) => item.category_name === value);
  console.log("[normalizeCategoryId] Looked up by name, found:", match);
  return match ? match.category_id : null;
};

const normalizeProductId = (value) => {
  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : null;
};

const showTechErrorStatus = (element) => {
  if (!element) return;
  element.textContent = TECH_SUPPORT_MESSAGE;
  element.className = "text-sm mt-2 text-rose-600";
};

const bufferToHex = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  bytes.forEach((byte) => {
    hex += byte.toString(16).padStart(2, "0");
  });
  return hex;
};

const hexToBase64 = (hexValue) => {
  if (!hexValue) return "";
  const hex = hexValue.startsWith("\\x") ? hexValue.slice(2) : hexValue;
  let binary = "";
  for (let i = 0; i < hex.length; i += 2) {
    binary += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
  }
  return btoa(binary);
};

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeForInput = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getPickupDateTime = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const updatePickupConstraints = () => {
  if (!pickupDateInput || !pickupTimeInput) return;
  const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const minDate = formatDateForInput(minDateTime);
  pickupDateInput.min = minDate;

  if (pickupDateInput.value === minDate) {
    pickupTimeInput.min = formatTimeForInput(minDateTime);
  } else {
    pickupTimeInput.removeAttribute("min");
  }
  setPickupValidity();
};

const setPickupValidity = () => {
  if (!pickupDateInput || !pickupTimeInput) return;
  const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pickupDateTime = getPickupDateTime(
    pickupDateInput.value,
    pickupTimeInput.value
  );
  const message = "הזמנה יכולה להישלח בטווח של לפחות 24 שעות";
  if (!pickupDateTime || pickupDateTime < minDateTime) {
    pickupDateInput.setCustomValidity(message);
    pickupTimeInput.setCustomValidity(message);
  } else {
    pickupDateInput.setCustomValidity("");
    pickupTimeInput.setCustomValidity("");
  }
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

const setActiveCategory = (categoryId) => {
  state.activeCategoryId = categoryId;
  renderCategoryCarousel();
  renderProducts();
};

const getCategoryThumbnail = (categoryId) => {
  if (!categoryId) {
    return "assets/all_categories.png";
  }
  const category = state.categories.find(
    (item) => String(item.category_id) === String(categoryId)
  );
  if (category?.image_url) {
    return category.image_url;
  }
  return "assets/all_categories.png";
};

const renderCategoryCarousel = () => {
  if (!categoryTrackEl) return;

  categoryTrackEl.innerHTML = "";

  const allCard = document.createElement("button");
  allCard.type = "button";
  allCard.className = "carousel-card category-card";
  if (!state.activeCategoryId) {
    allCard.classList.add("active");
  }
  allCard.dataset.categoryId = "";
  allCard.innerHTML = `
    <div class="relative">
      <img src="${getCategoryThumbnail(null)}" alt="כל הקטגוריות" />
    </div>
    <div class="carousel-content">
      <h5 class="font-semibold text-lg">כל הקטגוריות</h5>
      <p class="text-sm text-stone-500">הצגת כל המוצרים</p>
    </div>
  `;
  allCard.addEventListener("click", () => setActiveCategory(null));
  categoryTrackEl.appendChild(allCard);

  state.categories.forEach((category) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "carousel-card category-card";
    if (String(state.activeCategoryId) === String(category.category_id)) {
      card.classList.add("active");
    }
    card.dataset.categoryId = category.category_id;
    card.innerHTML = `
      <div class="relative">
        <img src="${getCategoryThumbnail(category.category_id)}" alt="${category.category_name}" />
      </div>
      <div class="carousel-content">
        <h5 class="font-semibold text-lg">${category.category_name}</h5>
        <p class="text-sm text-stone-500">מוצרים בקטגוריה זו</p>
      </div>
    `;
    card.addEventListener("click", () => setActiveCategory(category.category_id));
    categoryTrackEl.appendChild(card);
  });
};

const ensureCategoryOptions = () => {
  renderCategoryDropdown(modalCategoryDropdown, {
    searchInput: modalCategorySearch,
    listEl: modalCategoryList,
    getSelectedId: () => state.editingCategoryId,
    setSelectedId: (id) => {
      state.editingCategoryId = id;
    },
    triggerEl: modalCategoryTrigger,
  });

  renderCategoryDropdown(createCategoryDropdown, {
    searchInput: createCategorySearch,
    listEl: createCategoryList,
    getSelectedId: () => state.creatingCategoryId,
    setSelectedId: (id) => {
      state.creatingCategoryId = id;
    },
    triggerEl: createCategoryTrigger,
  });
};

const renderCategoryDropdown = (dropdownEl, config) => {
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

const setCategoryTriggerLabel = (triggerEl, label, selectedId = null) => {
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

const getCartItems = () => {
  return Object.entries(state.cart)
    .map(([id, qty]) => {
      const product = state.products.find(
        (item) => String(item.id) === String(id)
      );
      if (!product) return null;
      const discountedPrice = product.discountPercentage > 0
        ? product.price * (1 - product.discountPercentage / 100)
        : product.price;
      return {
        ...product,
        qty,
        discountedPrice,
        lineTotal: discountedPrice * qty,
      };
    })
    .filter(Boolean);
};

const getCartTotals = () => {
  const items = getCartItems();
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { items, totalQty, totalPrice };
};

const pickRandomProducts = (items, count = 5) => {
  const inStockItems = items.filter(item => item.inStock);
  const pool = [...inStockItems];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
};

const updateCartUI = () => {
  const { items, totalQty, totalPrice } = getCartTotals();
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

  cartTotalEl.textContent = formatCurrency(totalPrice);
  floatingCount.textContent = totalQty;
  floatingTotal.textContent = formatCurrency(totalPrice);
  floatingCart.classList.toggle("hidden", totalQty === 0);
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
  adminProductsEl.innerHTML = "";
  const query = adminSearchInput?.value?.trim().toLowerCase() || "";
  const filteredProducts = state.products.filter((product) => {
    if (!query) return true;
    return (
      product.title.toLowerCase().includes(query) ||
      getCategoryLabel(product).toLowerCase().includes(query)
    );
  });

  const { key: productKey, dir: productDir } = state.sortProducts;
  filteredProducts.sort((a, b) => {
    let left = a[productKey];
    let right = b[productKey];
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
        ? left.localeCompare(right, "he")
        : left - right;
    return productDir === "asc" ? compare : -compare;
  });

  filteredProducts.forEach((product) => {
    const row = document.createElement("tr");
    row.dataset.id = product.id;
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
        "<td colspan='2' class='text-sm text-stone-500'>אין קטגוריות להצגה.</td>";
      adminCategoriesEl.appendChild(row);
    } else {
      categories.forEach((category) => {
        const row = document.createElement("tr");
        row.dataset.categoryId = category.category_id;
        const imageSrc = category.image_url || "assets/all_categories.png";
        row.innerHTML = `
          <td>${category.category_name}</td>
          <td>
            <img src="${imageSrc}" alt="${category.category_name}" class="admin-category-image" />
          </td>
        `;
        adminCategoriesEl.appendChild(row);
      });
    }
  }

  adminOrdersEl.innerHTML = "";
  const orderQuery = adminOrdersSearchInput?.value?.trim().toLowerCase() || "";
  const filteredOrders = state.orders.filter((order) => {
    if (!orderQuery) return true;
    const name = order.customer?.name?.toLowerCase() || "";
    const orderNumber = String(order.order_number ?? "").toLowerCase();
    return name.includes(orderQuery) || orderNumber.includes(orderQuery);
  });

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
      left = Number(a[orderKey]) || 0;
      right = Number(b[orderKey]) || 0;
    }
    const compare =
      typeof left === "string"
        ? left.localeCompare(right, "he")
        : left - right;
    return orderDir === "asc" ? compare : -compare;
  });

  if (!filteredOrders.length) {
    const row = document.createElement("tr");
    row.innerHTML =
      "<td colspan='8' class='text-sm text-stone-500'>עדיין אין הזמנות להצגה.</td>";
    adminOrdersEl.appendChild(row);
    return;
  }

  filteredOrders.forEach((order) => {
    const row = document.createElement("tr");
    row.dataset.orderId = order.id;
    if (order.deleted) {
      row.style.opacity = "0.5";
      row.style.textDecoration = "line-through";
    }
    row.innerHTML = `
      <td>${order.order_number ?? ""}</td>
      <td>${order.customer.name}</td>
      <td>${new Date(order.created_at).toLocaleString("he-IL")}</td>
      <td class="text-amber-900 font-semibold">${formatCurrency(
        order.total
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
};

const updateRoute = () => {
  const isAdmin = window.location.hash === "#admin";
  adminSection.classList.toggle("hidden", !isAdmin);
  document.getElementById("catalog").classList.toggle("hidden", isAdmin);
  document.getElementById("checkout").classList.toggle("hidden", isAdmin);
  document.getElementById("contact")?.classList.toggle("hidden", isAdmin);
  document.getElementById("about")?.classList.toggle("hidden", isAdmin);
  document.getElementById("hero")?.classList.toggle("hidden", isAdmin);
  // Update button visibility based on admin page and auth state
  const isAuthenticated = state.session !== null;
  if (isAdmin && isAuthenticated) {
    adminLogoReplaceBtn.classList.remove("hidden");
  } else {
    adminLogoReplaceBtn.classList.add("hidden");
  }
  if (!isAdmin) {
    document.getElementById("catalog").classList.remove("hidden");
    document.getElementById("checkout").classList.remove("hidden");
  }
};

const setAdminUI = (isAuthenticated) => {
  adminAuthEl.classList.toggle("hidden", isAuthenticated);
  adminPanelEl.classList.toggle("hidden", !isAuthenticated);
  adminGreetingEl.classList.toggle("hidden", !isAuthenticated);
  adminLogoutButton.classList.toggle("hidden", !isAuthenticated);
  // Show button only if authenticated AND on admin page
  const isAdmin = window.location.hash === "#admin";
  if (isAuthenticated && isAdmin) {
    adminLogoReplaceBtn.classList.remove("hidden");
  } else {
    adminLogoReplaceBtn.classList.add("hidden");
  }
};


const setAboutContent = (text) => {
  if (!aboutContentEl) return;
  const safeText = (text || DEFAULT_ABOUT).trim();
  aboutContentEl.innerHTML = safeText.replace(/\n/g, "<br />");
  if (adminAboutInput) {
    adminAboutInput.value = safeText;
  }
};

const uploadProductImage = async (file, prefix) => {
  if (!file) return null;
  if (!ensureSupabase()) return null;
  const ext = file.name.split(".").pop();
  const fileName = `${prefix}-${Date.now()}.${ext}`;
  const filePath = `products/${fileName}`;

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

const uploadCategoryImage = async (file, prefix) => {
  if (!file) return null;
  if (!ensureSupabase()) return null;
  const ext = file.name.split(".").pop();
  const fileName = `${prefix}-${Date.now()}.${ext}`;
  const filePath = `categories/${fileName}`;

  const { error } = await supabaseClient
    .storage
    .from("product-images")
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error(error);
    return null;
  }

  const { data } = supabaseClient.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};


const openCart = () => {
  cartDrawer.classList.add("open");
  overlay.classList.remove("hidden");
};

const closeCart = () => {
  cartDrawer.classList.remove("open");
  overlay.classList.add("hidden");
};

const addToCart = (id) => {
  const key = String(id);
  state.cart[key] = (state.cart[key] || 0) + 1;
  updateCartUI();
  openCart();
};

const updateQty = (id, delta) => {
  const key = String(id);
  const next = (state.cart[key] || 0) + delta;
  if (next <= 0) {
    delete state.cart[key];
  } else {
    state.cart[key] = next;
  }
  updateCartUI();
};

const setQty = (id, value) => {
  const key = String(id);
  const next = Number(value) || 0;
  if (next <= 0) {
    delete state.cart[key];
  } else {
    state.cart[key] = next;
  }
  updateCartUI();
};

const buildOrderMessage = ({ name, phone, date, time, items, totalPrice }) => {
  const lines = items.map((item) => `${item.title} x ${item.qty}`).join("\n");
  return (
    `שלום יעקב, הזמנה חדשה מהאתר:\n${lines}` +
    `\nסה"כ לתשלום: ₪${totalPrice}` +
    `\nשם הלקוח: ${name}` +
    `\nטלפון: ${phone}` +
    `\nמועד איסוף: ${date} בשעה ${time}`
  );
};

const buildOrderLinks = (message) => {
  const whatsappPhone = state.checkoutWhatsappPhone || DEFAULT_WHATSAPP_PHONE;
  const email = state.checkoutEmail || DEFAULT_ORDER_EMAIL;
  return {
    whatsappUrl: `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`,
    emailUrl: `mailto:${email}?subject=${encodeURIComponent(
      "הזמנה חדשה מהאתר"
    )}&body=${encodeURIComponent(message)}`,
  };
};

const openOrderChannelModal = (links) => {
  if (!orderChannelModal) return;
  state.pendingOrderLinks = links;
  orderChannelModal.classList.remove("hidden");
};

const closeOrderChannelModal = () => {
  if (!orderChannelModal) return;
  orderChannelModal.classList.add("hidden");
  state.pendingOrderLinks = null;
};

const clearCheckoutState = () => {
  state.cart = {};
  if (checkoutForm) {
    checkoutForm.reset();
  }
  updateCartUI();
};

const handleCheckout = async (event) => {
  event.preventDefault();
  if (!ensureSupabase()) return;
  
  // Clear any previous error
  if (checkoutError) {
    checkoutError.textContent = "";
    checkoutError.classList.add("hidden");
  }
  
  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    name: formData.get("name").trim(),
    phone: formData.get("phone").trim(),
    date: formData.get("date"),
    time: formData.get("time"),
    user_notes: formData.get("user_notes")?.trim() || "",
  };

  setPickupValidity();
  if (!event.target.checkValidity()) {
    event.target.reportValidity();
    return;
  }

  const pickupDateTime = getPickupDateTime(payload.date, payload.time);
  const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (!pickupDateTime || pickupDateTime < minDateTime) {
    if (checkoutError) {
      checkoutError.textContent = "יש לבחור מועד איסוף לפחות 24 שעות מראש.";
      checkoutError.classList.remove("hidden");
    }
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

  const { error } = await supabaseClient.from("orders").insert([
    {
      items,
      total: totalPrice,
      customer: payload,
      paid: false,
      notes: "",
      user_notes: payload.user_notes,
    },
  ]);

  if (error) {
    console.error(error);
    if (checkoutError) {
      checkoutError.textContent = TECH_SUPPORT_MESSAGE;
      checkoutError.classList.remove("hidden");
    }
    return;
  }

  await fetchOrders();
  openOrderChannelModal(links);
};

const handleCreateOrder = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;

  const name = orderName.value.trim();
  const createdAt = orderDate.value
    ? new Date(orderDate.value).toISOString()
    : new Date().toISOString();
  const total = Number(orderTotal.value) || 0;
  const paid = orderPaid.checked;
  const notes = orderNotes.value.trim();

  if (!name) {
    alert("יש להזין שם.");
    return;
  }

  const { error } = await supabaseClient.from("orders").insert([
    {
      items: [],
      total,
      customer: { name },
      paid,
      notes,
      created_at: createdAt,
    },
  ]);

  if (error) {
    console.error(error);
    alert(TECH_SUPPORT_MESSAGE);
    return;
  }

  orderName.value = "";
  orderDate.value = "";
  orderTotal.value = "";
  orderPaid.checked = false;
  orderNotes.value = "";
  orderModal.classList.add("hidden");
  await fetchOrders();
  renderAdmin();
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
  if (modalImage?.files?.length) {
    imageUrl = await uploadProductImage(modalImage.files[0], product.id);
  }

  product.title = modalTitle.value.trim();
  product.price = Number(modalPrice.value) || 0;
  product.categoryId = categoryId;
  product.categoryName = category?.category_name || product.categoryName || "";
  product.image = imageUrl;
  product.inStock = modalStock.checked;
  const modalDiscount = document.getElementById("modal-discount");
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

const generateId = (title) =>
  `${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

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
  const uploadedUrl = await uploadProductImage(
    createImage.files[0],
    createTitle.value.trim() || "product"
  );
  if (!uploadedUrl) return;
  const product = {
    title: createTitle.value.trim(),
    price: Number(createPrice.value) || 0,
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

  createTitle.value = "";
  createPrice.value = "";
  state.creatingCategoryId = null;
  setCategoryTriggerLabel(createCategoryTrigger, "בחר קטגוריה");
  createImage.value = "";
  closeCreateModal();
  await fetchProducts();
  renderProducts();
  renderAdmin();
};

const handleDeleteProduct = async (id) => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;

  const productId = normalizeProductId(id);
  if (!productId) {
    alert("מזהה מוצר לא תקין. יש לרענן את הדף.");
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

const handleAdminLogin = async (event) => {
  event.preventDefault();
  if (!ensureSupabase()) return;

  adminAuthErrorEl.classList.add("hidden");
  const formData = new FormData(event.target);
  const email = formData.get("email");
  const password = formData.get("password");

  const { error, data } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    adminAuthErrorEl.textContent = "פרטי ההתחברות שגויים.";
    adminAuthErrorEl.classList.remove("hidden");
    return;
  }

  state.session = data.session;
  await fetchProfile();
  if (state.role !== "admin") {
    adminAuthErrorEl.textContent = "אין הרשאות ניהול לחשבון זה.";
    adminAuthErrorEl.classList.remove("hidden");
    await supabaseClient.auth.signOut();
    state.session = null;
    state.role = null;
    setAdminUI(false);
    return;
  }

  adminGreetingEl.textContent = `Hello ${state.session.user.email}`;

  setAdminUI(true);
  await fetchOrders();
  renderAdmin();
};

const handleLogout = async () => {
  if (!ensureSupabase()) return;
  await supabaseClient.auth.signOut();
  state.session = null;
  state.role = null;
  adminGreetingEl.textContent = "";
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
  state.categories = (data || []).map((item) => ({
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
  
  // Update logo if URL exists in database, otherwise ensure default logo is visible
  if (data[0].logo_url) {
    console.log("[fetchSiteMeta] Setting logo from DB:", data[0].logo_url);
    setLogo(data[0].logo_url);
  } else {
    console.log("[fetchSiteMeta] No logo_url in DB, keeping default");
  }
  
  // Set admin inputs with fetched values (only for existing columns)
  if (adminContactBakeryPhoneInput) {
    adminContactBakeryPhoneInput.value = data[0].bakery_telephone || "";
  }
  if (adminContactStorePhoneInput) {
    adminContactStorePhoneInput.value = data[0].store_phone || "";
  }
  if (adminContactWhatsappInput) {
    // Strip the + prefix for display in admin input
    const whatsappValue = data[0].contact_whatsapp || "";
    adminContactWhatsappInput.value = whatsappValue.startsWith('+') ? whatsappValue.substring(1) : whatsappValue;
  }
  if (adminContactEmailInput) {
    adminContactEmailInput.value = data[0].contact_email || "";
  }
  if (adminContactAddressInput) {
    adminContactAddressInput.value = data[0].contact_address || "";
  }
  
  // Load hero fields if they exist
  if (adminHeroBadgeInput && data[0].hero_badge) {
    adminHeroBadgeInput.value = data[0].hero_badge;
    state.heroBadge = data[0].hero_badge;
    const heroBadge = document.getElementById("hero-badge");
    if (heroBadge) {
      heroBadge.textContent = data[0].hero_badge;
    }
  }
  if (adminHeroTitleInput && data[0].hero_title) {
    adminHeroTitleInput.value = data[0].hero_title;
    state.heroTitle = data[0].hero_title;
    const heroTitle = document.querySelector("#hero h2");
    if (heroTitle) {
      heroTitle.textContent = data[0].hero_title;
    }
  }
  if (adminHeroDescriptionInput && data[0].hero_description) {
    adminHeroDescriptionInput.value = data[0].hero_description;
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
    const heroImage = document.getElementById("hero-image");
    if (heroImage) {
      heroImage.src = data[0].hero_image_url;
    }
  }
  
  // Update contact display
  if (data[0].contact_phone) {
    updateContactPhone(data[0].contact_phone);
  }
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

const saveAboutContent = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  if (adminAboutStatus) {
    adminAboutStatus.textContent = "שומר...";
    adminAboutStatus.className = "text-sm mt-2 text-stone-500";
  }
  const text = adminAboutInput.value.trim();
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

const setLogo = (url) => {
  if (siteLogoEl) {
    siteLogoEl.src = url;
  }
  if (adminLogoPreview) {
    adminLogoPreview.src = url;
  }
};

const uploadLogoImage = async (file) => {
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

const uploadHeroImage = async (file) => {
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

const saveHeroImage = async (file) => {
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

const saveLogoImage = async (file) => {
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
  adminLogoInput.value = "";
};

const updateContactPhone = (phone) => {
  // contactPhone display is now handled by updateContactBakeryPhone
  // This function kept for backward compatibility
};

const updateContactBakeryPhone = (phone) => {
  const safePhone = phone || CONTACT_PHONE;
  state.bakeryPhone = safePhone;
  if (contactBakeryPhoneEl) {
    contactBakeryPhoneEl.textContent = safePhone;
  }
  if (contactBakeryPhoneLinkEl) {
    contactBakeryPhoneLinkEl.href = `tel:${safePhone}`;
  }
};

const updateContactStorePhone = (phone) => {
  const safePhone = phone || CONTACT_PHONE;
  state.storePhone = safePhone;
  if (contactStorePhoneEl) {
    contactStorePhoneEl.textContent = safePhone;
  }
  if (contactStorePhoneLinkEl) {
    contactStorePhoneLinkEl.href = `tel:${safePhone}`;
  }
};

const updateContactWhatsapp = (whatsapp) => {
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

const updateContactEmail = (email) => {
  state.checkoutEmail = email || DEFAULT_ORDER_EMAIL;
  if (contactEmailEl) {
    contactEmailEl.href = `mailto:${email}`;
  }
  if (contactEmailTextEl) {
    contactEmailTextEl.textContent = email;
  }
};

const updateContactAddress = (address) => {
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
  
  const title = adminHeaderTitleInput.value.trim();
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
  
  const badge = adminHeroBadgeInput.value.trim();
  const title = adminHeroTitleInput.value.trim();
  const description = adminHeroDescriptionInput.value.trim();
  const imageUrl = state.heroImageUrl;
  
  // Collect chip values from dynamic inputs
  const chips = Array.from(document.querySelectorAll(".hero-chip-input"))
    .map((input) => input.value.trim())
    .filter((chip) => chip.length > 0);
  
  if (!title || !description) {
    alert("יש למלא לפחות כותרת ותיאור.");
    if (adminHeroStatus) {
      adminHeroStatus.textContent = "שגיאה: נא למלא לפחות כותרת ותיאור.";
      adminHeroStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  const payload = { 
    hero_badge: badge,
    hero_title: title,
    hero_description: description,
    hero_chips: chips,
    hero_image_url: imageUrl
  };
  
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
  const heroBadge = document.getElementById("hero-badge");
  if (heroBadge && badge) {
    heroBadge.textContent = badge;
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
  
  const heroImage = document.getElementById("hero-image");
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
    
    const input = chipDiv.querySelector(".hero-chip-input");
    if (input) {
      input.addEventListener("input", (e) => {
        state.heroChips[index] = e.target.value;
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
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const renderFeaturedProductsCheckboxes = () => {
  if (!adminFeaturedProductsContainer) return;
  adminFeaturedProductsContainer.innerHTML = "";
  
  // Only show in-stock products
  const inStockProducts = state.products.filter((p) => p.inStock);
  
  inStockProducts.forEach((product) => {
    const isChecked = state.featuredProductIds && state.featuredProductIds.includes(product.id);
    const label = document.createElement("label");
    label.className = "flex items-center gap-2 p-2 hover:bg-amber-50 rounded cursor-pointer";
    label.innerHTML = `
      <input type="checkbox" value="${product.id}" class="featured-product-checkbox" ${isChecked ? 'checked' : ''} />
      <span class="text-sm">${product.title}</span>
    `;
    adminFeaturedProductsContainer.appendChild(label);
  });
};

const saveFeaturedProducts = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  if (adminFeaturedStatus) {
    adminFeaturedStatus.textContent = "שומר...";
    adminFeaturedStatus.className = "text-sm mt-2 text-stone-500";
  }
  
  const checkboxes = document.querySelectorAll(".featured-product-checkbox");
  const selectedIds = Array.from(checkboxes)
    .filter((cb) => cb.checked)
    .map((cb) => Number(cb.value));
  
  if (selectedIds.length === 0) {
    alert("בחרו לפחות מוצר אחד.");
    if (adminFeaturedStatus) {
      adminFeaturedStatus.textContent = "שגיאה: בחרו לפחות מוצר אחד.";
      adminFeaturedStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  // Delete all existing featured products
  const { error: deleteError } = await supabaseClient
    .from("featured_products")
    .delete()
    .eq("site_metadata_id", state.siteMetaId);

  if (deleteError) {
    console.error(deleteError);
    if (adminFeaturedStatus) {
      showTechErrorStatus(adminFeaturedStatus);
    }
    return;
  }

  // Insert new featured products
  const payload = selectedIds.map((productId) => ({
    product_id: productId,
    site_metadata_id: state.siteMetaId,
  }));

  const { error } = await supabaseClient
    .from("featured_products")
    .insert(payload);

  if (error) {
    console.error(error);
    if (adminFeaturedStatus) {
      showTechErrorStatus(adminFeaturedStatus);
    }
    return;
  }

  state.featuredProductIds = selectedIds;
  // Update featured products array and re-render (filter out-of-stock)
  state.featuredProducts = state.products.filter((p) =>
    selectedIds.includes(p.id) && p.inStock
  );
  renderProducts();
  
  if (adminFeaturedStatus) {
    adminFeaturedStatus.textContent = "נשמר בהצלחה ✓";
    adminFeaturedStatus.className = "text-sm mt-2 text-green-600";
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

  const bakeryPhone = adminContactBakeryPhoneInput.value.trim();
  const storePhone = adminContactStorePhoneInput
    ? adminContactStorePhoneInput.value.trim()
    : bakeryPhone;
  let whatsapp = adminContactWhatsappInput.value.trim();
  const email = adminContactEmailInput.value.trim();
  const address = adminContactAddressInput.value.trim();

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
  
  updateContactPhone(bakeryPhone);
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

const fetchFeaturedProducts = async () => {
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

  state.featuredProductIds = (data || []).map((item) => item.product_id);
  renderFeaturedProductsCheckboxes();
};

const fetchOrders = async () => {
  if (!ensureSupabase()) return;
  if (!state.session) return;

  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

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
    adminGreetingEl.textContent = `Hello ${state.session.user.email}`;
    await fetchOrders();
    renderAdmin();
    renderFeaturedProductsCheckboxes();
  }
};

const updateOrderField = async (id, field, value) => {
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

const showOrderDetails = (order) => {
  const items = (order.items || [])
    .map((item) => `${item.title} x ${item.qty}`)
    .join("<br />");
  orderDetailsContent.innerHTML = `
    <div><strong>מזהה הזמנה:</strong> ${order.order_number ?? ""}</div>
    <div><strong>שם:</strong> ${order.customer?.name || ""}</div>
    <div><strong>טלפון:</strong> ${order.customer?.phone || ""}</div>
    <div><strong>תאריך:</strong> ${new Date(order.created_at).toLocaleString(
      "he-IL"
    )}</div>
    <div><strong>סכום:</strong> ${formatCurrency(order.total)}</div>
    <div><strong>שולם:</strong> ${order.paid ? "כן" : "לא"}</div>
    <div><strong>הערות מנהל:</strong> ${order.notes || "-"}</div>
    <div><strong>הערות לקוח:</strong> ${order.user_notes || "-"}</div>
    <div><strong>פריטים:</strong><br />${items || "-"}</div>
  `;
  orderDetailsModal.classList.remove("hidden");
};

const openModal = (product) => {
  console.log("[openModal] Opening for product:", product);
  state.editingProductId = product.id;
  modalTitle.value = product.title;
  modalPrice.value = product.price;
  const modalDiscount = document.getElementById("modal-discount");
  if (modalDiscount) {
    modalDiscount.value = product.discountPercentage || 0;
  }
  const initialCategoryId = normalizeCategoryId(product.categoryId);
  console.log("[openModal] After normalizeProductId, initialCategoryId:", initialCategoryId);
  if (initialCategoryId) {
    state.editingCategoryId = initialCategoryId;
    console.log("[openModal] Using normalizedId, set state.editingCategoryId:", initialCategoryId);
  } else if (product.categoryName || product.category) {
    const match = state.categories.find(
      (item) => item.category_name === (product.categoryName || product.category)
    );
    state.editingCategoryId = match ? match.category_id : null;
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
  modalImage.value = "";
  modalStock.checked = product.inStock;
  if (modalStatus) {
    modalStatus.textContent = "";
    modalStatus.className = "text-sm mt-2";
  }
  productModal.classList.remove("hidden");
};

const closeModal = () => {
  productModal.classList.add("hidden");
  state.editingProductId = null;
};

const openCreateProductModal = () => {
  if (!state.creatingCategoryId && state.categories.length) {
    state.creatingCategoryId = state.categories[0].category_id;
    setCategoryTriggerLabel(
      createCategoryTrigger,
      state.categories[0].category_name,
      state.categories[0].category_id
    );
  }
  ensureCategoryOptions();
  createModal.classList.remove("hidden");
};

const openCategoryModal = () => {
  categoryModal.classList.remove("hidden");
  if (categoryStatus) {
    categoryStatus.textContent = "";
    categoryStatus.className = "text-sm mt-2";
  }
};

const closeCategoryModal = () => {
  categoryModal.classList.add("hidden");
};

const openCategoryEditModal = (category) => {
  if (!categoryEditModal) return;
  state.editingCategoryRowId = category.category_id;
  categoryEditNameInput.value = category.category_name;
  if (categoryEditImageInput) {
    categoryEditImageInput.value = "";
  }
  if (categoryEditPreview) {
    const previewSrc = category.image_url || "assets/all_categories.png";
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

  const name = categoryEditNameInput.value.trim();
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
  let imageUrl = category?.image_url || "assets/all_categories.png";
  if (categoryEditImageInput?.files?.length) {
    const file = categoryEditImageInput.files[0];
    const uploadedUrl = await uploadCategoryImage(file, name || "category");
    if (!uploadedUrl) {
      if (categoryEditStatus) {
        showTechErrorStatus(categoryEditStatus);
      }
      return;
    }
    imageUrl = uploadedUrl;
  }

  const { error } = await supabaseClient
    .from("categories")
    .update({ name, image_url: imageUrl })
    .eq("id", state.editingCategoryRowId);

  if (error) {
    console.error(error);
    if (categoryEditStatus) {
      showTechErrorStatus(categoryEditStatus);
    }
    return;
  }

  await fetchCategories();
  renderAdmin();
  renderCategoryCarousel();
  closeCategoryEditModal();
};

const handleCreateCategory = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  const name = categoryNameInput.value.trim();
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

  let imageUrl = "assets/all_categories.png";
  if (categoryImageInput?.files?.length) {
    const file = categoryImageInput.files[0];
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
  categoryNameInput.value = "";
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
};

const closeCreateModal = () => {
  createModal.classList.add("hidden");
};

const openOrderModal = () => {
  orderModal.classList.remove("hidden");
};

const closeOrderModal = () => {
  orderModal.classList.add("hidden");
};

const openDeleteConfirm = () => {
  deleteConfirmModal.classList.remove("hidden");
};

const closeDeleteConfirm = () => {
  deleteConfirmModal.classList.add("hidden");
};

const openNotesPopover = (inputEl) => {
  if (!inputEl) return;
  activeNotesInput = inputEl;
  notesTextarea.value = inputEl.value || "";
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
  requestAnimationFrame(() => notesTextarea.focus());
};

const closeNotesPopover = (shouldSave = false) => {
  if (!activeNotesInput) {
    notesPopover.classList.add("hidden");
    return;
  }
  if (shouldSave) {
    const trimmed = notesTextarea.value.trim();
    activeNotesInput.value = trimmed;
    updateOrderField(activeNotesInput.dataset.orderId, "notes", trimmed);
  }
  notesPopover.classList.add("hidden");
  activeNotesInput = null;
};

const setupListeners = () => {
  // Logo click to go back to home
  if (siteLogoEl) {
    siteLogoEl.addEventListener("click", () => {
      window.location.hash = "#";
      document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
    });
  }

  const updateSortIndicators = (tableEl, sortState) => {
    if (!tableEl) return;
    tableEl
      .querySelectorAll("th[data-sort]")
      .forEach((header) => {
        if (header.dataset.sort === sortState.key) {
          header.dataset.sortDir = sortState.dir;
        } else {
          delete header.dataset.sortDir;
        }
      });
  };

  adminProductsTable.addEventListener("click", (event) => {
    const header = event.target.closest("th[data-sort]");
    if (!header) return;
    const key = header.dataset.sort;
    if (state.sortProducts.key === key) {
      state.sortProducts.dir = state.sortProducts.dir === "asc" ? "desc" : "asc";
    } else {
      state.sortProducts.key = key;
      state.sortProducts.dir = "asc";
    }
    updateSortIndicators(adminProductsTable, state.sortProducts);
    renderAdmin();
  });

  adminOrdersTable.addEventListener("click", (event) => {
    const header = event.target.closest("th[data-sort]");
    if (!header) return;
    const key = header.dataset.sort;
    if (state.sortOrders.key === key) {
      state.sortOrders.dir = state.sortOrders.dir === "asc" ? "desc" : "asc";
    } else {
      state.sortOrders.key = key;
      state.sortOrders.dir = "asc";
    }
    updateSortIndicators(adminOrdersTable, state.sortOrders);
    renderAdmin();
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) {
      if (button.dataset.action === "add") {
        addToCart(button.dataset.id);
      }

      if (button.dataset.action === "inc") {
        updateQty(button.dataset.id, 1);
      }

      if (button.dataset.action === "dec") {
        updateQty(button.dataset.id, -1);
      }
    }

    const row = event.target.closest("tr");
    if (row && row.dataset.id && row.parentElement === adminProductsEl) {
      const product = state.products.find(
        (item) => String(item.id) === row.dataset.id
      );
      if (product) {
        openModal(product);
      }
    }
  });

  if (adminCategoriesEl) {
    adminCategoriesEl.addEventListener("click", (event) => {
      const row = event.target.closest("tr");
      if (!row || !row.dataset.categoryId) return;
      const category = state.categories.find(
        (item) => String(item.category_id) === String(row.dataset.categoryId)
      );
      if (category) {
        openCategoryEditModal(category);
      }
    });
  }

  document.getElementById("close-cart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  floatingCart.addEventListener("click", openCart);

  document
    .getElementById("checkout-scroll")
    .addEventListener("click", () => {
      closeCart();
      document.getElementById("checkout").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

  document
    .getElementById("checkout-form")
    .addEventListener("submit", handleCheckout);

  if (pickupDateInput) {
    pickupDateInput.addEventListener("change", updatePickupConstraints);
    pickupDateInput.addEventListener("input", setPickupValidity);
  }
  if (pickupTimeInput) {
    pickupTimeInput.addEventListener("input", updatePickupConstraints);
    pickupTimeInput.addEventListener("change", setPickupValidity);
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
      window.location.href = whatsappUrl;
    });
  }
  if (orderChannelEmail) {
    orderChannelEmail.addEventListener("click", () => {
      const emailUrl = state.pendingOrderLinks?.emailUrl;
      if (!emailUrl) return;
      clearCheckoutState();
      closeOrderChannelModal();
      window.location.href = emailUrl;
    });
  }

  adminNewOrderButton.addEventListener("click", openOrderModal);
  orderModalClose.addEventListener("click", closeOrderModal);
  orderSave.addEventListener("click", handleCreateOrder);
  orderDetailsClose.addEventListener("click", () => {
    orderDetailsModal.classList.add("hidden");
  });

  adminOrdersEl.addEventListener("change", (event) => {
    const target = event.target;
    const field = target.dataset.orderField;
    const id = target.dataset.orderId;
    if (!field || !id) return;

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

  adminOrdersEl.addEventListener(
    "click",
    (event) => {
      const notesInput = event.target.closest(
        'input[data-order-field="notes"]'
      );
      if (notesInput) {
        event.preventDefault();
        event.stopPropagation();
        openNotesPopover(notesInput);
        return;
      }
    },
    true
  );

  adminOrdersEl.addEventListener("click", (event) => {
    if (event.target.closest("input")) return;
    const row = event.target.closest("tr");
    if (!row || !row.dataset.orderId) return;
    const order = state.orders.find((item) => item.id === row.dataset.orderId);
    if (!order) return;
    showOrderDetails(order);
  });

  document.addEventListener("click", (event) => {
    if (notesPopover.classList.contains("hidden")) return;
    const isNotesInput = event.target.closest(
      'input[data-order-field="notes"]'
    );
    if (notesPopover.contains(event.target) || isNotesInput) return;
    closeNotesPopover(true);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNotesPopover(false);
    }
  });

  adminSearchInput.addEventListener("input", renderAdmin);
  adminOrdersSearchInput.addEventListener("input", renderAdmin);
  if (productSearchInput) {
    productSearchInput.addEventListener("input", renderProducts);
  }
  if (adminAboutSave) {
    adminAboutSave.addEventListener("click", saveAboutContent);
  }
  if (adminHeaderTitleSave) {
    adminHeaderTitleSave.addEventListener("click", saveHeaderTitle);
  }
  if (adminHeroSave) {
    adminHeroSave.addEventListener("click", saveHero);
  }
  if (adminHeroBadgeInput) {
    adminHeroBadgeInput.addEventListener("input", (e) => {
      state.heroBadge = e.target.value;
    });
  }
  if (adminHeroTitleInput) {
    adminHeroTitleInput.addEventListener("input", (e) => {
      state.heroTitle = e.target.value;
    });
  }
  if (adminHeroDescriptionInput) {
    adminHeroDescriptionInput.addEventListener("input", (e) => {
      state.heroDescription = e.target.value;
    });
  }
  if (adminHeroAddChipBtn) {
    adminHeroAddChipBtn.addEventListener("click", () => {
      state.heroChips.push("");
      renderHeroChipsAdmin();
    });
  }
  if (adminFeaturedSave) {
    adminFeaturedSave.addEventListener("click", saveFeaturedProducts);
  }
  if (adminContactSave) {
    adminContactSave.addEventListener("click", saveContactInfo);
  }
  
  // Logo replacement button and file input handlers
  if (adminLogoReplaceBtn) {
    adminLogoReplaceBtn.addEventListener("click", () => {
      adminLogoInput.click();
    });
  }
  
  if (adminLogoInput) {
    adminLogoInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (file) {
        await saveLogoImage(file);
      }
    });
  }
  
  if (adminHeroImageFile) {
    adminHeroImageFile.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (file) {
        await saveHeroImage(file);
      }
    });
  }
  
  modalSave.addEventListener("click", handleAdminChange);
  modalClose.addEventListener("click", closeModal);
  modalDelete.addEventListener("click", () => {
    if (state.editingProductId) {
      openDeleteConfirm();
    }
  });

  deleteConfirmClose.addEventListener("click", closeDeleteConfirm);
  deleteConfirmNo.addEventListener("click", closeDeleteConfirm);
  deleteConfirmYes.addEventListener("click", () => {
    if (state.editingProductId) {
      handleDeleteProduct(state.editingProductId);
    }
    closeDeleteConfirm();
  });

  openCreateModal.addEventListener("click", openCreateProductModal);
  createModalClose.addEventListener("click", closeCreateModal);
  createSave.addEventListener("click", handleCreateProduct);

  modalCategoryTrigger.addEventListener("click", () => {
    modalCategoryDropdown.classList.toggle("open");
  });
  createCategoryTrigger.addEventListener("click", () => {
    createCategoryDropdown.classList.toggle("open");
  });
  modalCategorySearch.addEventListener("input", () =>
    renderCategoryDropdown(modalCategoryDropdown, {
      searchInput: modalCategorySearch,
      listEl: modalCategoryList,
      getSelectedId: () => state.editingCategoryId,
      setSelectedId: (id) => {
        state.editingCategoryId = id;
      },
      triggerEl: modalCategoryTrigger,
    })
  );
  createCategorySearch.addEventListener("input", () =>
    renderCategoryDropdown(createCategoryDropdown, {
      searchInput: createCategorySearch,
      listEl: createCategoryList,
      getSelectedId: () => state.creatingCategoryId,
      setSelectedId: (id) => {
        state.creatingCategoryId = id;
      },
      triggerEl: createCategoryTrigger,
    })
  );

  categoryModalClose.addEventListener("click", closeCategoryModal);
  categorySave.addEventListener("click", handleCreateCategory);
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
      !modalCategoryDropdown.contains(event.target) &&
      modalCategoryDropdown.classList.contains("open")
    ) {
      modalCategoryDropdown.classList.remove("open");
    }
    if (
      !createCategoryDropdown.contains(event.target) &&
      createCategoryDropdown.classList.contains("open")
    ) {
      createCategoryDropdown.classList.remove("open");
    }
  });

  document
    .getElementById("admin-login-form")
    .addEventListener("submit", handleAdminLogin);

  adminLogoutButton.addEventListener("click", handleLogout);

  window.addEventListener("hashchange", updateRoute);
};

const init = async () => {
  console.log("[init] Starting initialization...");
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
  renderProducts();
  updateCartUI();
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      state.session = session;
    });
  }
  await openAdminIfSession();
  const productHeaders = document.getElementById("admin-products-table");
  const orderHeaders = document.getElementById("admin-orders-table");
  if (productHeaders) {
    productHeaders
      .querySelectorAll("th[data-sort]")
      .forEach((header) => {
        if (header.dataset.sort === state.sortProducts.key) {
          header.dataset.sortDir = state.sortProducts.dir;
        }
      });
  }
  if (orderHeaders) {
    orderHeaders
      .querySelectorAll("th[data-sort]")
      .forEach((header) => {
        if (header.dataset.sort === state.sortOrders.key) {
          header.dataset.sortDir = state.sortOrders.dir;
        }
      });
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

init();
