import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Check if a specific API key is available in environment variables
 * @param keyName The name of the environment variable to check
 * @returns Promise<boolean> True if the API key is available
 */
export async function checkApiKey(keyName: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/secrets/check?key=${keyName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`API key check failed for ${keyName}: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    return data.available || false;
  } catch (error) {
    console.error(`Error checking API key ${keyName}:`, error);
    return false;
  }
}

/**
 * Check if the Anthropic API key is available in environment variables
 * @returns Promise<boolean> True if the API key is available
 */
export async function check_anthropic_api_key(): Promise<boolean> {
  return await checkApiKey('ANTHROPIC_API_KEY');
}