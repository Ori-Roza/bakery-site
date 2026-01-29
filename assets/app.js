import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const CONTACT_PHONE = "050-123-4567";
const CONTACT_PHONE_INTL = "972501234567";
const CONTACT_EMAIL = "ori.roza@bluevine.com";
const WHATSAPP_PHONE = CONTACT_PHONE_INTL;
const ORDER_EMAIL = CONTACT_EMAIL;

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
};

const featuredTrackEl = document.getElementById("featured-track");
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
const adminOrdersTable = document.getElementById("admin-orders-table");
const adminOrdersSearchInput = document.getElementById("admin-orders-search");
const orderDetailsModal = document.getElementById("order-details-modal");
const orderDetailsClose = document.getElementById("order-details-close");
const orderDetailsContent = document.getElementById("order-details-content");
const aboutContentEl = document.getElementById("about-content");
const adminAboutInput = document.getElementById("admin-about");
const adminAboutSave = document.getElementById("admin-about-save");
const adminAboutStatus = document.getElementById("admin-about-status");
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
const contactPhoneEl = document.getElementById("contact-phone");
const contactWhatsappEl = document.getElementById("contact-whatsapp");
const contactEmailEl = document.getElementById("contact-email");
const contactEmailTextEl = document.getElementById("contact-email-text");
const siteLogoEl = document.getElementById("site-logo");
const adminLogoPreview = document.getElementById("admin-logo-preview");
const adminLogoReplaceBtn = document.getElementById("admin-logo-replace-btn");
const adminLogoInput = document.getElementById("admin-logo-input");
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
  categoryId: row.category_id || row.categoryId || row.category_id,
  categoryName: row.categories?.name || row.category || "",
  image: row.image,
  inStock: row.in_stock,
});

