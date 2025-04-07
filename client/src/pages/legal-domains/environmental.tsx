import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function EnvironmentalLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("environmental law");

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
          Environmental Law
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
      title="Environmental Law"
      description="Environmental law regulates human impact on the natural environment. Our templates help with environmental compliance, impact assessments, and documentation related to Canadian environmental regulations and sustainability requirements."
      templateTypes={["environmental"]}
      relatedDomains={[
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Indigenous Law", path: "/legal-domains/indigenous-law" },
        { name: "Administrative", path: "/legal-domains/administrative" }
      ]}
      resources={[
        {
          title: "Environment and Climate Change Canada",
          description: "Federal environmental regulations, compliance requirements, and sustainability initiatives.",
          link: "https://www.canada.ca/en/environment-climate-change.html"
        },
        {
          title: "Canadian Environmental Assessment Agency",
          description: "Information on environmental assessments, reviews, and impact studies requirements.",
          link: "https://www.canada.ca/en/impact-assessment-agency.html"
        },
        {
          title: "Environmental Law Centre",
          description: "Resources on environmental rights, regulations, and compliance across Canadian jurisdictions.",
          link: "https://www.cela.ca/"
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
      title="Environmental Law"
      description="Environmental law regulates human impact on the natural environment. Our templates help with environmental compliance, impact assessments, and documentation related to Canadian environmental regulations and sustainability requirements."
      templateTypes={["environmental"]}
      relatedDomains={[
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Indigenous Law", path: "/legal-domains/indigenous-law" },
        { name: "Administrative", path: "/legal-domains/administrative" }
      ]}
      resources={[
        {
          title: "Environment and Climate Change Canada",
          description: "Federal environmental regulations, compliance requirements, and sustainability initiatives.",
          link: "https://www.canada.ca/en/environment-climate-change.html"
        },
        {
          title: "Canadian Environmental Assessment Agency",
          description: "Information on environmental assessments, reviews, and impact studies requirements.",
          link: "https://www.canada.ca/en/impact-assessment-agency.html"
        },
        {
          title: "Environmental Law Centre",
          description: "Resources on environmental rights, regulations, and compliance across Canadian jurisdictions.",
          link: "https://www.cela.ca/"
        }
      ]}
    />
  
    </div>
  );
}

export default EnvironmentalLawPage;