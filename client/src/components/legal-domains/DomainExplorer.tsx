import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, Folder, File, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useLegalDomains, useLegalSubdomains } from '@/hooks/use-legal-domains';
import { Skeleton } from '@/components/ui/skeleton';

export function DomainExplorer() {
  const { data: domains, isLoading } = useLegalDomains();
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  const handleDomainClick = (domainId: number) => {
    setSelectedDomain(domainId);
    setLocation(`/legal-domains/${domainId}`);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Legal Domains</CardTitle>
          <CardDescription>Exploring Canadian legal categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Legal Domains</CardTitle>
        <CardDescription>Explore specialized Canadian legal areas</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {domains?.map((domain) => (
            <AccordionItem key={domain.id} value={domain.id.toString()}>
              <AccordionTrigger className="hover:bg-primary/5 px-3 rounded-md">
                <div className="flex items-center text-left">
                  <Folder className="h-5 w-5 mr-2 text-primary/70" />
                  <span>{domain.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <DomainChildren parentId={domain.id} onSelect={handleDomainClick} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

interface DomainChildrenProps {
  parentId: number;
  onSelect: (id: number) => void;
}

function DomainChildren({ parentId, onSelect }: DomainChildrenProps) {
  const { data: subdomains, isLoading } = useLegalSubdomains(parentId);

  if (isLoading) {
    return <div className="pl-6 py-2"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }

  if (!subdomains?.length) {
    return <div className="pl-6 py-2 text-sm text-muted-foreground">No subdomains available</div>;
  }

  return (
    <div className="pl-6 space-y-1">
      {subdomains.map((subdomain) => (
        <Button
          key={subdomain.id}
          variant="ghost" 
          className="w-full justify-start text-left h-auto py-2"
          onClick={() => onSelect(subdomain.id)}
        >
          <File className="h-4 w-4 mr-2 text-primary/70" />
          <span>{subdomain.name}</span>
          <ChevronRight className="h-4 w-4 ml-auto" />
        </Button>
      ))}
    </div>
  );
}