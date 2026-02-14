import type { AppState } from '../types/models';
import { CartManager } from '../business/CartManager';

export class CartHandlers {
  /**
   * Add product to cart
   */
  static addToCart(
    productId: string,
    state: AppState,
    updateCartUI: () => void
  ): void {
    state.cart = CartManager.addToCart(state.cart, Number(productId));
    updateCartUI();
  }

  /**
   * Update cart quantity
   */
  static updateQty(
    productId: string,
    delta: number,
    state: AppState,
    updateCartUI: () => void
  ): void {
    state.cart = CartManager.updateQuantity(state.cart, Number(productId), delta);
    updateCartUI();
  }

  /**
   * Set cart quantity
   */
  static setQty(
    productId: string,
    value: number,
    state: AppState,
    updateCartUI: () => void
  ): void {
    state.cart = CartManager.setQuantity(state.cart, Number(productId), value);
    updateCartUI();
  }

  /**
   * Clear checkout state
   */
  static clearCheckoutState(
    state: AppState,
    checkoutForm: HTMLFormElement | null,
    updateCartUI: () => void
  ): void {
    state.cart = CartManager.clearCart();
    if (checkoutForm) {
      checkoutForm.reset();
    }
    updateCartUI();
  }
}
