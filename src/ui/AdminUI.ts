import { formatCurrency } from '../utils/formatters';
import { CategoryResolver } from '../business/CategoryResolver';
import type { Product, Category, Order, AppState } from '../types/models';

export class AdminUI {
  private static formatOrderDate(value: string | undefined): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("he-IL", { hour12: false });
  }
  /**
   * Render admin products table
   */
  static renderAdminProducts(
    products: Product[],
    categories: Category[],
    adminProductsEl: HTMLElement | null,
    searchQuery: string = "",
    sortConfig: { key: string; dir: string }
  ): void {
    if (!adminProductsEl) return;

    adminProductsEl.innerHTML = "";
    const query = searchQuery.trim().toLowerCase();
    const filteredProducts = products.filter((product) => {
      const categoryLabel = CategoryResolver.getCategoryName(categories, product.categoryId);
      return (
        product.title.toLowerCase().includes(query) ||
        categoryLabel.toLowerCase().includes(query)
      );
    });

    const { key: productKey, dir: productDir } = sortConfig;
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
          ? left.localeCompare(right, "he")
          : left - right;
      return productDir === "asc" ? compare : -compare;
    });

    filteredProducts.forEach((product) => {
      const categoryLabel = CategoryResolver.getCategoryName(categories, product.categoryId);
      const row = document.createElement("tr");
      row.dataset.id = String(product.id);
      row.innerHTML = `
        <td>${product.title}</td>
        <td>${categoryLabel}</td>
        <td>${formatCurrency(product.price)}</td>
        <td>${product.discountPercentage > 0 ? `${Math.round(product.discountPercentage)}%` : "-"}</td>
        <td>${product.inStock ? "כן" : "לא"}</td>
      `;
      adminProductsEl.appendChild(row);
    });
  }

  /**
   * Render admin categories table
   */
  static renderAdminCategories(
    categories: Category[],
    adminCategoriesEl: HTMLElement | null
  ): void {
    if (!adminCategoriesEl) return;

    adminCategoriesEl.innerHTML = "";
    const sortedCategories = [...categories].sort((a, b) =>
      a.category_name.localeCompare(b.category_name, "he")
    );
    
    if (!sortedCategories.length) {
      const row = document.createElement("tr");
      row.innerHTML =
        "<td colspan='3' class='text-sm text-stone-500'>אין קטגוריות להצגה.</td>";
      adminCategoriesEl.appendChild(row);
    } else {
      sortedCategories.forEach((category) => {
        const row = document.createElement("tr");
        row.dataset.categoryId = String(category.category_id);
        const imageSrc = category.image_url || "assets/all_categories.png";
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

  /**
   * Render admin orders table
   */
  static renderAdminOrders(
    orders: Order[],
    adminOrdersEl: HTMLElement | null,
    searchQuery: string = "",
    sortConfig: { key: string; dir: string }
  ): void {
    if (!adminOrdersEl) return;

    adminOrdersEl.innerHTML = "";
    const orderQuery = searchQuery.trim().toLowerCase();
    const filteredOrders = orders.filter((order) => {
      if (!orderQuery) return true;
      const name = order.customer?.name?.toLowerCase() || "";
      const orderNumber = String(order.order_number ?? "").toLowerCase();
      return name.includes(orderQuery) || orderNumber.includes(orderQuery);
    });

    const { key: orderKey, dir: orderDir } = sortConfig;
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
          ? left.localeCompare(String(right), "he")
          : (left as number) - (right as number);
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
      row.dataset.orderId = String(order.id);
      if (order.deleted) {
        row.style.opacity = "0.5";
        row.style.textDecoration = "line-through";
      }
      row.innerHTML = `
        <td>${order.order_number ?? order.id ?? ""}</td>
        <td>${order.customer?.name || 'Unknown'}</td>
        <td>${AdminUI.formatOrderDate(order.created_at)}</td>
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
  }

  /**
   * Render complete admin panel
   */
  static renderAdmin(
    state: AppState,
    elements: {
      adminProductsEl: HTMLElement | null;
      adminCategoriesEl: HTMLElement | null;
      adminOrdersEl: HTMLElement | null;
      adminSearchInput: HTMLInputElement | null;
      adminOrdersSearchInput: HTMLInputElement | null;
    }
  ): void {
    const { adminProductsEl, adminCategoriesEl, adminOrdersEl, adminSearchInput, adminOrdersSearchInput } = elements;
    
    AdminUI.renderAdminProducts(
      state.products,
      state.categories,
      adminProductsEl,
      adminSearchInput?.value || "",
      state.sortProducts
    );

    AdminUI.renderAdminCategories(state.categories, adminCategoriesEl);

    AdminUI.renderAdminOrders(
      state.orders,
      adminOrdersEl,
      adminOrdersSearchInput?.value || "",
      state.sortOrders
    );
  }

  /**
   * Set admin UI based on authentication
   */
  static setAdminUI(
    isAuthenticated: boolean,
    elements: {
      adminAuthEl: HTMLElement | null;
      adminPanelEl: HTMLElement | null;
      adminAuthErrorEl: HTMLElement | null;
      adminGreetingEl: HTMLElement | null;
    },
    email: string = ""
  ): void {
    const { adminAuthEl, adminPanelEl, adminAuthErrorEl, adminGreetingEl } = elements;
    
    if (adminAuthEl && adminPanelEl) {
      adminAuthEl.classList.toggle("hidden", isAuthenticated);
      adminPanelEl.classList.toggle("hidden", !isAuthenticated);
    }
    
    if (adminAuthErrorEl) {
      adminAuthErrorEl.textContent = "";
    }
    
    if (isAuthenticated && adminGreetingEl) {
      adminGreetingEl.textContent = `שלום, ${email}`;
    }
  }

  /**
   * Render active filter chips
   */
  static renderActiveFilterChips(
    filters: Array<{ field: string; operator: string; value: any }>,
    filtersContainerEl: HTMLElement | null,
    formatFilterFn: (f: any) => string,
    onRemoveFilter: (index: number) => void
  ): void {
    if (!filtersContainerEl) return;

    if (filters.length === 0) {
      filtersContainerEl.classList.add('hidden');
      filtersContainerEl.innerHTML = '';
      return;
    }

    filtersContainerEl.classList.remove('hidden');
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'flex flex-wrap gap-2';

    filters.forEach((filter, index) => {
      const chip = document.createElement('div');
      chip.className = 'inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm';
      chip.innerHTML = `
        <span>${formatFilterFn(filter)}</span>
        <button class="ml-1 text-amber-700 hover:text-amber-900 font-semibold" data-filter-index="${index}">✕</button>
      `;

      chip.querySelector('button')?.addEventListener('click', () => {
        onRemoveFilter(index);
      });

      chipsContainer.appendChild(chip);
    });

    // Clear existing chips (but keep the label)
    const existingChips = filtersContainerEl.querySelector('.flex.flex-wrap');
    if (existingChips) {
      existingChips.remove();
    }

    filtersContainerEl.appendChild(chipsContainer);
  }
}
