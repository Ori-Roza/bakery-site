import { formatCurrency } from '../utils/formatters';
import type { CartTotals, CartItem } from '../types/models';

export class CartUI {
  /**
   * Update cart UI elements
   */
  static updateCartUI(
    cartTotals: CartTotals,
    elements: {
      cartItemsEl: HTMLElement | null;
      cartTotalEl: HTMLElement | null;
      floatingCart: HTMLElement | null;
      floatingCount: HTMLElement | null;
      floatingTotal: HTMLElement | null;
    }
  ): void {
    const { items, totalQty, totalPrice } = cartTotals;
    const { cartItemsEl, cartTotalEl, floatingCart, floatingCount, floatingTotal } = elements;

    if (!cartItemsEl) return;

    cartItemsEl.innerHTML = "";

    if (!items.length) {
      cartItemsEl.innerHTML =
        "<p class='text-sm text-stone-500'>העגלה ריקה כרגע. התחילו לבחור מאפים טעימים.</p>";
    }

    items.forEach((item: CartItem) => {
      const card = document.createElement("div");
      card.className = "cart-item";
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" />
        <div class="flex-1">
          <p class="font-semibold text-stone-800">${item.title}</p>
          <p class="text-sm text-stone-500">
            ${(item.discountPercentage ?? 0) > 0 ? `<span class="line-through">${formatCurrency(item.price)}</span> ` : ""}
            ${formatCurrency(item.discountedPrice ?? 0)} ליח'
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

    if (cartTotalEl) {
      cartTotalEl.textContent = formatCurrency(totalPrice);
    }
    if (floatingCount) {
      floatingCount.textContent = String(totalQty);
    }
    if (floatingTotal) {
      floatingTotal.textContent = formatCurrency(totalPrice);
    }
    if (floatingCart) {
      floatingCart.classList.toggle("hidden", totalQty === 0);
    }
  }

  /**
   * Open cart drawer
   */
  static openCart(
    cartDrawer: HTMLElement | null,
    overlay: HTMLElement | null
  ): void {
    if (cartDrawer) {
      cartDrawer.classList.remove("translate-x-full");
    }
    if (overlay) {
      overlay.classList.remove("hidden");
    }
  }

  /**
   * Close cart drawer
   */
  static closeCart(
    cartDrawer: HTMLElement | null,
    overlay: HTMLElement | null
  ): void {
    if (cartDrawer) {
      cartDrawer.classList.add("translate-x-full");
    }
    if (overlay) {
      overlay.classList.add("hidden");
    }
  }
}
