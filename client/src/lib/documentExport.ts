/**
 * Document Export Utilities
 * 
 * This file provides functionality for exporting documents in various formats,
 * print features, and PDF generation that works reliably across browsers.
 */

/**
 * Generate a PDF from content
 * @param content The content to convert to PDF
 * @param filename The filename to use for the PDF
 * @param openPrintDialog Whether to open the print dialog
 * @returns Promise resolving to boolean success or a string URL
 */
export const generatePDF = async (
  content: string, 
  filename: string = 'document.pdf', 
  openPrintDialog: boolean = true
): Promise<boolean | string> => {
  try {
    console.log(`Starting PDF generation for "${filename}" (${content.length} chars)`);
    
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Document content is empty');
    }
    
    // Format the content with proper styling for PDF
    const { documentEl, iframe } = await createPrintableDocument(content, filename);
    
    if (openPrintDialog) {
      await triggerPrint(iframe);
      return true;
    } else {
      // For preview or download, create a blob URL
      const html = documentEl.outerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Cleanup the iframe
      setTimeout(() => {
        if (iframe && document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 500);
      
      return url;
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Create a printable document with the content formatted for PDF export
 * @param content The document content
 * @param title The document title
 * @returns Promise resolving to the document element and iframe
 */
const createPrintableDocument = async (
  content: string,
  title: string
): Promise<{ documentEl: HTMLElement, iframe: HTMLIFrameElement }> => {
  // Create a hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('title', 'Print Frame');
  document.body.appendChild(iframe);
  
  if (!iframe.contentDocument) {
    throw new Error('Could not access iframe document');
  }
  
  // Sanitize inputs
  const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Format date
  const formattedDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Generate a unique watermark ID
  const watermarkId = `watermark_${Math.random().toString(36).substring(2, 9)}`;
  
  // Write the HTML content to the iframe
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
            
            .${watermarkId} {
              position: fixed;
              bottom: 0.5cm;
              right: 0.5cm;
              font-size: 9pt;
              color: #999;
              opacity: 0.4;
            }
          }
        </style>
      </head>
      <body>
        <div id="document-container">
          <div class="document-header">
            <div class="document-title">${safeTitle}</div>
            <div class="document-date">${formattedDate}</div>
          </div>
          <div class="document-content">
            <pre>${safeContent}</pre>
          </div>
          <div class="${watermarkId}">Generated by Canadian Legal AI</div>
        </div>
      </body>
    </html>
  `);
  iframe.contentDocument.close();
  
  // Wait for the iframe to load
  await new Promise<void>((resolve) => {
    const timeoutId = setTimeout(() => resolve(), 1000);
    iframe.onload = () => {
      clearTimeout(timeoutId);
      resolve();
    };
  });
  
  const documentEl = iframe.contentDocument.getElementById('document-container') as HTMLElement;
  if (!documentEl) {
    throw new Error('Could not find document container element');
  }
  
  return { documentEl, iframe };
};

/**
 * Trigger a print operation on the provided iframe
 * @param iframe The iframe to print
 * @returns Promise that resolves when the print dialog has been opened
 */
const triggerPrint = (iframe: HTMLIFrameElement): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      if (!iframe.contentWindow) {
        throw new Error('Could not access iframe content window');
      }
      
      // Focus and print
      iframe.contentWindow.focus();
      
      // Use setTimeout to ensure the focus takes effect
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
          
          // Clean up iframe after printing (or once print dialog is closed)
          setTimeout(() => {
            if (iframe && document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
          
          resolve(true);
        } catch (err) {
          console.error('Print error:', err);
          reject(err);
        }
      }, 200);
    } catch (err) {
      console.error('Print trigger error:', err);
      reject(err);
    }
  });
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
    
    console.log(`Exporting text file "${filename}" (${content.length} chars)`);
    
    // Create a sanitized filename (remove problematic characters)
    const sanitizedFilename = filename.replace(/[<>:"/\\|?*]/g, '_');
    
    // Create a blob with the content
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = sanitizedFilename;
    downloadLink.style.display = 'none';
    
    // Add to document, trigger click, and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Small delay before cleanup to ensure the download starts
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Clean up
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    console.log(`Text export complete: "${sanitizedFilename}"`);
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
export const printDocument = async (content: string, title: string = 'Document'): Promise<boolean> => {
  try {
    console.log(`Printing document: "${title}" (${content.length} chars)`);
    
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('No content provided for printing');
    }
    
    // Create the printable document
    const { iframe } = await createPrintableDocument(content, title);
    
    // Trigger the print dialog
    await triggerPrint(iframe);
    
    return true;
  } catch (error) {
    console.error('Error printing document:', error);
    throw new Error(`Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};