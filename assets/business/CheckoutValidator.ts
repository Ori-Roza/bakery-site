import { BUSINESS_HOURS } from '../utils/business-hours';
import { getPickupDateTime, getNextBusinessDateTime } from '../utils/business-hours';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export class CheckoutValidator {
  /**
   * Validate pickup date and time
   */
  static validatePickupDateTime(date: string, time: string): ValidationResult {
    const pickupDateTime = getPickupDateTime(date, time);
    
    if (!pickupDateTime) {
      console.log('[CheckoutValidator] Invalid pickup  date/time - could not parse');
      return {
        isValid: false,
        errorMessage: "יש לבחור תאריך ושעה תקינים."
      };
    }

    const minDateTime = getNextBusinessDateTime(new Date());
    const day = pickupDateTime.getDay();

    // Check if Saturday (closed)
    if (day === 6) {
      return {
        isValid: false,
        errorMessage: "ביום שבת אנו סגורים. בחרו יום אחר."
      };
    }

    // Check business hours
    const hours = BUSINESS_HOURS.weekDays[day];
    const hour = pickupDateTime.getHours();
    
    if (!hours || hour < hours.open || hour > hours.close) {
      return {
        isValid: false,
        errorMessage: "שעות פעילות: א׳-ו׳ 06:00-15:00"
      };
    }

    // Check 24 hour minimum
    // Allow small tolerance for test timing and computation drift
    const toleranceMs = 5 * 1000; // 5 seconds
    if (pickupDateTime.getTime() + toleranceMs < minDateTime.getTime()) {
      return {
        isValid: false,
        errorMessage: "הזמנה יכולה להישלח בטווח של לפחות 24 שעות מראש בשעות פעילות"
      };
    }
    return { isValid: true };
  }

  /**
   * Validate checkout form data
   */
  static validateCheckoutForm(formData: {
    name: string;
    phone: string;
    date: string;
    time: string;
  }): ValidationResult {
    if (!formData.name || !formData.name.trim()) {
      return {
        isValid: false,
        errorMessage: "יש למלא שם מלא."
      };
    }

    if (!formData.phone || !formData.phone.trim()) {
      return {
        isValid: false,
        errorMessage: "יש למלא מספר טלפון."
      };
    }

    if (!formData.date || !formData.time) {
      return {
        isValid: false,
        errorMessage: "יש לבחור תאריך ושעה לאיסוף."
      };
    }

    // Validate the pickup date/time
    return CheckoutValidator.validatePickupDateTime(formData.date, formData.time);
  }

  /**
   * Get custom validity message for date/time inputs
   */
  static getPickupValidityMessage(date: string, time: string): string {
    const result = CheckoutValidator.validatePickupDateTime(date, time);
    return result.isValid ? "" : (result.errorMessage || "");
  }

  /**
   * Check if date is Saturday (closed)
   */
  static isSaturday(dateString: string): boolean {
    if (!dateString) return false;
    const selectedDate = new Date(dateString + 'T00:00:00');
    return selectedDate.getDay() === 6;
  }
}
