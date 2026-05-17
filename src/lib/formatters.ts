
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * Safely converts a value to a Date object, handling Firestore Timestamps, strings, and numbers.
 * @param date The value to convert
 * @returns A Date object (may be an Invalid Date if input is unparseable)
 */
export const toValidDate = (date: any): Date => {
  if (date === undefined || date === null || date === '') return new Date(NaN);
  
  let d = date;
  
  // Handle Firestore Timestamp
  if (d && typeof d.toDate === 'function') {
    return d.toDate();
  } 
  
  // Handle Date objects
  if (d instanceof Date) {
    return isNaN(d.getTime()) ? new Date(NaN) : d;
  }

  // Handle numeric timestamp / Excel serial date
  if (typeof d === 'number') {
    // Excel serial dates are usually in the range 30000 - 60000 for current years
    // Javascript dates are milliseconds since epoch.
    // If it's a small number, it's likely an Excel serial date
    if (d > 0 && d < 100000) {
      // Excel starts on Dec 30, 1899 (mostly)
      return new Date(Math.round((d - 25569) * 86400 * 1000));
    }
    return new Date(d);
  }

  // Handle string inputs
  if (typeof d === 'string') {
    d = d.trim();
    if (!d) return new Date(NaN);

    // Try standard ISO parsing first
    let parsed = new Date(d);
    if (!isNaN(parsed.getTime())) return parsed;

    // Handle DD/MM/YYYY or D/M/YYYY or DD-MM-YYYY or D-M-YYYY
    const dmyMatch = d.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1; // 0-indexed
      const year = parseInt(dmyMatch[3], 10);
      return new Date(year, month, day);
    }

    // Handle YYYY/MM/DD or YYYY-MM-DD (already covered by Date(d) mostly, but just in case)
    const ymdMatch = d.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      return new Date(year, month, day);
    }

    return new Date(d);
  }

  return new Date(NaN);
};

/**
 * Calculates similarity between two strings (0 to 1).
 */
export const getSimilarity = (s1: string, s2: string): number => {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / longerLength;
};

const editDistance = (s1: string, s2: string): number => {
  s1 = s1.toLowerCase().trim();
  s2 = s2.toLowerCase().trim();
  const costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

/**
 * Formats a date safely, handling Firestore Timestamps and invalid dates.
 * @param date The date to format (can be Date, Timestamp, string, number)
 * @param formatStr The format string
 * @returns Formatted date string
 */
export const safeFormatDate = (date: any, formatStr: string, options: { useAr?: boolean } = { useAr: true }): string => {
  if (date === undefined || date === null || date === '') return 'تاريخ غير متوفر';
  try {
    let d = date;
    // Handle Firestore Timestamp
    if (d && typeof d.toDate === 'function') {
      d = d.toDate();
    } 
    // Handle string inputs (ISO, yyyy-mm-dd, etc.)
    else if (typeof d === 'string') {
      // Basic check for yyyy-mm-dd or yyyy/mm/dd
      if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(d)) {
        // Replace / with - for standard ISO parsing if needed
        d = new Date(d.replace(/\//g, '-'));
      } else {
        d = new Date(d);
      }
    }
    // Handle numeric timestamp
    else if (typeof d === 'number') {
      d = new Date(d);
    }
    
    // Check if the date is valid
    if (!(d instanceof Date) || isNaN(d.getTime())) {
      return 'تاريخ غير متوفر';
    }
    
    // For input type="date", we must use English numerals and yyyy-MM-dd format
    // date-fns format with ar locale might still return English numerals for yyyy-MM-dd, 
    // but to be safe for inputs we can opt-out of locale
    const formatOptions = options.useAr ? { locale: ar } : {};
    return format(d, formatStr, formatOptions);
  } catch (error) {
    console.error("Format error:", error, date);
    return 'تاريخ غير متوفر';
  }
};

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

/**
 * Localization mapping for supplier types
 */
export const SUPPLIER_TYPE_MAPPING: Record<string, string> = {
  office: 'مكتب',
  warehouse: 'مذخر',
  company: 'شركة',
  supplier: 'مورد',
  vendor: 'مورد عام',
  other: 'أخرى',
};

/**
 * Returns the Arabic label for a given supplier type value.
 */
export const getSupplierTypeLabel = (type: string | undefined | null): string => {
  if (!type) return 'غير محدد';
  const typeLower = type.toString().toLowerCase().trim();
  return SUPPLIER_TYPE_MAPPING[typeLower] || type;
};

/**
 * Returns the internal value for a given Arabic label.
 */
export const getSupplierTypeValue = (label: string | undefined | null): string => {
  if (!label) return 'other';
  const entry = Object.entries(SUPPLIER_TYPE_MAPPING).find(([_, v]) => v === label);
  return entry ? entry[0] : 'other';
};
