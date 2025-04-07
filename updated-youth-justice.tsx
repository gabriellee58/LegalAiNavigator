import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function YouthJusticePage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("youth justice law");

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="container py-6">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-5 w-2/3 mb-10" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // If we have domain data from the database, show the domain detail component
  if (domainId) {
    return (
      <div className="container py-6 max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-transparent bg-clip-text">
          Youth Justice
        </h1>
        
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Domain Details</TabsTrigger>
            <TabsTrigger value="templates">Templates & Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <DomainDetail domainId={domainId} />
          </TabsContent>
          
          <TabsContent value="templates">
            
    <LegalDomainPage
      title="Youth Justice"
      description="Youth justice law governs the legal system for young persons accused of crimes in Canada. Our templates help with understanding youth criminal procedures, rights, and documentation related to the Youth Criminal Justice Act."
      templateTypes={["youth", "juvenile"]}
      relatedDomains={[
        { name: "Criminal", path: "/legal-domains/criminal" },
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Administrative", path: "/legal-domains/administrative" }
      ]}
      resources={[
        {
          title: "Department of Justice - Youth Justice",
          description: "Federal information on the Youth Criminal Justice Act, procedures, and protections for young persons.",
          link: "https://www.justice.gc.ca/eng/cj-jp/yj-jj/index.html"
        },
        {
          title: "Youth Criminal Justice Act",
          description: "Full text and explanatory materials on Canada's youth justice legislation.",
          link: "https://laws-lois.justice.gc.ca/eng/acts/y-1.5/"
        },
        {
          title: "Provincial Youth Justice Programs",
          description: "Resources on provincial youth justice services, alternatives to court, and rehabilitation programs.",
          link: "https://www.justice.gc.ca/eng/cj-jp/yj-jj/tools-outils/sheets-feuillets/index.html"
        }
      ]}
    />
  
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // If no domain data is found, fall back to the static template
  return (
    <div className="container py-6">
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          This domain hasn't been fully integrated with our knowledge base yet. 
          You can still access templates and resources below.
        </AlertDescription>
      </Alert>
      
      
    <LegalDomainPage
      title="Youth Justice"
      description="Youth justice law governs the legal system for young persons accused of crimes in Canada. Our templates help with understanding youth criminal procedures, rights, and documentation related to the Youth Criminal Justice Act."
      templateTypes={["youth", "juvenile"]}
      relatedDomains={[
        { name: "Criminal", path: "/legal-domains/criminal" },
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Administrative", path: "/legal-domains/administrative" }
      ]}
      resources={[
        {
          title: "Department of Justice - Youth Justice",
          description: "Federal information on the Youth Criminal Justice Act, procedures, and protections for young persons.",
          link: "https://www.justice.gc.ca/eng/cj-jp/yj-jj/index.html"
        },
        {
          title: "Youth Criminal Justice Act",
          description: "Full text and explanatory materials on Canada's youth justice legislation.",
          link: "https://laws-lois.justice.gc.ca/eng/acts/y-1.5/"
        },
        {
          title: "Provincial Youth Justice Programs",
          description: "Resources on provincial youth justice services, alternatives to court, and rehabilitation programs.",
          link: "https://www.justice.gc.ca/eng/cj-jp/yj-jj/tools-outils/sheets-feuillets/index.html"
        }
      ]}
    />
  
    </div>
  );
}

export default YouthJusticePage;