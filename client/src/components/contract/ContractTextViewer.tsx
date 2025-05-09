import React, { useState, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContractTextViewerProps {
  text: string;
  title?: string;
  maxHeight?: string;
  className?: string;
  extractionInfo?: {
    success?: boolean;
    pageCount?: number;
    extractedPageCount?: number;
    errorPages?: number[];
    usedFallbackMethod?: boolean;
    truncated?: boolean;
    extractionMethod?: string;
  };
}

const ContractTextViewer: React.FC<ContractTextViewerProps> = ({ 
  text, 
  title = "Contract Text",
  maxHeight = "400px",
  className = "",
  extractionInfo
}) => {
  // Split text into pages based on "Page X:" markers
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  
  // Parse the text into pages on component mount or when text changes
  useEffect(() => {
    if (!text) {
      setPages(["No text available"]);
      setTotalPages(1);
      return;
    }
    
    // Check if the text has page markers
    const hasPageMarkers = /Page \d+:/i.test(text);
    
    if (hasPageMarkers) {
      // Split by page markers
      const pageRegex = /Page \d+:/gi;
      const pageMatches = text.match(pageRegex) || [];
      
      if (pageMatches.length > 0) {
        // Use the page markers to split the text
        const splitPages: string[] = [];
        let lastIndex = 0;
        
        // Find all page marker positions
        const markerPositions: { index: number, marker: string }[] = [];
        let match;
        const re = new RegExp(pageRegex);
        while ((match = re.exec(text)) !== null) {
          markerPositions.push({ index: match.index, marker: match[0] });
        }
        
        // Split text based on marker positions
        for (let i = 0; i < markerPositions.length; i++) {
          const currentMarker = markerPositions[i];
          const nextMarkerIndex = i + 1 < markerPositions.length 
            ? markerPositions[i + 1].index 
            : text.length;
          
          // Extract page content including the marker
          const pageContent = text.substring(currentMarker.index, nextMarkerIndex);
          splitPages.push(pageContent);
          lastIndex = nextMarkerIndex;
        }
        
        // If there's content before the first page marker, add it as page 0
        if (markerPositions[0]?.index > 0) {
          const prelimContent = text.substring(0, markerPositions[0].index);
          if (prelimContent.trim()) {
            splitPages.unshift("Preliminary Content:\n" + prelimContent);
          }
        }
        
        setPages(splitPages);
        setTotalPages(splitPages.length);
      } else {
        // Fallback if no matches (shouldn't happen given the earlier test)
        setPages([text]);
        setTotalPages(1);
      }
    } else {
      // If no page markers, split by character count for readability
      const charsPerPage = 3000; // Approximately 500 words
      const splitPages = [];
      
      // Split long text into readable chunks
      for (let i = 0; i < text.length; i += charsPerPage) {
        splitPages.push(text.substring(i, i + charsPerPage));
      }
      
      // Ensure we have at least one page even for empty text
      if (splitPages.length === 0) {
        splitPages.push(text);
      }
      
      setPages(splitPages);
      setTotalPages(splitPages.length);
    }
  }, [text]);
  
  // Search functionality
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results: number[] = [];
    const term = searchTerm.toLowerCase();
    
    // Find pages containing the search term
    pages.forEach((page, index) => {
      if (page.toLowerCase().includes(term)) {
        results.push(index + 1); // Store 1-based page numbers
      }
    });
    
    setSearchResults(results);
    if (results.length > 0) {
      setCurrentPage(results[0]);
      setCurrentSearchIndex(0);
    }
  };
  
  const navigateToNextSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    setCurrentPage(searchResults[nextIndex]);
  };
  
  // Calculate which page links to show
  const getPageLinks = () => {
    const pageLinks = [];
    const maxVisiblePages = 7; // Show at most 7 page numbers
    
    // Always show first and last page
    const showFirst = currentPage > 2;
    const showLast = currentPage < totalPages - 1;
    
    // Show ellipsis if needed
    const showStartEllipsis = currentPage > 3;
    const showEndEllipsis = currentPage < totalPages - 2;
    
    // Calculate range of visible page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Show first page if needed
    if (showFirst && startPage > 1) {
      pageLinks.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show start ellipsis if needed
    if (showStartEllipsis && startPage > 2) {
      pageLinks.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageLinks.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show end ellipsis if needed
    if (showEndEllipsis && endPage < totalPages - 1) {
      pageLinks.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show last page if needed
    if (showLast && endPage < totalPages) {
      pageLinks.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pageLinks;
  };
  
  // Render extraction info badges
  const renderExtractionInfo = () => {
    if (!extractionInfo) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-1 mb-3">
        {extractionInfo.extractionMethod && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs font-normal">
                  <Info className="h-3 w-3 mr-1" />
                  {extractionInfo.extractionMethod === 'pdf.js' ? 'Standard extraction' : 'Alternative extraction'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {extractionInfo.extractionMethod === 'pdf.js' 
                  ? 'Extracted using standard PDF library' 
                  : 'Used alternative extraction method due to PDF structure'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {extractionInfo.usedFallbackMethod && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs font-normal bg-amber-50">
                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                  Fallback method used
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Primary extraction failed, using alternative method with potentially less accuracy
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {extractionInfo.truncated && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs font-normal bg-amber-50">
                  <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                  Content truncated
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Document was too large and text was truncated
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {extractionInfo.pageCount && extractionInfo.extractedPageCount && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs font-normal">
                  <Info className="h-3 w-3 mr-1" />
                  {extractionInfo.extractedPageCount}/{extractionInfo.pageCount} pages
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Successfully extracted text from {extractionInfo.extractedPageCount} out of {extractionInfo.pageCount} pages
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {extractionInfo.errorPages && extractionInfo.errorPages.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs font-normal bg-amber-50">
                  <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                  {extractionInfo.errorPages.length} problematic pages
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {extractionInfo.errorPages.length} pages had extraction issues (might be images or scanned content)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };
  
  // Current page content
  const currentPageContent = pages[currentPage - 1] || "No content available for this page";
  const isSearchMode = searchResults.length > 0;
  
  // Warning messages for extraction issues
  const renderWarnings = () => {
    if (!extractionInfo) return null;
    
    // Serious extraction problems
    if (extractionInfo.success === false || (extractionInfo.pageCount && extractionInfo.extractedPageCount === 0)) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Extraction Issues</AlertTitle>
          <AlertDescription>
            We couldn't properly extract text from this document. It may be scanned, encrypted, or contain only images.
            Consider using OCR software to convert it to searchable text first.
          </AlertDescription>
        </Alert>
      );
    }
    
    // Partial extraction problems
    if (extractionInfo.errorPages && extractionInfo.errorPages.length > 0 && extractionInfo.pageCount &&
        extractionInfo.errorPages.length > extractionInfo.pageCount / 3) {
      return (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Partial Extraction</AlertTitle>
          <AlertDescription>
            {extractionInfo.errorPages.length} out of {extractionInfo.pageCount} pages had extraction issues.
            Some pages may be images or scanned content without OCR.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <div className="relative text-sm">
              <input
                type="text"
                placeholder={t("Search contract...")}
                className="px-3 py-1 border rounded-md text-sm w-40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
            {isSearchMode && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-gray-600">
                  {currentSearchIndex + 1}/{searchResults.length}
                </span>
                <button
                  onClick={navigateToNextSearchResult}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Next result"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </CardTitle>
        {renderExtractionInfo()}
      </CardHeader>
      <CardContent>
        {renderWarnings()}
        
        <div 
          className="whitespace-pre-wrap font-mono text-sm border p-4 rounded-md overflow-auto bg-gray-50"
          style={{ maxHeight }}
        >
          {/* Highlight search term if in search mode */}
          {isSearchMode && searchTerm ? (
            <div dangerouslySetInnerHTML={{
              __html: currentPageContent.replace(
                new RegExp(searchTerm, 'gi'),
                (match) => `<mark class="bg-yellow-200 px-1 rounded">${match}</mark>`
              )
            }} />
          ) : (
            currentPageContent
          )}
        </div>
        
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {getPageLinks()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        
        {isSearchMode && searchResults.length === 0 && (
          <div className="mt-4 text-center text-gray-500 text-sm">
            No results found for "{searchTerm}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractTextViewer;