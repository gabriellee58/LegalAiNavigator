import { useEffect } from 'react';

/**
 * Hook to set the document title
 * @param title Page title to set
 * @param appendSiteName Whether to append the site name to the title
 */
export function useTitle(title: string, appendSiteName = true) {
  useEffect(() => {
    // Get the site name from the environment or use a default
    const siteName = "LegalAI Navigator";
    
    // Set the document title
    document.title = appendSiteName 
      ? `${title} | ${siteName}` 
      : title;
      
    // Restore the original title when component unmounts
    return () => {
      document.title = siteName;
    };
  }, [title, appendSiteName]);
}