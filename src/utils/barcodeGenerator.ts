/**
 * Utility for generating barcode data
 */

/**
 * Generates a barcode compatible string from the given data
 * @param data The data to encode in the barcode
 * @returns A barcode-compatible string
 */
export function generateBarcode(data: string): string {
  // In a real implementation, this might use a barcode generation library
  // For now, we just return a sanitized version of the input

  // Remove any characters that might not be compatible with barcodes
  let sanitized = data.replace(/[^a-zA-Z0-9-_.]/g, '');

  // Ensure it's not too long (most 1D barcodes have length limits)
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50);
  }

  return sanitized;
}

/**
 * Converts a string to a Code128 barcode format
 * This is a simplified implementation for demonstration
 * @param data The data to encode
 * @returns A string that represents the data in Code128 format
 */
export function convertToCode128(data: string): string {
  // In a real implementation, this would convert the data to Code128 format
  // For demonstration, we just prefix it with "CODE128:"
  return `CODE128:${generateBarcode(data)}`;
}

/**
 * Converts a string to a EAN-13 barcode format
 * This is a simplified implementation for demonstration
 * @param data The data to encode
 * @returns A string that represents the data in EAN-13 format
 */
export function convertToEAN13(data: string): string {
  // In a real implementation, this would convert the data to EAN-13 format
  // For demonstration, we're just returning a simplified version

  // EAN-13 consists of 13 digits, so we'll generate a 13-digit number
  // based on the hash of the input

  let numericValue = 0;
  // Simple hashing to generate numeric value from string
  for (let i = 0; i < data.length; i++) {
    numericValue += data.charCodeAt(i);
  }

  // Create a 12-digit number (the 13th digit is a check digit)
  const twelveDigits = (numericValue % 1000000000000).toString().padStart(12, '0');

  // Calculate check digit (simplified)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(twelveDigits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  return `EAN13:${twelveDigits}${checkDigit}`;
}
