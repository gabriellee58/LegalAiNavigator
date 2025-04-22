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
    // Try to use CDN worker - verify the CDN is accessible
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    console.log("Using CDN PDF.js worker:", workerSrc);
    
    // Verify worker availability with a HEAD request (no actual download)
    fetch(workerSrc, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Worker not available at CDN: ${response.status}`);
        }
        console.log("PDF.js worker verified available at CDN");
      })
      .catch(err => {
        console.warn("PDF.js worker might not be available at CDN:", err.message);
        // Fallback strategy will be used in generatePdfFromText if needed
      });
  } catch (err) {
    console.error("Error setting up PDF.js worker:", err);
    
    // Fallback to blank worker URL (slower but works without external dependencies)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    console.warn("Using PDF.js without worker - performance may be affected");
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
      
      // Use the existing PDF generation function with preview mode
      const pdfGenResult = await generatePDF(documentContent, `${documentTitle}.pdf`, false);
      
      // Check if we got a valid URL back
      if (pdfGenResult && typeof pdfGenResult === 'string') {
        console.log("PDF generation successful, got URL:", pdfGenResult.substring(0, 50) + "...");
        setPdfUrl(pdfGenResult);
        
        // Wrap PDF document loading in try/catch to handle rendering failures
        try {
          // Verify the URL is accessible before attempting to render
          const response = await fetch(pdfGenResult, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`PDF blob URL not accessible: ${response.status}`);
          }
          
          // Load the PDF document using PDF.js
          console.log("Loading PDF document with PDF.js");
          const loadingTask = pdfjsLib.getDocument(pdfGenResult);
          
          // Add a loading task progress handler
          loadingTask.onProgress = (progress) => {
            console.log(`Loading PDF: ${Math.round(progress.loaded / progress.total * 100)}%`);
          };
          
          const pdfDoc = await loadingTask.promise;
          pdfDocRef.current = pdfDoc;
          
          // Get total pages and initialize rendering
          console.log(`PDF loaded successfully with ${pdfDoc.numPages} pages`);
          setTotalPages(pdfDoc.numPages);
          await renderPage(1);
          setIsLoading(false);
        } catch (pdfError) {
          console.error("PDF.js loading/rendering error:", pdfError);
          
          // Clean up the URL state since we couldn't render it
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
          }
          setPdfUrl(null);
          setIsLoading(false);
          
          toast({
            title: t("PDF Preview Error"),
            description: t("Could not render PDF preview. Showing text format instead."),
            variant: "destructive"
          });
        }
      } else {
        // Handle case where PDF generation didn't return a valid URL
        console.warn("PDF generation did not return a valid URL:", pdfGenResult);
        setPdfUrl(null);
        setIsLoading(false);
        
        toast({
          title: t("Using Text Preview"),
          description: t("PDF preview unavailable. Showing text format instead."),
          variant: "default"
        });
      }
    } catch (error) {
      // Handle errors in the PDF generation process
      console.error("Error in PDF preview generation process:", error);
      
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
              <canvas ref={canvasRef} className="max-w-full" />
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