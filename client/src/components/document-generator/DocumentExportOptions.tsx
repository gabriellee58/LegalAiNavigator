import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { exportAsText, printDocument, generatePDF } from "@/lib/documentExport";
import { toast } from "@/hooks/use-toast";
import { 
  FileText, 
  Printer, 
  Download, 
  FileDown, 
  Eye, 
  Share2, 
  FileBadge,
  Book 
} from "lucide-react";
import { t } from "@/lib/i18n";
import DocumentPreviewModal from "./DocumentPreviewModal";

interface DocumentExportOptionsProps {
  documentContent: string;
  documentTitle: string;
  showPreviewButton?: boolean;
}

const DocumentExportOptions: React.FC<DocumentExportOptionsProps> = ({
  documentContent,
  documentTitle,
  showPreviewButton = true
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<'pdf' | 'txt'>('pdf');
  
  const handleExport = async (format: 'txt' | 'pdf' | 'docx' | 'rtf') => {
    if (!documentContent) {
      toast({
        title: t("No document to export"),
        description: t("Please generate a document first."),
        variant: "destructive",
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Sanitize the filename
      const sanitizedTitle = documentTitle.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      
      if (format === 'txt') {
        await exportAsText(documentContent, `${sanitizedTitle}.txt`);
        toast({
          title: t("Document Exported"),
          description: t("Your document has been exported as a text file."),
        });
      } else if (format === 'pdf') {
        const result = await generatePDF(documentContent, `${sanitizedTitle}.pdf`);
        if (result) {
          toast({
            title: t("PDF Generated"),
            description: t("Your document has been generated as a PDF."),
          });
        } else {
          toast({
            title: t("PDF Generation Limited"),
            description: t("Your browser doesn't fully support PDF generation. Document was exported as text instead."),
            variant: "destructive",
          });
        }
      } else if (format === 'docx' || format === 'rtf') {
        // For now, we'll fallback to text export for these formats
        // In the future, this can be enhanced with proper DOCX/RTF generation
        await exportAsText(documentContent, `${sanitizedTitle}.txt`);
        toast({
          title: t("Format Not Available Yet"),
          description: t("This format is not yet supported. Your document was exported as a text file instead."),
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error exporting document:", error);
      toast({
        title: t("Export Failed"),
        description: error instanceof Error ? error.message : t("There was an error exporting your document. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handlePrint = () => {
    if (!documentContent) {
      toast({
        title: t("No document to print"),
        description: t("Please generate a document first."),
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Show "preparing to print" message
      toast({
        title: t("Preparing document for printing"),
        description: t("The print dialog will open momentarily...")
      });
      
      // Small delay to allow the toast to display before print dialog opens
      setTimeout(() => {
        printDocument(documentContent, documentTitle);
      }, 500);
    } catch (error) {
      console.error("Error printing document:", error);
      toast({
        title: t("Print Failed"),
        description: error instanceof Error ? error.message : t("There was an error printing your document. Please try again."),
        variant: "destructive",
      });
    }
  };
  
  const handleShare = async () => {
    if (!documentContent) {
      toast({
        title: t("No document to share"),
        description: t("Please generate a document first."),
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: documentTitle,
          text: documentContent
        });
        
        toast({
          title: t("Share Initiated"),
          description: t("The sharing dialog has been opened."),
        });
      } else {
        // If Web Share API is not available, copy to clipboard instead
        await navigator.clipboard.writeText(documentContent);
        
        toast({
          title: t("Copied to Clipboard"),
          description: t("The document has been copied to your clipboard. You can now paste it anywhere."),
        });
      }
    } catch (error) {
      console.error("Error sharing document:", error);
      // Don't show error for user canceling share dialog
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: t("Share Failed"),
          description: error instanceof Error ? error.message : t("There was an error sharing your document. Please try again."),
          variant: "destructive",
        });
      }
    }
  };
  
  const handleOpenPreview = (format: 'pdf' | 'txt') => {
    if (!documentContent) {
      toast({
        title: t("No document to preview"),
        description: t("Please generate a document first."),
        variant: "destructive",
      });
      return;
    }
    
    setPreviewFormat(format);
    setPreviewModalOpen(true);
  };
  
  return (
    <>
      <div className="flex flex-wrap gap-2" data-document-export>
        {showPreviewButton && (
          <Button variant="outline" onClick={() => handleOpenPreview('pdf')} className="space-x-2">
            <Eye className="h-4 w-4" />
            <span>{t("Preview")}</span>
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="space-x-2">
              <Download className="h-4 w-4" />
              <span>{t("Export")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
              <FileBadge className="mr-2 h-4 w-4" />
              <span>{t("PDF Document")} (.pdf)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('txt')} disabled={isExporting}>
              <FileText className="mr-2 h-4 w-4" />
              <span>{t("Text File")} (.txt)</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleOpenPreview('pdf')} disabled={isExporting}>
              <Eye className="mr-2 h-4 w-4" />
              <span>{t("Preview Document")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" onClick={handlePrint} className="space-x-2">
          <Printer className="h-4 w-4" />
          <span>{t("Print")}</span>
        </Button>
        
        <Button variant="outline" onClick={handleShare} className="space-x-2">
          <Share2 className="h-4 w-4" />
          <span>{t("Share")}</span>
        </Button>
      </div>
      
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        documentContent={documentContent}
        documentTitle={documentTitle}
        format={previewFormat}
      />
    </>
  );
};

export default DocumentExportOptions;