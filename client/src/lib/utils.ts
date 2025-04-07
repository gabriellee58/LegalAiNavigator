import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Check if the Anthropic API key is available in environment variables
 * @returns Promise<boolean> True if the API key is available
 */
export async function check_anthropic_api_key(): Promise<boolean> {
  try {
    const response = await fetch('/api/secrets/check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.anthropic || false;
  } catch (error) {
    console.error('Error checking API key:', error);
    return false;
  }
}