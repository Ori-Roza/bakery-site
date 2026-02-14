import { formatCurrency } from '../utils/formatters';
import type { Product } from '../types/models';

export class ProductUI {
  /**
   * Render products
   */
  static renderProducts(
    products: Product[],
    productsScrollEl: HTMLElement | null,
    searchQuery: string = "",
    activeCategoryId: string | null = null
  ): void {
    if (!productsScrollEl) return;

    const query = searchQuery.trim().toLowerCase();
    const items = [...products]
      .filter((product) => product.title.toLowerCase().includes(query))
      .filter((product) => {
        if (!activeCategoryId) return true;
        return String(product.categoryId) === String(activeCategoryId);
      })
      .sort((a, b) => a.title.localeCompare(b.title, "he"));

    productsScrollEl.innerHTML = "";
    items.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      const discountedPrice =
        product.discountPercentage > 0
          ? product.price * (1 - product.discountPercentage / 100)
          : product.price;
      const discountBadge =
        product.discountPercentage > 0
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
}
