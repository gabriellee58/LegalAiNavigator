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
    
    // Show loading toast
    toast({
      title: t("Preparing document"),
      description: t("Please wait while we prepare your document..."),
    });
    
    try {
      console.log(`Starting document export in ${format} format`);
      
      // Sanitize the filename to prevent any file system issues
      const sanitizedTitle = documentTitle
        .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
        .replace(/_+/g, "_") // Replace multiple underscores with a single one
        .trim();
      
      if (format === 'txt') {
        // Text export - directly use the text exporter
        console.log(`Exporting text file: ${sanitizedTitle}.txt`);
        await exportAsText(documentContent, `${sanitizedTitle}.txt`);
        
        // Success message
        toast({
          title: t("Document Exported"),
          description: t("Your document has been exported as a text file."),
        });
      } else if (format === 'pdf') {
        try {
          // First attempt - use the built-in PDF generation
          console.log(`Generating PDF file: ${sanitizedTitle}.pdf`);
          
          // Use HTML/CSS method for reliable PDF generation
          const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${sanitizedTitle}</title>
                <style>
                  @page {
                    margin: 2cm;
                  }
                  body {
                    font-family: "Times New Roman", Times, serif;
                    line-height: 1.6;
                    font-size: 12pt;
                    margin: 0;
                    padding: 0;
                  }
                  .container {
                    max-width: 100%;
                    padding: 1cm;
                  }
                  h1 {
                    font-size: 16pt;
                    margin-bottom: 1cm;
                    text-align: center;
                  }
                  pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-family: "Courier New", Courier, monospace;
                    font-size: 11pt;
                    line-height: 1.4;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>${sanitizedTitle}</h1>
                  <pre>${documentContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </div>
              </body>
            </html>
          `;
          
          // Create a blob and trigger print dialog which allows saving as PDF
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          
          // Create a hidden iframe to trigger printing
          const iframe = document.createElement('iframe');
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = 'none';
          iframe.style.visibility = 'hidden';
          
          document.body.appendChild(iframe);
          iframe.onload = () => {
            // Open print dialog after iframe loads
            setTimeout(() => {
              if (iframe.contentWindow) {
                iframe.contentWindow.print();
                
                // Success message
                toast({
                  title: t("PDF Export Ready"),
                  description: t("The print dialog has opened. Choose Save as PDF to complete the export."),
                });
                
                // Clean up after a delay
                setTimeout(() => {
                  document.body.removeChild(iframe);
                  URL.revokeObjectURL(url);
                }, 1000);
              }
            }, 500);
          };
          
          // Set iframe source
          iframe.src = url;
          
        } catch (pdfError) {
          console.error("Error using primary PDF export method:", pdfError);
          
          // Fall back to the legacy PDF method
          try {
            console.log("Falling back to legacy PDF generation...");
            const result = await generatePDF(documentContent, `${sanitizedTitle}.pdf`, true);
            
            if (result === true || (typeof result === 'string' && result)) {
              toast({
                title: t("PDF Generated"),
                description: t("Your document has been generated as a PDF."),
              });
            } else {
              throw new Error("Legacy PDF generation failed");
            }
          } catch (legacyError) {
            console.error("Legacy PDF generation failed:", legacyError);
            
            // Final fallback to text format
            await exportAsText(documentContent, `${sanitizedTitle}.txt`);
            
            toast({
              title: t("PDF Generation Limited"),
              description: t("Your browser doesn't fully support PDF generation. Document was exported as text instead."),
              variant: "default",
            });
          }
        }
      } else if (format === 'docx' || format === 'rtf') {
        // For now, we'll fallback to text export for unsupported formats
        console.log(`Requested ${format} format not supported, using text fallback`);
        await exportAsText(documentContent, `${sanitizedTitle}.txt`);
        
        toast({
          title: t("Format Coming Soon"),
          description: t(`The ${format.toUpperCase()} format will be available in a future update. Your document was exported as a text file instead.`),
          variant: "default",
        });
      }
    } catch (error) {
      // Log detailed error for debugging
      console.error("Document export error:", error);
      
      // Show appropriate error message to user
      toast({
        title: t("Export Failed"),
        description: error instanceof Error 
          ? t(`Export error: ${error.message}`) 
          : t("There was an error exporting your document. Please try again."),
        variant: "destructive",
      });
      
      // Try basic text export as a fallback for any export failure
      try {
        if (format !== 'txt') {
          console.log("Attempting text export as fallback after failure");
          await exportAsText(documentContent, `${documentTitle.replace(/[^a-zA-Z0-9_\-\.]/g, "_")}_fallback.txt`);
          
          toast({
            title: t("Fallback Export Completed"),
            description: t("We exported your document as a text file instead."),
            variant: "default",
          });
        }
      } catch (fallbackError) {
        console.error("Even fallback text export failed:", fallbackError);
      }
    } finally {
      // Clear the loading toast by showing a new one that immediately disappears
      toast({
        title: "",
        description: "",
        duration: 1
      });
      
      setIsExporting(false);
    }
  };
  
  const handlePrint = async () => {
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
      
      console.log(`Preparing to print document: "${documentTitle}" (${documentContent.length} chars)`);
      
      // Process printing with a small delay to ensure toast is shown first
      setTimeout(async () => {
        try {
          // Use the enhanced print function which now returns a promise
          await printDocument(documentContent, documentTitle);
          
          // Success message
          toast({
            title: t("Print Initiated"),
            description: t("The print dialog has been opened."),
          });
          
        } catch (printError) {
          console.error("Error during print process:", printError);
          
          toast({
            title: t("Print Failed"),
            description: printError instanceof Error 
              ? t(`Print error: ${printError.message}`) 
              : t("There was an error printing your document. Please try again."),
            variant: "destructive",
          });
        } finally {
          // Clear the loading toast by showing a new one that immediately disappears
          toast({
            title: "",
            description: "",
            duration: 1
          });
        }
      }, 500);
    } catch (error) {
      console.error("Error initializing print process:", error);
      
      toast({
        title: t("Print Failed"),
        description: error instanceof Error 
          ? t(`Print error: ${error.message}`) 
          : t("There was an error preparing your document for printing. Please try again."),
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