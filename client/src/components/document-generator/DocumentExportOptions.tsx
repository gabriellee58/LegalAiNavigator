import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { exportAsText, printDocument, generatePDF } from "@/lib/documentExport";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, FileText, Printer, Download, FileDown } from "lucide-react";

interface DocumentExportOptionsProps {
  documentContent: string;
  documentTitle: string;
}

const DocumentExportOptions: React.FC<DocumentExportOptionsProps> = ({
  documentContent,
  documentTitle,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async (format: 'txt' | 'pdf') => {
    if (!documentContent) {
      toast({
        title: "No document to export",
        description: "Please generate a document first.",
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
          title: "Document Exported",
          description: "Your document has been exported as a text file.",
        });
      } else if (format === 'pdf') {
        const result = await generatePDF(documentContent, `${sanitizedTitle}.pdf`);
        if (result) {
          toast({
            title: "PDF Generation",
            description: "Please select 'Save as PDF' in the print dialog to save your document.",
          });
        } else {
          toast({
            title: "PDF Generation Limited",
            description: "Your browser doesn't fully support PDF generation. Document was exported as text instead.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error exporting document:", error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "There was an error exporting your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handlePrint = () => {
    if (!documentContent) {
      toast({
        title: "No document to print",
        description: "Please generate a document first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Show "preparing to print" message
      toast({
        title: "Preparing document for printing",
        description: "The print dialog will open momentarily..."
      });
      
      // Small delay to allow the toast to display before print dialog opens
      setTimeout(() => {
        printDocument(documentContent, documentTitle);
      }, 500);
    } catch (error) {
      console.error("Error printing document:", error);
      toast({
        title: "Print Failed",
        description: error instanceof Error ? error.message : "There was an error printing your document. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex space-x-2" data-document-export>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('txt')} disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Text File (.txt)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
            <FileDown className="mr-2 h-4 w-4" />
            <span>PDF Document (.pdf)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button variant="outline" onClick={handlePrint} className="space-x-2">
        <Printer className="h-4 w-4" />
        <span>Print</span>
      </Button>
    </div>
  );
};

export default DocumentExportOptions;