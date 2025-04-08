import React, { useState } from 'react';
import { useProceduralGuides } from '@/hooks/use-procedural-guides';
import { TimelineCard } from '@/components/ui/timeline';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BookOpenCheck, Bookmark } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProceduralGuidesProps {
  domainId: number;
}

export default function ProceduralGuides({ domainId }: ProceduralGuidesProps) {
  const { t } = useTranslation();
  const { guides, isLoading, error } = useProceduralGuides(domainId);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  // When guides load, automatically select the first one
  React.useEffect(() => {
    if (guides?.length > 0 && !selectedGuideId) {
      setSelectedGuideId(guides[0].id.toString());
    }
  }, [guides, selectedGuideId]);

  const selectedGuide = selectedGuideId 
    ? guides?.find(guide => guide.id.toString() === selectedGuideId) 
    : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || 'Failed to load procedural guides'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!guides || guides.length === 0) {
    return (
      <Alert>
        <BookOpenCheck className="h-4 w-4" />
        <AlertTitle>No guides available</AlertTitle>
        <AlertDescription>
          There are currently no procedural guides available for this legal domain.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Procedural Guides</h2>
        <p className="text-muted-foreground mb-6">
          Step-by-step guides to help you navigate legal processes in this domain.
        </p>
        
        <div className="mb-6">
          <Select
            value={selectedGuideId || undefined}
            onValueChange={(value) => setSelectedGuideId(value)}
          >
            <SelectTrigger className="w-full sm:w-[350px]">
              <SelectValue placeholder="Select a procedural guide" />
            </SelectTrigger>
            <SelectContent>
              {guides.map((guide) => (
                <SelectItem key={guide.id} value={guide.id.toString()}>
                  {guide.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedGuide && (
        <TimelineCard
          title={selectedGuide.title}
          description={selectedGuide.description}
          steps={selectedGuide.steps.map((step: any) => ({
            title: step.title,
            description: step.description,
          }))}
          estimatedTime={selectedGuide.estimatedTime}
          prerequisites={selectedGuide.prerequisites}
          className="border border-muted"
        />
      )}

      <CardFooter className="flex justify-end p-0 pt-4">
        <Button variant="outline" size="sm" className="gap-2">
          <Bookmark className="h-4 w-4" />
          Save Guide
        </Button>
      </CardFooter>
    </div>
  );
}