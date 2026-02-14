/**
 * Order message and link generation
 */

import type { OrderMessageParams, OrderLinks } from '../types/models';
import { DEFAULT_WHATSAPP_PHONE, DEFAULT_ORDER_EMAIL } from '../config/constants';

export class OrderMapper {
  /**
   * Build order message text for WhatsApp/Email
   */
  static buildOrderMessage(params: OrderMessageParams): string {
    const { name, phone, date, time, items, totalPrice } = params;
    const lines = items.map((item) => `${item.title} x ${item.qty}`).join("\n");

    return (
      `שלום יעקב, הזמנה חדשה מהאתר:\n${lines}` +
      `\nסה"כ לתשלום: ₪${totalPrice}` +
      `\nשם הלקוח: ${name}` +
      `\nטלפון: ${phone}` +
      `\nמועד איסוף: ${date} בשעה ${time}`
    );
  }

  /**
   * Build order communication links (WhatsApp and Email)
   */
  static buildOrderLinks(
    message: string,
    options: {
      whatsappPhone?: string;
      email?: string;
    } = {}
  ): OrderLinks {
    const whatsappPhone = options.whatsappPhone || DEFAULT_WHATSAPP_PHONE;
    const email = options.email || DEFAULT_ORDER_EMAIL;

    return {
      whatsappUrl: `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`,
      emailUrl: `mailto:${email}?subject=${encodeURIComponent(
        "הזמנה חדשה מהאתר"
      )}&body=${encodeURIComponent(message)}`,
    };
  }
}

/**
 * Convenience functions for backward compatibility
 */
export const buildOrderMessage = OrderMapper.buildOrderMessage;
export const buildOrderLinks = (message: string, options?: any) =>
  OrderMapper.buildOrderLinks(message, options);
