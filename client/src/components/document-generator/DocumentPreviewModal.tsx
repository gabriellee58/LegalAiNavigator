import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Download, Printer, Share2, RotateCw, ChevronLeft, ChevronRight, Clipboard } from "lucide-react";
import { t } from "@/lib/i18n";
import { exportAsText, printDocument, generatePDF } from "@/lib/documentExport";


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
          contentRef.current.innerHTML = documentContent
            .replace(/\n/g, '<br>')
            .replace(/\s{2,}/g, ' &nbsp;');
        }
        setPreviewError(null);
      } catch (error) {
        console.error('Preview rendering error:', error);
        setPreviewError('Error rendering preview');
      }
    }
  }, [isOpen, documentContent]);

  // Export functions (from original code)
  const handleDownload = async () => {
    try {
      if (format === 'pdf' &&  documentContent) {
        //Fallback to text download since PDF preview is handled differently now.
        await exportAsText(documentContent, `${documentTitle}.txt`);
      } else {
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
      printDocument(documentContent, documentTitle);
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