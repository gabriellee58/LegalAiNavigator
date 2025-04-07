import { useLegalDomain, useDomainKnowledge, useProceduralGuides } from '@/hooks/use-legal-domains';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { InfoIcon, BookOpen, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface DomainDetailProps {
  domainId: number;
}

export function DomainDetail({ domainId }: DomainDetailProps) {
  const { data: domain, isLoading: isLoadingDomain } = useLegalDomain(domainId);
  const { data: knowledge, isLoading: isLoadingKnowledge } = useDomainKnowledge(domainId);
  const { data: guides, isLoading: isLoadingGuides } = useProceduralGuides(domainId);

  if (isLoadingDomain) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!domain) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Domain not found. Please select a valid legal domain.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{domain.name}</CardTitle>
            <CardDescription>{domain.description}</CardDescription>
          </div>
          <Link href="/legal-domains">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Domains
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="knowledge">
          <TabsList className="mb-4">
            <TabsTrigger value="knowledge">
              <BookOpen className="h-4 w-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="guides">
              <FileText className="h-4 w-4 mr-2" />
              Procedural Guides
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="knowledge">
            <DomainKnowledge knowledge={knowledge} isLoading={isLoadingKnowledge} />
          </TabsContent>
          
          <TabsContent value="guides">
            <ProceduralGuides guides={guides} isLoading={isLoadingGuides} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DomainKnowledge({ knowledge, isLoading }: { knowledge: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!knowledge || knowledge.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>No Knowledge Base</AlertTitle>
        <AlertDescription>
          There is no specialized knowledge available for this legal domain yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {knowledge.map((item: any) => (
        <div key={item.id} className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">{item.question}</h3>
          <Separator className="my-2" />
          <p className="text-muted-foreground whitespace-pre-line">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}

function ProceduralGuides({ guides, isLoading }: { guides: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!guides || guides.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>No Procedural Guides</AlertTitle>
        <AlertDescription>
          There are no procedural guides available for this legal domain yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {guides.map((guide: any) => (
        <Card key={guide.id}>
          <CardHeader>
            <CardTitle>{guide.title}</CardTitle>
            <CardDescription>{guide.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              {guide.steps.map((step: any, index: number) => (
                <li key={index} className="pl-2">
                  <span className="font-medium">{step.title}</span>
                  {step.description && (
                    <p className="text-sm text-muted-foreground ml-6">{step.description}</p>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}