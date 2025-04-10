/**
 * Document Export Utilities
 * 
 * This file provides functionality for exporting documents in various formats
 * and printing them to local printers.
 */

/**
 * Generate a PDF from content using browser's print functionality
 * @param content The content to convert to PDF
 * @param filename The filename to use for the PDF
 */
export const generatePDF = async (content: string, filename: string = 'document.pdf') => {
  try {
    // Create a hidden iframe to use the browser's print-to-PDF functionality
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    // Format content with proper styling
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: "Times New Roman", Times, serif;
              font-size: 12pt;
              line-height: 1.5;
              color: black;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: "Courier New", monospace;
              margin: 0;
              padding: 0;
            }
            .document-title {
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 1.5cm;
              text-align: center;
            }
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          <div class="document-content">
            <pre>${content}</pre>
          </div>
        </body>
      </html>
    `;
    
    // Write content to iframe
    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(html);
    iframe.contentWindow?.document.close();
    
    return new Promise<boolean>((resolve) => {
      iframe.onload = () => {
        try {
          const win = iframe.contentWindow;
          
          // For browsers that support it, show save as PDF dialog
          if (win) {
            if (navigator.userAgent.indexOf('Chrome') > -1 || navigator.userAgent.indexOf('Firefox') > -1) {
              // These browsers have better PDF export support
              win.focus();
              win.print();
              
              // Show message for user to select "Save as PDF" option
              console.info('Please select "Save as PDF" in the print dialog to generate your PDF');
              resolve(true);
            } else {
              // For other browsers, provide text fallback
              exportAsText(content, filename.replace(/\.pdf$/i, '.txt'));
              resolve(false);
            }
          } else {
            throw new Error('Failed to access print window');
          }
          
          // Clean up the iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 5000); // Allow time for print dialog
        } catch (err) {
          console.error('Error in print process:', err);
          document.body.removeChild(iframe);
          resolve(false);
        }
      };
    });
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
    // Format date for document header
    const formattedDate = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Add document title and date to content
    const contentWithHeader = `${title}\n\n${formattedDate}\n\n${content}`;
    
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
              font-family: "Times New Roman", Times, serif;
              line-height: 1.5;
              margin: 0;
              padding: 0;
              color: black;
            }
            
            .document-header {
              text-align: center;
              margin-bottom: 1.5cm;
            }
            
            .document-title {
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 0.5cm;
            }
            
            .document-date {
              font-size: 12pt;
              margin-bottom: 1cm;
            }
            
            .document-content {
              font-size: 12pt;
            }
            
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: "Courier New", monospace;
              font-size: 12pt;
              margin: 0;
            }
            
            @media print {
              @page {
                size: A4;
                margin: 2cm;
              }
              
              body {
                padding: 0;
              }
              
              .page-break {
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="document-header">
            <div class="document-title">${title}</div>
            <div class="document-date">${formattedDate}</div>
          </div>
          <div class="document-content">
            <pre>${content}</pre>
          </div>
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