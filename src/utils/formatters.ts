/**
 * Format a number as currency (Israeli Shekel)
 */
export const formatCurrency = (value: number | string): string => {
  return `₪${Number(value).toFixed(2)}`;
};

/**
 * Format a Date object as YYYY-MM-DD for HTML date inputs
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Format a Date object as HH:MM for HTML time inputs
 */
export const formatTimeForInput = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Format a date string (YYYY-MM-DD) as DD/MM/YYYY for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};
