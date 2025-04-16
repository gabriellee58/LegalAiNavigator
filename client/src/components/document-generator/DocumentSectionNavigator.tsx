import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Section {
  id: string;
  title: string;
  level: number;
}

interface DocumentSectionNavigatorProps {
  documentContent: string;
}

/**
 * Extracts section headers from a Markdown document
 * Supports # to ##### heading levels
 */
function extractSections(markdownText: string): Section[] {
  if (!markdownText) return [];
  
  // Match all headers (# Header, ## Subheader, etc.)
  const headerRegex = /^(#{1,5})\s+(.+)$/gm;
  const sections: Section[] = [];
  let match;
  let index = 0;

  while ((match = headerRegex.exec(markdownText)) !== null) {
    const level = match[1].length; // Number of # symbols
    const title = match[2].trim();
    const id = `section-${index++}`;
    
    sections.push({
      id,
      title,
      level
    });
  }

  return sections;
}

export default function DocumentSectionNavigator({ documentContent }: DocumentSectionNavigatorProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (documentContent) {
      const extractedSections = extractSections(documentContent);
      setSections(extractedSections);
    }
  }, [documentContent]);

  // Function to scroll to a specific section in the document
  const scrollToSection = (sectionTitle: string) => {
    // Search for the section heading in the document display area
    const contentArea = document.getElementById('document-content');
    if (!contentArea) return;
    
    // Create a text node to search for
    const searchText = new RegExp(`^#{1,5}\\s+${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm');
    const textContent = contentArea.textContent || '';
    const match = textContent.match(searchText);
    
    if (match) {
      const textBefore = textContent.substring(0, match.index);
      const linesBefore = textBefore.split('\n').length;
      
      // Approximate line height (adjust as needed based on styling)
      const lineHeight = 24; // px
      
      // Scroll to approximate position
      const scrollPos = linesBefore * lineHeight;
      contentArea.parentElement?.scrollTo({
        top: scrollPos - 50, // Adjust to position the heading with some space above
        behavior: 'smooth'
      });
      
      setActiveSection(sectionTitle);
    }
  };

  // If no sections found, provide a message
  if (sections.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2">
        No document sections detected.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[60vh]">
      <div className="space-y-1 p-1">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.title ? "secondary" : "ghost"}
            className={`w-full justify-start text-left font-normal px-2 py-1 h-auto`}
            style={{ 
              paddingLeft: `${(section.level - 1) * 12 + 8}px`,
              minHeight: "unset"
            }}
            onClick={() => scrollToSection(section.title)}
          >
            <span className="truncate text-sm">
              {section.title}
            </span>
            {section.level === 1 && (
              <Badge variant="outline" className="ml-2 text-xs">Main</Badge>
            )}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}