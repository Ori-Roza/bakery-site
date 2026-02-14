import type { AppState, OrderLinks } from '../types/models';
import { OrderBuilder } from '../business/OrderBuilder';
import { TECH_SUPPORT_MESSAGE } from '../config/constants';

export class CheckoutHandlers {
  /**
   * Handle checkout form submission
   */
  static async handleCheckout(
    event: Event,
    state: AppState,
    elements: {
      checkoutError: HTMLElement | null;
      pickupDateInput: HTMLInputElement | null;
      pickupTimeInput: HTMLInputElement | null;
    },
    supabaseClient: any,
    callbacks: {
      ensureSupabase: () => boolean;
      setPickupValidity: () => void;
      getCartTotals: () => { items: any[]; totalPrice: number };
      fetchOrders: () => Promise<void>;
      closeCart: () => void;
      openOrderChannelModal: (links: OrderLinks) => void;
    }
  ): Promise<void> {
    event.preventDefault();
    if (!callbacks.ensureSupabase()) return;
    
    const { checkoutError, pickupDateInput, pickupTimeInput } = elements;
    
    // Check if orders are being accepted
    if (!state.ordersAccepting) {
      if (checkoutError) {
        checkoutError.textContent = "מצטערים, כרגע איננו מקבלים הזמנות חדשות.";
        checkoutError.classList.remove("hidden");
      }
      return;
    }
    
    // Clear any previous error
    if (checkoutError) {
      checkoutError.textContent = "";
      checkoutError.classList.add("hidden");
    }
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload = {
      name: (formData.get("name") as string).trim(),
      phone: (formData.get("phone") as string).trim(),
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      user_notes: (formData.get("user_notes") as string)?.trim() || "",
    };

    callbacks.setPickupValidity();
    
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
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const { items, totalPrice } = callbacks.getCartTotals();
    if (!items.length) {
      if (checkoutError) {
        checkoutError.textContent = "העגלה ריקה. הוסיפו מוצרים לפני שליחת ההזמנה.";
        checkoutError.classList.remove("hidden");
      }
      return;
    }

    const message = OrderBuilder.buildOrderMessage({
      items,
      totalPrice,
      customerName: payload.name,
      customerPhone: payload.phone,
      pickupDate: payload.date,
      pickupTime: payload.time,
      userNotes: payload.user_notes,
    });
    const links = OrderBuilder.buildOrderLinks(message, {
      whatsappPhone: state.checkoutWhatsappPhone,
      email: state.checkoutEmail,
    });

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

    await callbacks.fetchOrders();
    callbacks.closeCart();
    // Delay modal open slightly to let cart close first (iOS Safari fix)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        callbacks.openOrderChannelModal(links);
      });
    });
  }
}
