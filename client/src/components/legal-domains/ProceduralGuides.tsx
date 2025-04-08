import React from "react";
import { useProceduralGuides } from "@/hooks/use-procedural-guides";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Timeline, TimelineItem, TimelineConnector, TimelineContent, TimelineIcon } from "@/components/ui/timeline";
import { CheckCircle, Clock, FileText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProceduralGuide } from "@shared/schema";

interface ProceduralGuidesProps {
  domainId: number;
}

interface GuideStep {
  title: string;
  description: string;
}

export default function ProceduralGuides({ domainId }: ProceduralGuidesProps) {
  const { data: guides, isLoading, error } = useProceduralGuides(domainId);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load procedural guides: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!guides || guides.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No guides available</h3>
        <p className="text-muted-foreground">
          There are no procedural guides available for this legal domain yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Procedural Guides</h2>
      
      {guides.map((guide: ProceduralGuide) => (
        <Card key={guide.id} className="border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{guide.title}</CardTitle>
            <CardDescription>{guide.description}</CardDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {guide.estimatedTime}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {guide.jurisdiction}
              </Badge>
              <Badge variant="secondary" className="uppercase text-xs">
                {guide.language === 'en' ? 'English' : 'Français'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {guide.prerequisites && Array.isArray(guide.prerequisites) && guide.prerequisites.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Prerequisites</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {guide.prerequisites.map((prerequisite: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {prerequisite}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="steps">
                <AccordionTrigger>View Step-by-Step Guide</AccordionTrigger>
                <AccordionContent>
                  <Timeline>
                    {Array.isArray(guide.steps) && guide.steps.map((step: GuideStep, index: number) => (
                      <TimelineItem key={index}>
                        {index < guide.steps.length - 1 && <TimelineConnector />}
                        <TimelineIcon icon={CheckCircle} />
                        <TimelineContent>
                          <h4 className="font-medium text-base">{step.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </p>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}