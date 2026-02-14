/**
 * Convert a buffer to hexadecimal string
 */
export const bufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  bytes.forEach((byte) => {
    hex += byte.toString(16).padStart(2, "0");
  });
  return hex;
};

/**
 * Convert a hexadecimal string to Base64
 */
export const hexToBase64 = (hexValue: string): string => {
  if (!hexValue) return "";
  const hex = hexValue.startsWith("\\x") ? hexValue.slice(2) : hexValue;
  let binary = "";
  for (let i = 0; i < hex.length; i += 2) {
    binary += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
  }
  return btoa(binary);
};

/**
 * Sanitize text to create a safe filename
 * Converts to lowercase, replaces spaces with dashes, removes non-ASCII/non-alphanumeric characters
 */
export const sanitizeFileName = (text: string | null | undefined): string => {
  if (!text) return 'file';
  
  const sanitized = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Fallback if everything was stripped out
  return sanitized || 'file';
};
