import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Download, Printer, Share2, RotateCw, ChevronLeft, ChevronRight, Clipboard } from "lucide-react";
import { t } from "@/lib/i18n";
import { exportAsText, printDocument, generatePDF } from "@/lib/documentExport";
import { toast } from "@/hooks/use-toast";


interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentContent: string;
  documentTitle: string;
  format?: 'pdf' | 'txt';
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documentContent,
  documentTitle,
  format = 'txt'
}) => {
  const [previewError, setPreviewError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && documentContent) {
      try {
        if (contentRef.current) {
          // Sanitize content by escaping HTML special characters first
          const sanitizedContent = documentContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\n/g, '<br>')
            .replace(/\s{2,}/g, ' &nbsp;');
          
          contentRef.current.innerHTML = sanitizedContent;
        }
        setPreviewError(null);
      } catch (error) {
        console.error('Preview rendering error:', error);
        setPreviewError('Error rendering preview');
      }
    }
  }, [isOpen, documentContent]);

  // Export functions with improved implementation
  const handleDownload = async () => {
    try {
      toast({
        title: t("Preparing download"),
        description: t("Getting your document ready...")
      });
      
      console.log(`Starting document download in ${format} format`);
      
      if (format === 'pdf' && documentContent) {
        try {
          // Try using PDF generation first
          const result = await generatePDF(documentContent, `${documentTitle}.pdf`, false);
          
          if (typeof result === 'string') {
            // If we got a URL, create a temporary download link
            const sanitizedFilename = documentTitle.replace(/[<>:"/\\|?*]/g, '_');
            
            // Create a temporary download link
            const a = document.createElement('a');
            a.href = result;
            a.download = `${sanitizedFilename}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(result);
            }, 100);
            
            toast({
              title: t("Download Complete"),
              description: t("Document has been downloaded as PDF.")
            });
          } else {
            // Fall back to text if we got a boolean result
            throw new Error("PDF generation returned unexpected result");
          }
        } catch (pdfError) {
          console.error("PDF generation failed, falling back to text:", pdfError);
          
          // Use text download as fallback
          await exportAsText(documentContent, `${documentTitle}.txt`);
          
          toast({
            title: t("Download Complete"),
            description: t("Document has been downloaded as text file (PDF unavailable).")
          });
        }
      } else {
        // For text format, use the text exporter directly
        await exportAsText(documentContent, `${documentTitle}.txt`);
        
        toast({
          title: t("Download Complete"),
          description: t("Document has been downloaded as text file.")
        });
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      
      toast({
        title: t("Download Failed"),
        description: error instanceof Error 
          ? t(`Error: ${error.message}`) 
          : t("Could not download the document. Please try again."),
        variant: "destructive"
      });
    }
  };

  const handlePrint = async () => {
    try {
      toast({
        title: t("Preparing to print"),
        description: t("Setting up document for printing...")
      });
      
      console.log(`Initiating print for document: "${documentTitle}"`);
      
      // Use the enhanced print function which now returns a promise
      await printDocument(documentContent, documentTitle);
      
      toast({
        title: t("Print Successful"),
        description: t("Print dialog has been opened.")
      });
    } catch (error) {
      console.error("Error printing document:", error);
      
      toast({
        title: t("Print Failed"),
        description: error instanceof Error 
          ? t(`Error: ${error.message}`) 
          : t("Could not prepare document for printing. Please try again."),
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        const shareData: ShareData = {
          title: documentTitle,
          text: t('Check out this document I created with Canadian Legal AI')
        };
        await navigator.share(shareData);
        toast({
          title: t("Sharing Initiated"),
          description: t("Document sharing has been initiated.")
        });
      } else {
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
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{documentTitle}</DialogTitle>
          <DialogDescription>
            {t("Document Preview")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4 bg-white dark:bg-gray-900 rounded-md p-6">
          {previewError ? (
            <div className="text-red-500 p-4 text-center">
              {previewError}
              <div className="mt-2">
                <Button onClick={() => window.open(`data:text/plain;charset=utf-8,${encodeURIComponent(documentContent)}`)}>
                  {t("Open in New Tab")}
                </Button>
              </div>
            </div>
          ) : (
            <div
              ref={contentRef}
              className="prose max-w-none dark:prose-invert whitespace-pre-wrap font-mono text-sm"
              style={{
                minHeight: '200px',
                lineHeight: '1.6'
              }}
            />
          )}
        </div>
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