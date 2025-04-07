import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { apiRequest } from "./queryClient"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to check if Anthropic API key is available
export async function check_anthropic_api_key(): Promise<boolean> {
  try {
    const response = await apiRequest("GET", "/api/secrets/check?key=ANTHROPIC_API_KEY");
    const data = await response.json();
    return data.available === true;
  } catch (error) {
    console.error("Error checking Anthropic API key:", error);
    return false;
  }
}
