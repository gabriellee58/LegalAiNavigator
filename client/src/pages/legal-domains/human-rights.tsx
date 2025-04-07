import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function HumanRightsPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("human rights law");

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
          Human Rights
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
      title="Human Rights"
      description="Human rights law protects fundamental rights and freedoms of individuals. Our templates help with human rights complaints, accommodation requests, and documentation related to Canadian human rights legislation at federal and provincial levels."
      templateTypes={["human-rights", "discrimination"]}
      relatedDomains={[
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Immigration", path: "/legal-domains/immigration" },
        { name: "Administrative", path: "/legal-domains/administrative" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Human Rights Commission",
          description: "Federal agency responsible for applying the Canadian Human Rights Act with resources on discrimination and complaint procedures.",
          link: "https://www.chrc-ccdp.gc.ca/en"
        },
        {
          title: "Provincial Human Rights Commissions",
          description: "Provincial and territorial human rights agencies that handle complaints within their jurisdictions.",
          link: "https://www.chrc-ccdp.gc.ca/en/complaints/provincial-territorial-human-rights-agencies"
        },
        {
          title: "Human Rights Legal Support Centre",
          description: "Resources for legal help with human rights applications and hearings across Canada.",
          link: "http://www.hrlsc.on.ca/"
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
      title="Human Rights"
      description="Human rights law protects fundamental rights and freedoms of individuals. Our templates help with human rights complaints, accommodation requests, and documentation related to Canadian human rights legislation at federal and provincial levels."
      templateTypes={["human-rights", "discrimination"]}
      relatedDomains={[
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Immigration", path: "/legal-domains/immigration" },
        { name: "Administrative", path: "/legal-domains/administrative" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Human Rights Commission",
          description: "Federal agency responsible for applying the Canadian Human Rights Act with resources on discrimination and complaint procedures.",
          link: "https://www.chrc-ccdp.gc.ca/en"
        },
        {
          title: "Provincial Human Rights Commissions",
          description: "Provincial and territorial human rights agencies that handle complaints within their jurisdictions.",
          link: "https://www.chrc-ccdp.gc.ca/en/complaints/provincial-territorial-human-rights-agencies"
        },
        {
          title: "Human Rights Legal Support Centre",
          description: "Resources for legal help with human rights applications and hearings across Canada.",
          link: "http://www.hrlsc.on.ca/"
        }
      ]}
    />
  
    </div>
  );
}

export default HumanRightsPage;