import { useLegalDomain, useDomainKnowledge, useProceduralGuides, useLegalSubdomains } from '@/hooks/use-legal-domains';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { InfoIcon, BookOpen, FileText, ArrowLeft, FolderTree, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';

interface DomainDetailProps {
  domainId: number;
}

export function DomainDetail({ domainId }: DomainDetailProps) {
  console.log(`DomainDetail received domainId: ${domainId}`);
  
  const { data: domain, isLoading: isLoadingDomain, error: domainError } = useLegalDomain(domainId);
  const { data: knowledge, isLoading: isLoadingKnowledge, error: knowledgeError } = useDomainKnowledge(domainId);
  const { data: guides, isLoading: isLoadingGuides, error: guidesError } = useProceduralGuides(domainId);
  const { data: subdomains, isLoading: isLoadingSubdomains, error: subdomainsError } = useLegalSubdomains(domainId);

  if (isLoadingDomain) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (domainError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Domain</AlertTitle>
        <AlertDescription>
          There was a problem loading this legal domain. Please try again later or contact support.
        </AlertDescription>
      </Alert>
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
        <Tabs defaultValue="subdomains">
          <TabsList className="mb-4">
            <TabsTrigger value="subdomains">
              <FolderTree className="h-4 w-4 mr-2" />
              Subdomains
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <BookOpen className="h-4 w-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="guides">
              <FileText className="h-4 w-4 mr-2" />
              Procedural Guides
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="subdomains">
            <DomainSubcategories subdomains={subdomains} isLoading={isLoadingSubdomains} error={subdomainsError} />
          </TabsContent>
          
          <TabsContent value="knowledge">
            <DomainKnowledge knowledge={knowledge} isLoading={isLoadingKnowledge} error={knowledgeError} />
          </TabsContent>
          
          <TabsContent value="guides">
            <ProceduralGuides guides={guides} isLoading={isLoadingGuides} error={guidesError} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DomainSubcategories({ subdomains, isLoading, error }: { subdomains: any; isLoading: boolean; error: any }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Subdomains</AlertTitle>
        <AlertDescription>
          There was a problem loading subdomains. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!subdomains || subdomains.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>No Subdomains Available</AlertTitle>
        <AlertDescription>
          There are no subcategories defined for this legal domain yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {subdomains.map((subdomain: any) => (
        <Card key={subdomain.id} className="hover:border-primary transition-colors overflow-hidden">
          {/* Display subcategory details without linking since we don't have specific pages for them */}
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{subdomain.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{subdomain.description}</p>
            <Badge variant="outline" className="text-primary bg-primary/10">
              {subdomain.name}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DomainKnowledge({ knowledge, isLoading, error }: { knowledge: any; isLoading: boolean; error: any }) {
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Knowledge Base</AlertTitle>
        <AlertDescription>
          There was a problem loading the knowledge base. Please try again later.
        </AlertDescription>
      </Alert>
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

function ProceduralGuides({ guides, isLoading, error }: { guides: any; isLoading: boolean; error: any }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Procedural Guides</AlertTitle>
        <AlertDescription>
          There was a problem loading the procedural guides. Please try again later.
        </AlertDescription>
      </Alert>
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