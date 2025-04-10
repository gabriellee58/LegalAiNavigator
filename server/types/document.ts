/**
 * Document information for file uploads
 */
export interface DocumentInfo {
  name: string;
  size: number;
  type: string;
  content?: string; // Base64 encoded content
}