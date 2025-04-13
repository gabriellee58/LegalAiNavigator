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
  ChevronRight 
} from "lucide-react";
import { t } from "@/lib/i18n";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "@/hooks/use-toast";
import { exportAsText, printDocument, generatePDF } from "@/lib/documentExport";

// Set the PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
    }
  }, [isOpen, documentContent, format]);

  // Convert text to PDF and render it
  const generatePdfFromText = async () => {
    try {
      // Create a simple HTML representation of the text content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
              margin: 40px;
            }
            pre {
              white-space: pre-wrap;
              font-family: 'Courier New', monospace;
            }
          </style>
        </head>
        <body>
          <pre>${documentContent}</pre>
        </body>
        </html>
      `;

      // Use the existing PDF generation function
      const pdfGenSuccess = await generatePDF(documentContent, `${documentTitle}.pdf`, false);
      
      // If the PDF generation function returns a URL, use it
      if (pdfGenSuccess && typeof pdfGenSuccess === 'string') {
        setPdfUrl(pdfGenSuccess);
        loadPdfDocument(pdfGenSuccess);
      } else {
        // Fallback to displaying text
        setPdfUrl(null);
      }
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      toast({
        title: "Preview Generation Error",
        description: "Could not generate PDF preview. Displaying text instead.",
        variant: "destructive"
      });
      setPdfUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load PDF document using PDF.js
  const loadPdfDocument = async (url: string) => {
    try {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdfDoc = await loadingTask.promise;
      pdfDocRef.current = pdfDoc;
      setTotalPages(pdfDoc.numPages);
      renderPage(1);
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
        title: "Download Complete",
        description: `Document has been downloaded as ${format === 'pdf' ? 'PDF' : 'text'}.`
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the document. Please try again.",
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
            title: "Print Preparation",
            description: "Please allow pop-ups and then try printing again."
          });
        }
      } else {
        // Use the existing print function
        printDocument(documentContent, documentTitle);
      }
    } catch (error) {
      console.error("Error printing document:", error);
      toast({
        title: "Print Failed",
        description: "Could not prepare document for printing. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      // Check if Web Share API is available
      if (navigator.share) {
        const shareData = {
          title: documentTitle,
          text: 'Check out this document I created with Canadian Legal AI'
        };
        
        // Add file if available and supported
        if (format === 'pdf' && pdfUrl) {
          try {
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const file = new File([blob], `${documentTitle}.pdf`, { type: 'application/pdf' });
            shareData.files = [file];
          } catch (e) {
            console.error("Error preparing file for sharing:", e);
          }
        }
        
        await navigator.share(shareData);
        
        toast({
          title: "Sharing Initiated",
          description: "Document sharing has been initiated."
        });
      } else {
        toast({
          title: "Sharing Not Available",
          description: "Your browser doesn't support the Web Share API. Please use the download option instead.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sharing document:", error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Sharing Failed",
          description: "Could not share the document. Please try again or use the download option.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{documentTitle}</DialogTitle>
          <DialogDescription>
            {t("preview_and_download_document")}
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
                {t("page")} {currentPage} {t("of")} {totalPages}
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
        
        <DialogFooter className="flex justify-between sm:justify-between flex-row">
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {t("print")}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              {t("share")}
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              {t("download")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;