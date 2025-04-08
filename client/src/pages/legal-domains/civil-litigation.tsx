import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CivilLitigationPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("Civil Litigation Law");

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
          Civil Litigation
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
      title="Civil Litigation"
      description="Civil litigation involves disputes between individuals, businesses, or other entities where monetary damages or specific performance are sought rather than criminal sanctions. Our templates help with court filings, claims, and documents related to Canadian civil cases."
      templateTypes={["litigation", "civil"]}
      relatedDomains={[
        { name: "Personal Injury", path: "/legal-domains/personal-injury" },
        { name: "Consumer Rights", path: "/legal-domains/consumer-rights" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Family Law", path: "/legal-domains/family-law" }
      ]}
      resources={[
        {
          title: "Courts Administration Service",
          description: "Information on federal courts, procedures, forms, and filing requirements for civil cases.",
          link: "https://www.cas-satj.gc.ca/en/index.shtml"
        },
        {
          title: "Provincial Courts Civil Divisions",
          description: "Resources on provincial civil courts, small claims procedures, and local filing requirements.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/just/07.html"
        },
        {
          title: "Civil Procedure Rules",
          description: "Provincial rules governing civil litigation procedures, timelines, and requirements.",
          link: "https://www.justice.gc.ca/eng/rp-pr/csj-sjc/just/index.html"
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
      title="Civil Litigation"
      description="Civil litigation involves disputes between individuals, businesses, or other entities where monetary damages or specific performance are sought rather than criminal sanctions. Our templates help with court filings, claims, and documents related to Canadian civil cases."
      templateTypes={["litigation", "civil"]}
      relatedDomains={[
        { name: "Personal Injury", path: "/legal-domains/personal-injury" },
        { name: "Consumer Rights", path: "/legal-domains/consumer-rights" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Family Law", path: "/legal-domains/family-law" }
      ]}
      resources={[
        {
          title: "Courts Administration Service",
          description: "Information on federal courts, procedures, forms, and filing requirements for civil cases.",
          link: "https://www.cas-satj.gc.ca/en/index.shtml"
        },
        {
          title: "Provincial Courts Civil Divisions",
          description: "Resources on provincial civil courts, small claims procedures, and local filing requirements.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/just/07.html"
        },
        {
          title: "Civil Procedure Rules",
          description: "Provincial rules governing civil litigation procedures, timelines, and requirements.",
          link: "https://www.justice.gc.ca/eng/rp-pr/csj-sjc/just/index.html"
        }
      ]}
    />
  
    </div>
  );
}

export default CivilLitigationPage;