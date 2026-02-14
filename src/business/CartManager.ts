import type { Product } from '../types/models';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  discountPercentage: number;
  image: string;
  qty: number;
  lineTotal: number;
}

export interface CartTotals {
  items: CartItem[];
  totalQty: number;
  totalPrice: number;
}

export class CartManager {
  /**
   * Get cart items with product details
   */
  static getCartItems(cart: Record<string, number>, products: Product[]): CartItem[] {
    return Object.entries(cart)
      .map(([idStr, qty]) => {
        const id = Number(idStr);
        const product = products.find((p) => p.id === id);
        if (!product) return null;

        const discountedPrice =
          product.price * (1 - product.discountPercentage / 100);

        return {
          id: product.id,
          title: product.title,
          price: product.price,
          discountedPrice,
          discountPercentage: product.discountPercentage,
          image: product.imageUrl,
          qty,
          lineTotal: discountedPrice * qty,
        };
      })
      .filter(Boolean) as CartItem[];
  }

  /**
   * Calculate cart totals
   */
  static getCartTotals(cart: Record<string, number>, products: Product[]): CartTotals {
    const items = CartManager.getCartItems(cart, products);
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.lineTotal, 0);
    return { items, totalQty, totalPrice };
  }

  /**
   * Add item to cart
   */
  static addToCart(cart: Record<string, number>, productId: number): Record<string, number> {
    const key = String(productId);
    return {
      ...cart,
      [key]: (cart[key] || 0) + 1
    };
  }

  /**
   * Update quantity by delta
   */
  static updateQuantity(
    cart: Record<string, number>,
    productId: number,
    delta: number
  ): Record<string, number> {
    const key = String(productId);
    const nextQty = (cart[key] || 0) + delta;
    
    if (nextQty <= 0) {
      const { [key]: _, ...rest } = cart;
      return rest;
    }
    
    return {
      ...cart,
      [key]: nextQty
    };
  }

  /**
   * Set absolute quantity
   */
  static setQuantity(
    cart: Record<string, number>,
    productId: number,
    quantity: number
  ): Record<string, number> {
    const key = String(productId);
    const nextQty = Number(quantity) || 0;
    
    if (nextQty <= 0) {
      const { [key]: _, ...rest } = cart;
      return rest;
    }
    
    return {
      ...cart,
      [key]: nextQty
    };
  }

  /**
   * Clear cart
   */
  static clearCart(): Record<string, number> {
    return {};
  }
}
