import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MediationPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("mediation law");

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
          Mediation & Dispute Resolution
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
      title="Mediation & Dispute Resolution"
      description="Mediation law covers alternative dispute resolution methods outside the court system. Our templates help with mediation agreements, settlement documents, and paperwork required for resolving conflicts through Canadian mediation and alternative dispute resolution processes."
      templateTypes={["mediation", "arbitration", "dispute-resolution"]}
      relatedDomains={[
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Business", path: "/legal-domains/business" }
      ]}
      resources={[
        {
          title: "ADR Institute of Canada",
          description: "National association for alternative dispute resolution with resources on mediation and arbitration standards.",
          link: "https://adric.ca/"
        },
        {
          title: "Department of Justice - Dispute Resolution",
          description: "Federal resources on alternative dispute resolution mechanisms, benefits, and processes.",
          link: "https://www.justice.gc.ca/eng/rp-pr/csj-sjc/dprs-sprd/index.html"
        },
        {
          title: "Provincial Mediation Services",
          description: "Information on provincial court-connected mediation programs, family mediation, and civil mediation services.",
          link: "https://www.justice.gc.ca/eng/fl-df/fjs-sjf/index.html"
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
      title="Mediation & Dispute Resolution"
      description="Mediation law covers alternative dispute resolution methods outside the court system. Our templates help with mediation agreements, settlement documents, and paperwork required for resolving conflicts through Canadian mediation and alternative dispute resolution processes."
      templateTypes={["mediation", "arbitration", "dispute-resolution"]}
      relatedDomains={[
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Business", path: "/legal-domains/business" }
      ]}
      resources={[
        {
          title: "ADR Institute of Canada",
          description: "National association for alternative dispute resolution with resources on mediation and arbitration standards.",
          link: "https://adric.ca/"
        },
        {
          title: "Department of Justice - Dispute Resolution",
          description: "Federal resources on alternative dispute resolution mechanisms, benefits, and processes.",
          link: "https://www.justice.gc.ca/eng/rp-pr/csj-sjc/dprs-sprd/index.html"
        },
        {
          title: "Provincial Mediation Services",
          description: "Information on provincial court-connected mediation programs, family mediation, and civil mediation services.",
          link: "https://www.justice.gc.ca/eng/fl-df/fjs-sjf/index.html"
        }
      ]}
    />
  
    </div>
  );
}

export default MediationPage;