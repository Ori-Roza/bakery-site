/**
 * Business hours configuration for the bakery
 */

export interface BusinessHoursConfig {
  open: number;  // Opening hour (0-23)
  close: number; // Closing hour (0-23)
}

export interface WeeklySchedule {
  weekDays: {
    [day: number]: BusinessHoursConfig | null;
  };
}

/**
 * Business hours configuration
 * Sunday (0) through Friday (5): 06:00-15:00
 * Saturday (6): Closed
 */
export const BUSINESS_HOURS: WeeklySchedule = {
  weekDays: {
    0: { open: 6, close: 15 }, // Sunday
    1: { open: 6, close: 15 }, // Monday
    2: { open: 6, close: 15 }, // Tuesday
    3: { open: 6, close: 15 }, // Wednesday
    4: { open: 6, close: 15 }, // Thursday
    5: { open: 6, close: 15 }, // Friday
    6: null, // Saturday - Closed
  },
};

/**
 * Check if a date falls on a business day (not Saturday)
 */
export const isBusinessDay = (date: Date): boolean => {
  // Check if Saturday
  if (date.getDay() === 6) return false;
  return true;
};

/**
 * Check if a date/time is within business hours
 */
export const isWithinBusinessHours = (date: Date): boolean => {
  const day = date.getDay();
  const hours = BUSINESS_HOURS.weekDays[day];
  
  if (!hours) return false; // Closed on this day
  
  const hour = date.getHours();
  return hour >= hours.open && hour < hours.close;
};

/**
 * Get the next available business date/time (at least 24 hours from now)
 * Results are cached to handle rapid successive calls within the same operation
 */
let cachedResult: { fromTime: number; result: Date } | null = null;
const CACHE_DURATION_MS = 300000; // 5 minutes

export const getNextBusinessDateTime = (fromDate: Date): Date => {
  const fromTime = fromDate.getTime();
  
  // Return cached result if it's fresh (within cache duration from the cached time)
  // This ensures rapid successive calls return the same datetime, preventing validation drift
  if (cachedResult) {
    const timeDiff = Math.abs(fromTime - cachedResult.fromTime);
    if (timeDiff < CACHE_DURATION_MS) {
      return new Date(cachedResult.result);
    }
  }
  
  // Start from 24 hours from the given date/time
  let nextDate = new Date(fromTime + 24 * 60 * 60 * 1000);
  
  // Find next available business day starting from 24 hours from now
  let attempts = 0;
  const maxAttempts = 7; // Search up to a week
  
  while (attempts < maxAttempts) {
    const day = nextDate.getDay();
    const hours = BUSINESS_HOURS.weekDays[day];
    
    // If closed on this day (Saturday), move to next day
    if (!hours) {
      nextDate.setDate(nextDate.getDate() + 1);
      nextDate.setHours(6, 0, 0, 0); // Reset to opening hour
      attempts++;
      continue;
    }
    
    // Found an open day, ensure we're at opening hour or later
    if (nextDate.getHours() < hours.open) {
      nextDate.setHours(hours.open, 0, 0, 0);
    }
    break;
  }
  
  // Cache the result
  cachedResult = { fromTime, result: new Date(nextDate) };
  
  return nextDate;
};

/**
 * Parse date and time strings into a Date object
 */
export const getPickupDateTime = (
  dateValue: string,
  timeValue: string
): Date | null => {
  if (!dateValue || !timeValue) return null;
  
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  
  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};
