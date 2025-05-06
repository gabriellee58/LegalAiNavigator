/**
 * Document Export Utilities
 * 
 * This file provides functionality for exporting documents in various formats,
 * print features, and enhanced PDF generation.
 */

/**
 * Generate a PDF from content and optionally return a URL to the PDF
 * @param content The content to convert to PDF
 * @param filename The filename to use for the PDF
 * @param openPrintDialog Whether to open the print dialog
 * @returns Boolean success or a string URL to the generated PDF data
 */
export const generatePDF = async (
  content: string, 
  filename: string = 'document.pdf', 
  openPrintDialog: boolean = true
): Promise<string | boolean> => {
  // Track the created iframe for proper cleanup
  let iframe: HTMLIFrameElement | null = null;
  
  try {
    console.log(`Starting PDF generation for "${filename}" with ${content.length} chars of content`);
    
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Document content is empty');
    }
    
    // Create a hidden iframe to use for PDF generation
    iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('title', 'PDF Generation Frame');
    document.body.appendChild(iframe);
    
    // Extract document title from content or use filename
    let documentTitle = filename.replace(/\.[^/.]+$/, ""); // Remove extension
    
    // Try to extract title from content if it's markdown
    if (content.startsWith('#')) {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        documentTitle = titleMatch[1].trim();
      }
    }
    
    // Get current date for the document header
    const formattedDate = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Generate a unique watermark ID that includes a random portion
    const watermarkId = `watermark_${Math.random().toString(36).substring(2, 9)}`;
    
    // Format content with proper styling and document structure
    // Improved formatting with better font fallbacks and encoding safety
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${documentTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            html, body {
              margin: 0;
              padding: 0;
              font-size: 12pt;
              color: black;
              background-color: white;
            }
            body {
              font-family: "Times New Roman", Times, Georgia, serif;
              line-height: 1.5;
              padding: 0.5cm;
              min-height: 100%;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: "Courier New", Courier, monospace;
              margin: 0;
              padding: 0;
              font-size: 11pt;
              line-height: 1.4;
            }
            .document-header {
              margin-bottom: 2cm;
            }
            .document-title {
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 0.5cm;
              text-align: center;
            }
            .document-date {
              font-size: 11pt;
              text-align: center;
              margin-bottom: 0.5cm;
              color: #555;
            }
            .document-content {
              height: auto;
              min-height: 35cm; /* ensure there's enough content to fill the page */
            }
            .page-break {
              page-break-after: always;
            }
            .${watermarkId} {
              position: fixed;
              bottom: 1cm;
              right: 1cm;
              font-size: 9pt;
              color: #999;
              opacity: 0.7;
              z-index: 1000;
            }
            
            /* Print-specific styles */
            @media print {
              body {
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .${watermarkId} {
                opacity: 0.4;
              }
            }
          </style>
        </head>
        <body>
          <div class="document-header">
            <div class="document-title">${documentTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <div class="document-date">${formattedDate}</div>
          </div>
          <div class="document-content">
            <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </div>
          <div class="${watermarkId}">Generated by Canadian Legal AI</div>
        </body>
      </html>
    `;
    
    // Write content to iframe
    if (iframe.contentWindow) {
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(html);
      iframe.contentWindow.document.close();
      console.log("Written HTML content to iframe, waiting for it to load...");
    } else {
      console.error("Could not access iframe content window");
      if (iframe && document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      throw new Error('Failed to initialize document preview');
    }
    
    return new Promise<boolean | string>((resolve, reject) => {
      // Track whether we've resolved/rejected already to prevent multiple callbacks
      let resolved = false;
      
      // Set a safety timeout in case the load event never fires
      const safetyTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn('PDF generation safety timeout reached - proceeding anyway');
          processPdfGeneration();
        }
      }, 1500);

      // Function to handle iframe load or timeout
      const processPdfGeneration = () => {
        try {
          clearTimeout(safetyTimeout);
          
          const win = iframe?.contentWindow;
          
          if (!win || !iframe) {
            throw new Error('Failed to access content window');
          }
          
          console.log("Iframe loaded, proceeding with PDF operation");
          
          // If we need to open print dialog
          if (openPrintDialog) {
            // Check browser capabilities
            if (navigator.userAgent.indexOf('Chrome') > -1 || 
                navigator.userAgent.indexOf('Firefox') > -1 || 
                navigator.userAgent.indexOf('Safari') > -1) {
              // These browsers have better PDF export support
              win.focus();
              win.print();
              resolve(true);
            } else {
              // For other browsers, provide text fallback
              console.warn("Browser doesn't support good PDF printing, falling back to text");
              exportAsText(content, filename.replace(/\.pdf$/i, '.txt'));
              resolve(false);
            }
          } else {
            // For preview, create a simple data URL with the HTML content
            console.log("Creating blob URL for PDF preview");
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Ensure to clean up the iframe after URL creation
            setTimeout(() => {
              try {
                if (iframe && document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                  iframe = null;
                }
              } catch (e) {
                console.warn('Iframe cleanup error:', e);
              }
            }, 500);
            
            resolve(url);
          }
        } catch (err) {
          console.error('Error in PDF generation process:', err);
          
          // Clean up iframe
          try {
            if (iframe && document.body.contains(iframe)) {
              document.body.removeChild(iframe);
              iframe = null;
            }
          } catch (e) {
            console.warn('Iframe cleanup error during error recovery:', e);
          }
          
          // Fallback to text blob for preview
          console.warn("Falling back to text blob for preview");
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          
          // Still consider this a success for the caller, but with a plain text URL
          resolve(url);
        }
      };
      
      // Wait for iframe to load before proceeding
      if (iframe) {
        iframe.onload = () => {
          if (!resolved) {
            resolved = true;
            processPdfGeneration();
          }
        };
        
        // In case the iframe triggers an error
        iframe.onerror = (err) => {
          if (!resolved) {
            resolved = true;
            console.error('Iframe loading error:', err);
            reject(new Error('Failed to load document preview'));
          }
        };
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Clean up iframe if it exists
    if (iframe && document.body.contains(iframe)) {
      try {
        document.body.removeChild(iframe);
      } catch (e) {
        console.warn('Failed to clean up iframe during error handling:', e);
      }
    }
    
    // Re-throw the error with a more descriptive message
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Export document as plain text
 * @param content The content to export
 * @param filename The filename to use for the text file
 * @returns Promise that resolves with a boolean indicating success
 */
export const exportAsText = async (content: string, filename: string = 'document.txt'): Promise<boolean> => {
  try {
    // Validate inputs
    if (!content) {
      throw new Error('No content provided for text export');
    }
    
    console.log(`Exporting text file "${filename}" with ${content.length} characters`);
    
    // Create a sanitized filename (remove problematic characters)
    const sanitizedFilename = filename.replace(/[<>:"/\\|?*]/g, '_');
    
    // Create a blob with the content
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(file);
    
    // Create a temporary download link
    const element = document.createElement('a');
    element.href = url;
    element.download = sanitizedFilename;
    element.style.display = 'none';
    
    // Add to document, trigger click, and remove
    document.body.appendChild(element);
    element.click();
    
    // Small delay before cleanup to ensure the download starts
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Clean up
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
    
    console.log(`Text export of "${sanitizedFilename}" completed successfully`);
    return true;
  } catch (error) {
    console.error('Error exporting document as text:', error);
    throw new Error(`Failed to export as text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Print document to local printer with enhanced reliability
 * @param content The content to print
 * @param title The title of the document
 * @returns Promise that resolves when print operation completes
 */
export const printDocument = (content: string, title: string = 'Document'): Promise<boolean> => {
  let iframe: HTMLIFrameElement | null = null;
  
  return new Promise((resolve, reject) => {
    try {
      console.log(`Preparing to print document: "${title}" (${content.length} chars)`);
      
      // Validate content
      if (!content || content.trim().length === 0) {
        throw new Error('No content provided for printing');
      }
      
      // Format date for document header
      const formattedDate = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Create a hidden iframe for printing
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.setAttribute('title', 'Print Frame');
      document.body.appendChild(iframe);
      
      // Generate a unique ID for the document container
      const containerId = `print-container-${Math.random().toString(36).substring(2, 9)}`;
      
      // Sanitize title for safe HTML insertion
      const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Write enhanced content to iframe with better styling
      if (!iframe.contentDocument) {
        throw new Error('Could not access iframe document');
      }
      
      iframe.contentDocument.open();
      iframe.contentDocument.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${safeTitle}</title>
            <style>
              @page {
                size: A4;
                margin: 2cm;
              }
              
              html, body {
                margin: 0;
                padding: 0;
                font-size: 12pt;
                color: black;
                background-color: white;
              }
              
              body {
                font-family: "Times New Roman", Times, Georgia, serif;
                line-height: 1.5;
                padding: 0.5cm;
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
                color: #444;
              }
              
              .document-content {
                font-size: 12pt;
                min-height: 35cm;
              }
              
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: "Courier New", Courier, monospace;
                font-size: 11pt;
                line-height: 1.4;
                margin: 0;
              }
              
              @media print {
                body {
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                
                .page-break {
                  page-break-after: always;
                }
                
                .document-footer {
                  position: fixed;
                  bottom: 0.5cm;
                  right: 0.5cm;
                  font-size: 9pt;
                  color: #999;
                }
              }
            </style>
          </head>
          <body>
            <div id="${containerId}">
              <div class="document-header">
                <div class="document-title">${safeTitle}</div>
                <div class="document-date">${formattedDate}</div>
              </div>
              <div class="document-content">
                <pre>${safeContent}</pre>
              </div>
              <div class="document-footer">Generated by Canadian Legal AI</div>
            </div>
            
            <script>
              // This script helps ensure reliable printing
              document.addEventListener('DOMContentLoaded', function() {
                // Signal that the document is ready for printing
                window.parent.postMessage('print-ready', '*');
              });
              
              // Back up print trigger in case message event fails
              setTimeout(function() {
                try {
                  window.print();
                } catch(e) {
                  console.error('Print error:', e);
                }
              }, 500);
            </script>
          </body>
        </html>
      `);
      iframe.contentDocument.close();
      
      // Listen for the ready message from the iframe
      const messageHandler = (event: MessageEvent) => {
        if (event.data === 'print-ready' && iframe && iframe.contentWindow) {
          // Clean up the event listener
          window.removeEventListener('message', messageHandler);
          
          try {
            console.log('Print document ready, opening print dialog');
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // Consider the operation successful once print dialog opens
            resolve(true);
            
            // Remove iframe after printing (or if print dialog is closed)
            setTimeout(() => {
              try {
                if (iframe && document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                  iframe = null;
                }
              } catch (cleanupErr) {
                console.warn('Iframe cleanup warning:', cleanupErr);
              }
            }, 1000);
          } catch (printErr) {
            console.error('Error during print process:', printErr);
            reject(new Error(`Print dialog failed: ${printErr instanceof Error ? printErr.message : 'Unknown error'}`));
            
            // Clean up the iframe on error
            try {
              if (iframe && document.body.contains(iframe)) {
                document.body.removeChild(iframe);
                iframe = null;
              }
            } catch (cleanupErr) {
              console.warn('Iframe cleanup warning:', cleanupErr);
            }
          }
        }
      };
      
      // Listen for messages from the iframe
      window.addEventListener('message', messageHandler);
      
      // Set a backup timeout in case the print-ready event never fires
      const backupTimeout = setTimeout(() => {
        if (iframe && iframe.contentWindow) {
          try {
            console.log('Using backup print trigger');
            window.removeEventListener('message', messageHandler);
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            resolve(true);
            
            // Cleanup iframe
            setTimeout(() => {
              try {
                if (iframe && document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                  iframe = null;
                }
              } catch (cleanupErr) {
                console.warn('Backup iframe cleanup warning:', cleanupErr);
              }
            }, 1000);
          } catch (err) {
            console.error('Error in backup print trigger:', err);
            reject(new Error(`Backup print failed: ${err instanceof Error ? err.message : 'Unknown error'}`));
            
            try {
              if (iframe && document.body.contains(iframe)) {
                document.body.removeChild(iframe);
                iframe = null;
              }
            } catch (cleanupErr) {
              console.warn('Backup iframe cleanup warning:', cleanupErr);
            }
          }
        }
      }, 1500);
      
      // Alternative approach: trigger print via onload
      iframe.onload = () => {
        // Clear the backup timeout since onload fired
        clearTimeout(backupTimeout);
        
        // Only proceed if we haven't already handled printing
        if (iframe && iframe.contentWindow && document.body.contains(iframe)) {
          try {
            console.log('Iframe loaded, using onload print trigger');
            window.removeEventListener('message', messageHandler);
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            resolve(true);
            
            // Cleanup iframe
            setTimeout(() => {
              try {
                if (iframe && document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                  iframe = null;
                }
              } catch (cleanupErr) {
                console.warn('Onload iframe cleanup warning:', cleanupErr);
              }
            }, 1000);
          } catch (err) {
            console.error('Error in onload print trigger:', err);
            reject(new Error(`Onload print failed: ${err instanceof Error ? err.message : 'Unknown error'}`));
            
            try {
              if (iframe && document.body.contains(iframe)) {
                document.body.removeChild(iframe);
                iframe = null;
              }
            } catch (cleanupErr) {
              console.warn('Onload iframe cleanup warning:', cleanupErr);
            }
          }
        }
      };
      
    } catch (error) {
      console.error('Error initializing print process:', error);
      
      // Clean up iframe if it exists
      if (iframe && document.body.contains(iframe)) {
        try {
          document.body.removeChild(iframe);
        } catch (e) {
          console.warn('Failed to clean up iframe during error handling:', e);
        }
      }
      
      reject(new Error(`Print initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
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