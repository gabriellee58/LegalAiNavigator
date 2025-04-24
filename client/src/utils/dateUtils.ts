/**
 * Date Utilities for Safe Formatting and Manipulation
 * 
 * This module provides utility functions for safely working with dates,
 * particularly when dates might be null, undefined, or invalid.
 */

import { format, differenceInDays, isValid } from "date-fns";

/**
 * Safely formats a date string or Date object
 * Returns a formatted date string or a fallback value if the date is invalid or null
 * 
 * @param dateInput - Date string, timestamp, Date object, or null/undefined
 * @param formatString - Date-fns format string (default: "MMMM dd, yyyy")
 * @param fallback - String to return if date is invalid (default: "N/A")
 */
export function formatDateSafe(
  dateInput: string | number | Date | null | undefined,
  formatString: string = "MMMM dd, yyyy",
  fallback: string = "N/A"
): string {
  if (!dateInput) {
    return fallback;
  }
  
  try {
    const date = typeof dateInput === 'object' 
      ? dateInput 
      : new Date(dateInput);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error(`Error formatting date ${dateInput}:`, error);
    return fallback;
  }
}

/**
 * Safely returns a date object or null if the input is invalid
 * 
 * @param dateInput - Date string, timestamp, Date object, or null/undefined
 */
export function parseDateSafe(
  dateInput: string | number | Date | null | undefined
): Date | null {
  if (!dateInput) {
    return null;
  }
  
  try {
    const date = typeof dateInput === 'object' 
      ? dateInput 
      : new Date(dateInput);
      
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error(`Error parsing date ${dateInput}:`, error);
    return null;
  }
}

/**
 * Calculate days between two dates (or between a date and now)
 * Returns null if either date is invalid
 * 
 * @param startDate - Start date
 * @param endDate - End date (defaults to now)
 */
export function calculateDaysBetween(
  startDate: string | number | Date | null | undefined,
  endDate: string | number | Date | null | undefined = new Date()
): number | null {
  const start = parseDateSafe(startDate);
  const end = parseDateSafe(endDate);
  
  if (!start || !end) {
    return null;
  }
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if a date is in the past
 * 
 * @param dateInput - Date to check
 */
export function isDateInPast(
  dateInput: string | number | Date | null | undefined
): boolean {
  const date = parseDateSafe(dateInput);
  
  if (!date) {
    return false;
  }
  
  return date < new Date();
}

/**
 * Returns a user-friendly description of days remaining
 * @param days - Number of days
 * @param options - Customization options
 */
export function getDaysRemainingText(
  days: number | null, 
  options: { 
    prefix?: string, 
    suffix?: string,
    zero?: string,
    negative?: string 
  } = {}
): string {
  if (days === null) return options.zero || "No days";
  
  if (days <= 0) return options.negative || "Expired";
  
  const prefix = options.prefix || "";
  const suffix = options.suffix || " days remaining";
  
  return `${prefix}${days}${suffix}`;
}

/**
 * Format a date range as a string
 * @param startDate - Start date
 * @param endDate - End date
 */
export function formatDateRange(
  startDate: string | number | Date | null | undefined,
  endDate: string | number | Date | null | undefined,
  formatString: string = "MMM dd, yyyy",
  separator: string = " - "
): string {
  const start = formatDateSafe(startDate, formatString);
  const end = formatDateSafe(endDate, formatString);
  
  return `${start}${separator}${end}`;
}