const mapProductToDb = (product, { includeId = false } = {}) => {
  const payload = {
    title: product.title,
    price: product.price,
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
      return { ...product, qty, lineTotal: product.price * qty };
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
        <p class="text-sm text-stone-500">${formatCurrency(item.price)} ליח'</p>
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
  if (featuredTrackEl) {
    featuredTrackEl.innerHTML = "";
    const featured = state.featuredProducts.length
      ? state.featuredProducts
      : pickRandomProducts(state.products, 5);
    featured.forEach((product) => {
      const card = document.createElement("article");
      card.className = "carousel-card";
      card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" />
        <div class="carousel-content">
          <div class="flex items-start justify-between gap-2">
            <h5 class="font-semibold text-lg">${product.title}</h5>
            <span class="text-amber-900 font-bold">${formatCurrency(
              product.price
            )}</span>
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
      featuredTrackEl.appendChild(card);
    });
  }

  if (productsScrollEl) {
    const query = productSearchInput?.value?.trim().toLowerCase() || "";
    const items = [...state.products]
      .filter((product) =>
        product.title.toLowerCase().includes(query)
      )
      .sort((a, b) => a.title.localeCompare(b.title, "he"));

    productsScrollEl.innerHTML = "";
    items.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="product-image" />
        <div class="product-content">
          <div class="flex items-start justify-between gap-2">
            <h5 class="font-semibold text-lg">${product.title}</h5>
            <span class="text-amber-900 font-bold">${formatCurrency(
              product.price
            )}</span>
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
    if (productKey === "price") {
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
      <td>${product.inStock ? "כן" : "לא"}</td>
    `;
    adminProductsEl.appendChild(row);
  });

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
      "<td colspan='7' class='text-sm text-stone-500'>עדיין אין הזמנות להצגה.</td>";
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
          placeholder="הערות"
          readonly
        />
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
    alert("העלאת התמונה נכשלה.");
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

const handleCheckout = async (event) => {
  event.preventDefault();
  if (!ensureSupabase()) return;
  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    name: formData.get("name").trim(),
    phone: formData.get("phone").trim(),
    date: formData.get("date"),
    time: formData.get("time"),
  };

  const { items, totalPrice } = getCartTotals();
  if (!items.length) {
    alert("העגלה ריקה. הוסיפו מוצרים לפני שליחת ההזמנה.");
    return;
  }

  const message = buildOrderMessage({
    ...payload,
    items,
    totalPrice,
  });
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const url = isMobile
    ? `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
    : `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(
        "הזמנה חדשה מהאתר"
      )}&body=${encodeURIComponent(message)}`;

  const { error } = await supabaseClient.from("orders").insert([
    {
      items,
      total: totalPrice,
      customer: payload,
      paid: false,
      notes: "",
    },
  ]);

  if (error) {
    alert("לא ניתן לשמור הזמנה כרגע. נסו שוב.");
    return;
  }

  state.cart = {};
  form.reset();
  updateCartUI();
  await fetchOrders();

  window.location.href = url;
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
    alert("לא ניתן ליצור הזמנה.");
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

  const { error } = await supabaseClient
    .from("products")
    .update(mapProductToDb(product))
    .eq("id", productId);
  if (error) {
    console.error(error);
    if (modalStatus) {
      modalStatus.textContent = `עדכון המוצר נכשל: ${
        error.message || "שגיאה לא ידועה"
      }`;
      modalStatus.className = "text-sm mt-2 text-rose-600";
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
    alert("יצירת המוצר נכשלה.");
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
    alert(`מחיקת המוצר נכשלה: ${error.message || "שגיאה לא ידועה"}`);
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
    .select("id,title,price,image,in_stock,category_id")
    .order("id", { ascending: true });

  console.log("[fetchProducts] data:", data);

  if (error) {
    console.error("[fetchProducts] error:", error);
    state.products = [];
    state.featuredProducts = [];
    return;
  }

  if (!data || data.length === 0) {
    state.products = [];
    state.featuredProducts = [];
    ensureCategoryOptions();
    return;
  }

  state.products = data.map(mapDbToProduct);
  state.featuredProducts = pickRandomProducts(state.products, 5);
};

const fetchCategories = async () => {
  if (!ensureSupabase()) {
    console.log("[fetchCategories] Supabase not configured, skipping");
    return;
  }
  console.log("[fetchCategories] Fetching from database...");
  const { data, error } = await supabaseClient
    .from("categories")
    .select("id,name");

  if (error) {
    console.error("[fetchCategories] Error:", error);
    state.categories = [];
    return;
  }

  console.log("[fetchCategories] Fetched raw data:", data);
  state.categories = (data || []).map((item) => ({
    category_id: item.id,
    category_name: item.name,
  }));
  console.log("[fetchCategories] Mapped categories:", state.categories);
  ensureCategoryOptions();
};

const fetchSiteMeta = async () => {
  if (!ensureSupabase()) {
    setAboutContent(DEFAULT_ABOUT);
    return;
  }
  const { data, error } = await supabaseClient
    .from("site_metadata")
    .select("id,about_section,logo_url")
    .limit(1);

  if (error) {
    console.error(error);
    setAboutContent(DEFAULT_ABOUT);
    return;
  }

  if (!data || !data.length) {
    setAboutContent(DEFAULT_ABOUT);
    state.siteMetaId = null;
    return;
  }

  state.siteMetaId = data[0].id;
  setAboutContent(data[0].about_section || DEFAULT_ABOUT);
  
  // Update logo if URL exists in database
  if (data[0].logo_url) {
    setLogo(data[0].logo_url);
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
    alert("לא ניתן לשמור אודות כרגע.");
    if (adminAboutStatus) {
      adminAboutStatus.textContent = "שגיאה בשמירה. בדקו הרשאות.";
      adminAboutStatus.className = "text-sm mt-2 text-rose-600";
    }
    return;
  }

  await fetchSiteMeta();
  if (adminAboutStatus) {
    adminAboutStatus.textContent = "נשמר בהצלחה";
    adminAboutStatus.className = "text-sm mt-2 text-amber-900";
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
    alert("העלאת הלוגו נכשלה.");
    return null;
  }

  const { data } = supabaseClient.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
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
    alert("לא ניתן לשמור לוגו כרגע.");
    return;
  }

  setLogo(logoUrl);
  await fetchSiteMeta();
  
  alert("הלוגו נשמר בהצלחה!");
  
  // Clear the file input
  adminLogoInput.value = "";
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
    <div><strong>הערות:</strong> ${order.notes || "-"}</div>
    <div><strong>פריטים:</strong><br />${items || "-"}</div>
  `;
  orderDetailsModal.classList.remove("hidden");
};

const openModal = (product) => {
  console.log("[openModal] Opening for product:", product);
  state.editingProductId = product.id;
  modalTitle.value = product.title;
  modalPrice.value = product.price;
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
};

const closeCategoryModal = () => {
  categoryModal.classList.add("hidden");
};

const handleCreateCategory = async () => {
  if (!ensureSupabase()) return;
  if (!ensureAdmin()) return;
  const name = categoryNameInput.value.trim();
  if (!name) {
    alert("יש להזין שם קטגוריה.");
    return;
  }
  const { error } = await supabaseClient.from("categories").insert([
    { name },
  ]);
  if (error) {
    console.error(error);
    alert("לא ניתן ליצור קטגוריה.");
    return;
  }
  categoryNameInput.value = "";
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
  adminAboutSave.addEventListener("click", saveAboutContent);
  
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

  if (contactPhoneEl) {
    contactPhoneEl.href = `tel:+${CONTACT_PHONE_INTL}`;
    contactPhoneEl.lastChild.textContent = CONTACT_PHONE;
  }
  if (contactWhatsappEl) {
    contactWhatsappEl.href = `https://wa.me/${CONTACT_PHONE_INTL}`;
  }
  if (contactEmailEl) {
    contactEmailEl.href = `mailto:${CONTACT_EMAIL}`;
    if (contactEmailTextEl) {
      contactEmailTextEl.textContent = CONTACT_EMAIL;
    }
  }

  if (!supabaseClient) {
    console.log("[init] No Supabase client, exiting early");
    state.products = [];
    state.featuredProducts = [];
    renderProducts();
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
  
  await fetchProducts();
  console.log("[init] After fetchProducts, state.products.length:", state.products.length);
  
  await fetchSiteMeta();
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
