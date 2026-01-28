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

const seedProducts = [
  {
    id: "challah-classic",
    title: "חלת שבת קלועה (רגילה)",
    price: 20,
    category: "חלות ולחמים לשבת",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "challah-sweet",
    title: "חלה מתוקה (עם צימוקים/מתוקה במיוחד)",
    price: 24,
    category: "חלות ולחמים לשבת",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "spelt-challah",
    title: "חלת כוסמין מלא",
    price: 28,
    category: "חלות ולחמים לשבת",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "sourdough",
    title: "לחם מחמצת כפרי (כיכר)",
    price: 32,
    category: "חלות ולחמים לשבת",
    image:
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "grain-loaf",
    title: "לחם דגנים מלא",
    price: 29,
    category: "חלות ולחמים לשבת",
    image:
      "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "baguette",
    title: "בגט צרפתי קלאסי",
    price: 12,
    category: "חלות ולחמים לשבת",
    image:
      "https://images.unsplash.com/photo-1511914265871-bcd2d46e1d20?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "rugelach",
    title: "רוגלך שוקולד (מארז של כ-10 יח')",
    price: 35,
    category: "מאפים מתוקים",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "croissant",
    title: "קרואסון חמאה קלאסי (יחידה)",
    price: 14,
    category: "מאפים מתוקים",
    image:
      "https://images.unsplash.com/photo-1514517220017-8ce97a34a7b6?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "croissant-choco",
    title: "קרואסון שוקולד / שקדים (יחידה)",
    price: 16,
    category: "מאפים מתוקים",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "yeast-cake",
    title: "פס עוגת שמרים (שוקולד / קינמון / גבינה)",
    price: 42,
    category: "מאפים מתוקים",
    image:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "cookies",
    title: "מארז עוגיות ביתיות (עוגיות חמאה/טחינה)",
    price: 30,
    category: "מאפים מתוקים",
    image:
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "burekas",
    title: "בורקס גבינה / תפו\"א (גדול, יחידה)",
    price: 10,
    category: "מאפים מלוחים",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "burekas-box",
    title: "מארז בורקסים קטנים (מיקס)",
    price: 40,
    category: "מאפים מלוחים",
    image:
      "https://images.unsplash.com/photo-1604908811579-71e2d7bf47a0?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "ziva",
    title: "מאפה זיווה (עם רסק וביצה)",
    price: 28,
    category: "מאפים מלוחים",
    image:
      "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
  {
    id: "personal-pizza",
    title: "פיצה אישית מהטאבון",
    price: 25,
    category: "מאפים מלוחים",
    image:
      "https://images.unsplash.com/photo-1548365328-8b849e6f7c2a?auto=format&fit=crop&w=900&q=80",
    inStock: true,
  },
];

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
const adminSetPasswordEl = document.getElementById("admin-set-password");
const adminSetPasswordForm = document.getElementById("admin-set-password-form");
const adminNewPassword = document.getElementById("admin-new-password");
const adminConfirmPassword = document.getElementById("admin-confirm-password");
const adminSetPasswordStatus = document.getElementById(
  "admin-set-password-status"
);
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

const mapProductToDb = (product) => ({
  id: product.id,
  title: product.title,
  price: product.price,
  category_id: product.categoryId || product.category_id || null,
  image: product.image,
  in_stock: product.inStock,
});

const getCategoryLabel = (product) =>
  product.categoryName || product.category || "";

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
  const categories = state.categories.length
    ? state.categories
    : Array.from(
        new Set(seedProducts.map((product) => product.category))
      ).map((name) => ({ id: name, name }));

  const filtered = categories.filter((category) =>
    category.name.toLowerCase().includes(query)
  );

  listEl.innerHTML = "";
  filtered.forEach((category) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "dropdown-item";
    if (getSelectedId() === category.id) {
      item.classList.add("active");
    }
    item.textContent = category.name;
    item.addEventListener("click", () => {
      setSelectedId(category.id);
      setCategoryTriggerLabel(triggerEl, category.name);
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

const setCategoryTriggerLabel = (triggerEl, label) => {
  if (!triggerEl) return;
  triggerEl.textContent = label || "בחר קטגוריה";
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
  const pool = [...items];
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
      "<td colspan='6' class='text-sm text-stone-500'>עדיין אין הזמנות להצגה.</td>";
    adminOrdersEl.appendChild(row);
    return;
  }

  filteredOrders.forEach((order) => {
    const row = document.createElement("tr");
    row.dataset.orderId = order.id;
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
    `;
    adminOrdersEl.appendChild(row);
  });
};

const updateRoute = () => {
  const isAdmin = window.location.hash === "#admin";
  adminSection.classList.toggle("hidden", !isAdmin);
  document.getElementById("catalog").classList.toggle("hidden", isAdmin);
  document.getElementById("checkout").classList.toggle("hidden", isAdmin);
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

const setPasswordUI = (show) => {
  if (!adminSetPasswordEl) return;
  adminSetPasswordEl.classList.toggle("hidden", !show);
  if (show) {
    adminAuthEl.classList.add("hidden");
  }
};

const getAuthTypeFromHash = () => {
  const hash = window.location.hash || "";
  if (!hash.includes("access_token")) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return params.get("type");
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

  const categoryId = state.editingCategoryId;
  if (!categoryId) {
    alert("יש לבחור קטגוריה.");
    return;
  }

  const category = state.categories.find((item) => item.id === categoryId);

  let imageUrl = product.image;
  if (modalImage?.files?.length) {
    imageUrl = await uploadProductImage(modalImage.files[0], product.id);
  }

  product.title = modalTitle.value.trim();
  product.price = Number(modalPrice.value) || 0;
  product.categoryId = categoryId;
  product.categoryName = category?.name || product.categoryName || "";
  product.image = imageUrl;
  product.inStock = modalStock.checked;

  await supabaseClient
    .from("products")
    .update(mapProductToDb(product))
    .eq("id", product.id);

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

  const categoryId = state.creatingCategoryId;
  if (!categoryId) {
    alert("יש לבחור קטגוריה.");
    return;
  }

  const category = state.categories.find((item) => item.id === categoryId);
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
    id: generateId(createTitle.value),
    title: createTitle.value.trim(),
    price: Number(createPrice.value) || 0,
    categoryId,
    categoryName: category?.name || "",
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

  await supabaseClient.from("products").delete().eq("id", id);
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
    .select("id,title,price,image,in_stock,category_id,categories(name)")
    .order("name", { foreignTable: "categories", ascending: true });

  if (error) {
    console.error(error);
    state.products = seedProducts;
    state.featuredProducts = pickRandomProducts(state.products, 5);
    return;
  }

  if (!data || data.length === 0) {
    state.products = seedProducts;
    state.featuredProducts = pickRandomProducts(state.products, 5);
    ensureCategoryOptions();
    return;
  }

  state.products = data.map(mapDbToProduct);
  state.featuredProducts = pickRandomProducts(state.products, 5);
};

const fetchCategories = async () => {
  if (!ensureSupabase()) return;
  const { data, error } = await supabaseClient
    .from("categories")
    .select("id,name,sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    state.categories = [];
    return;
  }

  state.categories = data || [];
  ensureCategoryOptions();
};

const fetchSiteMeta = async () => {
  if (!ensureSupabase()) {
    setAboutContent(DEFAULT_ABOUT);
    return;
  }
  const { data, error } = await supabaseClient
    .from("site_metadata")
    .select("id,about_section")
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
  state.editingProductId = product.id;
  modalTitle.value = product.title;
  modalPrice.value = product.price;
  state.editingCategoryId = product.categoryId;
  ensureCategoryOptions();
  setCategoryTriggerLabel(modalCategoryTrigger, getCategoryLabel(product));
  modalImage.value = "";
  modalStock.checked = product.inStock;
  productModal.classList.remove("hidden");
};

const closeModal = () => {
  productModal.classList.add("hidden");
  state.editingProductId = null;
};

const openCreateProductModal = () => {
  if (!state.creatingCategoryId && state.categories.length) {
    state.creatingCategoryId = state.categories[0].id;
    setCategoryTriggerLabel(createCategoryTrigger, state.categories[0].name);
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

  adminSetPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ensureSupabase()) return;
    const password = adminNewPassword.value.trim();
    const confirm = adminConfirmPassword.value.trim();
    if (!password || password.length < 6) {
      adminSetPasswordStatus.textContent = "יש להזין סיסמה באורך 6 תווים לפחות.";
      adminSetPasswordStatus.className = "text-sm mt-2 text-rose-600";
      return;
    }
    if (password !== confirm) {
      adminSetPasswordStatus.textContent = "הסיסמאות אינן תואמות.";
      adminSetPasswordStatus.className = "text-sm mt-2 text-rose-600";
      return;
    }
    adminSetPasswordStatus.textContent = "שומר...";
    adminSetPasswordStatus.className = "text-sm mt-2 text-stone-500";
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) {
      adminSetPasswordStatus.textContent = "שמירת הסיסמה נכשלה.";
      adminSetPasswordStatus.className = "text-sm mt-2 text-rose-600";
      return;
    }
    adminSetPasswordStatus.textContent = "הסיסמה נשמרה בהצלחה.";
    adminSetPasswordStatus.className = "text-sm mt-2 text-amber-900";
    adminNewPassword.value = "";
    adminConfirmPassword.value = "";
    setPasswordUI(false);
    await openAdminIfSession();
    window.history.replaceState(null, "", "#admin");
  });

  window.addEventListener("hashchange", updateRoute);
};

const init = async () => {
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
    state.products = seedProducts;
    state.featuredProducts = pickRandomProducts(state.products, 5);
    renderProducts();
    updateCartUI();
    setAdminUI(false);
    setAboutContent(DEFAULT_ABOUT);
    if (window.lucide) {
      window.lucide.createIcons();
    }
    return;
  }

  await fetchCategories();
  await fetchProducts();
  await fetchSiteMeta();
  renderProducts();
  updateCartUI();
  const authType = getAuthTypeFromHash();
  if (authType === "invite" || authType === "recovery") {
    setPasswordUI(true);
  }
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
