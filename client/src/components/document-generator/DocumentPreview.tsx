
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentPreviewProps {
  content: string;
  showSignatureFields?: boolean;
}

export default function DocumentPreview({ content, showSignatureFields }: DocumentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showSignatureFields && containerRef.current) {
      const addSignatureField = (text: string) => {
        const regex = new RegExp(`\\[${text}\\]`, 'g');
        const element = containerRef.current;
        if (!element) return;

        element.innerHTML = element.innerHTML.replace(regex, 
          `<div class="inline-block border-2 border-dashed border-primary px-4 py-2 mx-1 rounded">
            ${text}
          </div>`
        );
      };

      // Add signature fields for common signature markers
      ['SIGNATURE', 'SIGN_HERE', 'SIGN'].forEach(addSignatureField);
    }
  }, [content, showSignatureFields]);

  return (
    <Card>
      <CardContent className="p-6">
        <div 
          ref={containerRef}
          className="prose max-w-none dark:prose-invert whitespace-pre-wrap"
        >
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
