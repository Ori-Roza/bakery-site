import { OrderMapper } from '../models/OrderMapper';
import type { CartItem, OrderLinks, OrderMessageParams } from '../types/models';

export class OrderBuilder {
  /**
   * Build order message from cart items and customer details
   */
  static buildOrderMessage(params: {
    items: CartItem[];
    customerName: string;
    customerPhone: string;
    pickupDate: string;
    pickupTime: string;
    totalPrice: number;
    userNotes?: string;
  }): string {
    const orderParams: OrderMessageParams = {
      items: params.items.map(item => ({
        title: item.title,
        qty: item.qty,
        price: item.price,
        lineTotal: item.lineTotal
      })),
      name: params.customerName,
      phone: params.customerPhone,
      date: params.pickupDate,
      time: params.pickupTime,
      totalPrice: params.totalPrice,
      userNotes: params.userNotes
    };

    return OrderMapper.buildOrderMessage(orderParams);
  }

  /**
   * Build WhatsApp and Email links for order
   */
  static buildOrderLinks(
    message: string,
    contacts: { whatsappPhone: string; email: string }
  ): OrderLinks {
    return OrderMapper.buildOrderLinks(message, contacts);
  }

  /**
   * Complete flow: build message and links
   */
  static buildOrderMessageAndLinks(params: {
    items: CartItem[];
    customerName: string;
    customerPhone: string;
    pickupDate: string;
    pickupTime: string;
    totalPrice: number;
    userNotes?: string;
    whatsappPhone: string;
    email: string;
  }): { message: string; links: OrderLinks } {
    const message = OrderBuilder.buildOrderMessage(params);
    const links = OrderBuilder.buildOrderLinks(message, {
      whatsappPhone: params.whatsappPhone,
      email: params.email
    });

    return { message, links };
  }
}
