/**
 * Date Utilities for Safe Formatting and Manipulation
 * 
 * This module provides utility functions for safely working with dates,
 * particularly when dates might be null, undefined, or invalid.
 */

import { format as formatDate } from 'date-fns';
import { logger } from '../lib/logger';

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
    
    return formatDate(date, formatString);
  } catch (error) {
    logger.warn(`[dateUtils] Error formatting date ${dateInput}:`, error);
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
    logger.warn(`[dateUtils] Error parsing date ${dateInput}:`, error);
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