
/**
 * Formats a number with thousand separators and the IQD currency suffix.
 * @param amount The number to format
 * @returns Formatted string (e.g., "1,250,000 د.ع")
 */
export const formatIQD = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || amount === '') return '0 د.ع';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(num)) return '0 د.ع';
  
  return new Intl.NumberFormat('en-US').format(num) + ' د.ع';
};

/**
 * Formats a number with thousand separators only (for inputs).
 * @param value The value to format
 * @returns Formatted string (e.g., "1,250,000")
 */
export const formatNumberWithCommas = (value: string | number): string => {
  if (value === undefined || value === null || value === '') return '';
  const numStr = value.toString().replace(/,/g, '');
  const num = parseFloat(numStr);
  if (isNaN(num)) return numStr.replace(/[^0-9.]/g, ''); // Fallback to just digits
  
  const [integerPart, decimalPart] = numStr.split('.');
  const formattedInteger = new Intl.NumberFormat('en-US').format(parseFloat(integerPart));
  
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Parses a currency string with commas back into a clean number.
 * @param value The formatted string
 * @returns Clean number
 */
export const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  const cleanStr = value.replace(/,/g, '');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
};
