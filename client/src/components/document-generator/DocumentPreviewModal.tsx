import React, { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Printer, 
  Share2, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight,
  Clipboard
} from "lucide-react";
import { t } from "@/lib/i18n";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "@/hooks/use-toast";
import { exportAsText, printDocument, generatePDF } from "@/lib/documentExport";

// Set the PDF.js worker path - ensure it works with our current environment
if (typeof window !== 'undefined') {
  try {
    // Set worker directly to empty string to use built-in worker
    // This is more reliable than trying to use CDN which can be blocked
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    console.log("Using built-in PDF.js worker for better reliability");
    
    // The empty worker source tells PDF.js to use the built-in worker
    // which is slower but more reliable as it doesn't depend on external CDNs
  } catch (err) {
    console.error("Error setting up PDF.js worker:", err);
  }
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentContent: string;
  documentTitle: string;
  format?: 'pdf' | 'txt'; // Default to txt if not specified
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documentContent,
  documentTitle,
  format = 'txt'
}) => {
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Generate PDF from text content when the modal opens
  useEffect(() => {
    if (isOpen && format === 'pdf' && documentContent) {
      setIsLoading(true);
      generatePdfFromText();
    } else if (isOpen && format === 'txt') {
      setIsLoading(false);
    }
  }, [isOpen, documentContent, format]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Convert text to PDF and render it with enhanced error handling
  const generatePdfFromText = async () => {
    try {
      setIsLoading(true);
      console.log("Starting PDF generation with content length:", documentContent.length);
      console.log("Document title:", documentTitle);
      
      // Create HTML blob directly for better compatibility
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${documentTitle}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 20px;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
              }
              pre {
                white-space: pre-wrap;
                font-family: 'Courier New', Courier, monospace;
                font-size: 14px;
                line-height: 1.4;
                background: #f9f9f9;
                padding: 15px;
                border-radius: 4px;
                border: 1px solid #eee;
                overflow-x: auto;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
                color: #444;
              }
            </style>
          </head>
          <body>
            <h1>${documentTitle}</h1>
            <pre>${documentContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </body>
        </html>
      `;
      
      // Create a blob URL for direct rendering
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const htmlUrl = URL.createObjectURL(blob);
      
      // Set this as our PDF URL
      console.log("Created HTML blob URL for preview:", htmlUrl);
      setPdfUrl(htmlUrl);
      setIsLoading(false);
      
      // For debugging - log preview URL and display format
      console.log("Current preview state:", { 
        format, 
        pdfUrl: htmlUrl,
        contentLength: documentContent.length,
        isPreviewShowing: format === 'pdf' && htmlUrl !== null
      });
      
      // Attempt to use PDF.js for more advanced rendering if available
      try {
        // First, check if we can use the built-in PDF generation
        console.log("Attempting generatePDF from documentExport library...");
        const pdfGenResult = await generatePDF(documentContent, `${documentTitle}.pdf`, false);
        
        console.log("PDF generation result type:", typeof pdfGenResult);
        console.log("PDF generation result value:", 
          typeof pdfGenResult === 'string' 
            ? pdfGenResult.substring(0, 50) + "..." 
            : pdfGenResult
        );
        
        // Only process if we got a valid URL back
        if (pdfGenResult && typeof pdfGenResult === 'string') {
          console.log("PDF generation successful, got URL:", pdfGenResult.substring(0, 50) + "...");
          
          // Revoke the previous blob URL
          if (pdfUrl) {
            console.log("Revoking previous blob URL");
            URL.revokeObjectURL(pdfUrl);
          }
          
          // Set the new PDF URL
          console.log("Setting new PDF URL");
          setPdfUrl(pdfGenResult);
          
          // Load the PDF document using PDF.js
          console.log("Loading PDF document with PDF.js");
          const loadingTask = pdfjsLib.getDocument(pdfGenResult);
          
          // Add a loading task progress handler
          loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
            console.log(`Loading PDF: ${Math.round(progress.loaded / progress.total * 100)}%`);
          };
          
          const pdfDoc = await loadingTask.promise;
          pdfDocRef.current = pdfDoc;
          
          // Get total pages and initialize rendering
          console.log(`PDF loaded successfully with ${pdfDoc.numPages} pages`);
          setTotalPages(pdfDoc.numPages);
          await renderPage(1);
        } else {
          // Handle case where PDF generation didn't return a valid URL
          console.warn("PDF generation did not return a valid URL, using HTML fallback");
        }
      } catch (pdfError) {
        console.error("PDF.js loading/rendering error:", pdfError);
        console.error("PDF error details:", {
          name: pdfError.name,
          message: pdfError.message,
          stack: pdfError.stack
        });
        // We already have an HTML preview, so this is just a warning
        console.warn("Using HTML fallback for document preview");
      }
    } catch (error) {
      // Handle errors in the PDF generation process
      console.error("Error in PDF preview generation process:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Clean up any existing URL state
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(null);
      setIsLoading(false);
      
      // Show error toast
      toast({
        title: t("Preview Generation Error"),
        description: error instanceof Error 
          ? t(`PDF generation failed: ${error.message}`)
          : t("Could not generate PDF preview. Showing text format instead."),
        variant: "destructive"
      });
    }
  };

  // Load PDF document using PDF.js
  const loadPdfDocument = async (url: string) => {
    try {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdfDoc = await loadingTask.promise;
      pdfDocRef.current = pdfDoc;
      setTotalPages(pdfDoc.numPages);
      await renderPage(1);
    } catch (error) {
      console.error("Error loading PDF document:", error);
      setIsLoading(false);
    }
  };

  // Render a specific page of the PDF
  const renderPage = async (pageNumber: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error("Could not get canvas context");
      }

      // Calculate scaled viewport based on zoom and rotation
      const viewport = page.getViewport({ scale: zoom, rotation: rotation });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      setCurrentPage(pageNumber);
      setIsLoading(false);
    } catch (error) {
      console.error("Error rendering PDF page:", error);
      setIsLoading(false);
    }
  };

  // Navigation and zoom controls
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      renderPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      renderPage(currentPage - 1);
    }
  };

  const zoomIn = () => {
    setZoom(prevZoom => {
      const newZoom = Math.min(prevZoom + 0.25, 3);
      renderPage(currentPage);
      return newZoom;
    });
  };

  const zoomOut = () => {
    setZoom(prevZoom => {
      const newZoom = Math.max(prevZoom - 0.25, 0.5);
      renderPage(currentPage);
      return newZoom;
    });
  };

  const rotateClockwise = () => {
    setRotation(prevRotation => {
      const newRotation = (prevRotation + 90) % 360;
      renderPage(currentPage);
      return newRotation;
    });
  };

  // Export functions
  const handleDownload = async () => {
    try {
      if (format === 'pdf' && pdfUrl) {
        // Download the PDF directly
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${documentTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback to text download
        await exportAsText(documentContent, `${documentTitle}.txt`);
      }
      
      toast({
        title: t("Download Complete"),
        description: t(`Document has been downloaded as ${format === 'pdf' ? 'PDF' : 'text'}.`)
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: t("Download Failed"),
        description: t("Could not download the document. Please try again."),
        variant: "destructive"
      });
    }
  };

  const handlePrint = () => {
    try {
      if (format === 'pdf' && pdfUrl) {
        // Open PDF in new window for printing
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        } else {
          toast({
            title: t("Print Preparation"),
            description: t("Please allow pop-ups and then try printing again.")
          });
        }
      } else {
        // Use the existing print function
        printDocument(documentContent, documentTitle);
      }
    } catch (error) {
      console.error("Error printing document:", error);
      toast({
        title: t("Print Failed"),
        description: t("Could not prepare document for printing. Please try again."),
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      // Check if Web Share API is available
      if (navigator.share) {
        const shareData: ShareData = {
          title: documentTitle,
          text: t('Check out this document I created with Canadian Legal AI')
        };
        
        // Add file if available and supported
        if (format === 'pdf' && pdfUrl) {
          try {
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const file = new File([blob], `${documentTitle}.pdf`, { type: 'application/pdf' });
            
            // Check if files are supported in the share API
            // Note: The files property exists on the Web Share API Level 2
            // but TypeScript's type definitions might not be updated
            if ('canShare' in navigator && 
                typeof navigator.canShare === 'function' && 
                navigator.canShare({ files: [file] })) {
              // We need to use type assertion since TypeScript doesn't fully
              // support the File[] in ShareData interface yet
              const shareDataWithFile = shareData as ShareData & { files: File[] };
              shareDataWithFile.files = [file];
              await navigator.share(shareDataWithFile);
              
              toast({
                title: t("Sharing Initiated"),
                description: t("Document sharing has been initiated.")
              });
              return;
            }
          } catch (e) {
            console.error("Error preparing file for sharing:", e);
          }
        }
        
        await navigator.share(shareData);
        
        toast({
          title: t("Sharing Initiated"),
          description: t("Document sharing has been initiated.")
        });
      } else {
        // If Web Share API is not available, copy to clipboard instead
        await navigator.clipboard.writeText(documentContent);
        
        toast({
          title: t("Copied to Clipboard"),
          description: t("Document has been copied to your clipboard."),
        });
      }
    } catch (error) {
      console.error("Error sharing document:", error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: t("Sharing Failed"),
          description: t("Could not share the document. Please try again or use the download option."),
          variant: "destructive"
        });
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(documentContent);
      toast({
        title: t("Copied to Clipboard"),
        description: t("Document text has been copied to your clipboard.")
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: t("Copy Failed"),
        description: t("Could not copy to clipboard. Please try again."),
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{documentTitle}</DialogTitle>
          <DialogDescription>
            {t("Preview and export your document")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-4 min-h-[300px] border rounded-md my-4 relative">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : format === 'pdf' && pdfUrl ? (
            <div className="flex flex-col items-center">
              {/* Primary PDF preview using canvas */}
              <canvas 
                ref={canvasRef} 
                className="max-w-full border border-dashed border-gray-300 min-h-[400px]" 
                data-testid="pdf-preview-canvas"
              />
              
              {/* Fallback iframe preview in case canvas render fails */}
              <iframe 
                src={pdfUrl} 
                className="w-full mt-2 min-h-[500px] border border-gray-200 rounded" 
                title="Document Preview"
                style={{ display: totalPages > 0 ? 'none' : 'block' }}
              />
              
              {/* Debug info */}
              <div className="w-full mt-2 text-xs text-gray-500 p-2 bg-gray-50 rounded">
                Preview type: {totalPages > 0 ? 'Canvas (PDF.js)' : 'Fallback (iframe)'}
                <br />
                URL type: {pdfUrl?.startsWith('blob:') ? 'Blob URL' : 'Other URL'}
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm w-full h-full p-4">
              {documentContent}
            </pre>
          )}
        </div>
        
        {format === 'pdf' && pdfUrl && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {t("Page")} {currentPage} {t("of")} {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={rotateClockwise}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex justify-between sm:justify-between flex-row flex-wrap gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t("Close")}
          </Button>
          
          <div className="flex items-center flex-wrap gap-2">
            <Button variant="outline" onClick={copyToClipboard}>
              <Clipboard className="h-4 w-4 mr-2" />
              {t("Copy")}
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {t("Print")}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              {t("Share")}
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              {t("Download")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;