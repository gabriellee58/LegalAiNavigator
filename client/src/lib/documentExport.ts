/**
 * Document Export Utilities
 * 
 * This file provides functionality for exporting documents in various formats
 * and printing them to local printers.
 */

/**
 * Generate a PDF from HTML content
 * @param htmlContent The HTML content to convert to PDF
 * @param filename The filename to use for the PDF
 */
export const generatePDF = async (content: string, filename: string = 'document.pdf') => {
  try {
    // This function will be dynamically imported when jsPDF is available
    // For now, we'll use a simple text export as a fallback
    await exportAsText(content, filename.replace(/\.pdf$/i, '.txt'));
    
    // Notify the user this is a fallback
    console.warn('PDF generation is not available yet. Document has been exported as text instead.');
    return false;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

/**
 * Export document as plain text
 * @param content The content to export
 * @param filename The filename to use for the text file
 */
export const exportAsText = async (content: string, filename: string = 'document.txt') => {
  try {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    return true;
  } catch (error) {
    console.error('Error exporting as text:', error);
    throw new Error('Failed to export as text. Please try again.');
  }
};

/**
 * Print document to local printer
 * @param content The content to print
 * @param title The title of the document
 */
export const printDocument = (content: string, title: string = 'Document') => {
  try {
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Write content to iframe
    iframe.contentDocument?.open();
    
    // Add necessary styling for print
    iframe.contentDocument?.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
              padding: 2cm;
              margin: 0;
            }
            @media print {
              @page {
                margin: 2cm;
              }
              body {
                padding: 0;
              }
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: "Courier New", monospace;
                font-size: 12pt;
              }
            }
          </style>
        </head>
        <body>
          <pre>${content}</pre>
        </body>
      </html>
    `);
    
    iframe.contentDocument?.close();
    
    // Wait for content to load before printing
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Remove iframe after printing (or if print dialog is closed)
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (err) {
        console.error('Error during print process:', err);
        document.body.removeChild(iframe);
      }
    };
    
    return true;
  } catch (error) {
    console.error('Error initializing print process:', error);
    throw new Error('Failed to print document. Please try again.');
  }
};

/**
 * Detect browser print capabilities
 */
export const checkPrintCapabilities = () => {
  return {
    canPrint: typeof window !== 'undefined' && 'print' in window,
    hasPrintDialog: typeof window !== 'undefined' && 
                    navigator.userAgent.toLowerCase().indexOf('chrome') > -1,
    supportsPdfExport: false // Will update when jsPDF is implemented
  };
};

/**
 * Format document based on desired format before export
 * @param content The raw document content
 * @param format The desired format
 */
export const formatDocumentForExport = (content: string, format: 'pdf' | 'txt' = 'txt') => {
  // For simple text format, just return as is
  if (format === 'txt') {
    return content;
  }
  
  // For PDF, we might need to format differently, but for now return as is
  return content;
};