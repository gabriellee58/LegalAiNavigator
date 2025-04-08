import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function IndigenousLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("Indigenous Law");

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
          Indigenous Law
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
      title="Indigenous Law"
      description="Indigenous law encompasses the unique legal rights, traditions, and governance of First Nations, Métis, and Inuit peoples in Canada. Our templates help with issues related to Aboriginal rights, treaty claims, and Indigenous legal matters under Canadian law."
      templateTypes={["indigenous", "aboriginal"]}
      relatedDomains={[
        { name: "Constitutional", path: "/legal-domains/constitutional" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Environmental", path: "/legal-domains/environmental" },
        { name: "Land Claims", path: "/legal-domains/land-claims" }
      ]}
      resources={[
        {
          title: "Indigenous Services Canada",
          description: "Federal resource for Indigenous communities with information on legal services, rights, and programs.",
          link: "https://www.canada.ca/en/indigenous-services-canada.html"
        },
        {
          title: "Aboriginal Law Centre",
          description: "Research and resources on Indigenous legal systems, rights, and reconciliation initiatives.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/index.html"
        },
        {
          title: "Indigenous Justice Programs",
          description: "Community-based justice programs designed to reflect Indigenous legal traditions and approaches.",
          link: "https://www.justice.gc.ca/eng/fund-fina/acf-fca/ajs-sja/index.html"
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
      title="Indigenous Law"
      description="Indigenous law encompasses the unique legal rights, traditions, and governance of First Nations, Métis, and Inuit peoples in Canada. Our templates help with issues related to Aboriginal rights, treaty claims, and Indigenous legal matters under Canadian law."
      templateTypes={["indigenous", "aboriginal"]}
      relatedDomains={[
        { name: "Constitutional", path: "/legal-domains/constitutional" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Environmental", path: "/legal-domains/environmental" },
        { name: "Land Claims", path: "/legal-domains/land-claims" }
      ]}
      resources={[
        {
          title: "Indigenous Services Canada",
          description: "Federal resource for Indigenous communities with information on legal services, rights, and programs.",
          link: "https://www.canada.ca/en/indigenous-services-canada.html"
        },
        {
          title: "Aboriginal Law Centre",
          description: "Research and resources on Indigenous legal systems, rights, and reconciliation initiatives.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/index.html"
        },
        {
          title: "Indigenous Justice Programs",
          description: "Community-based justice programs designed to reflect Indigenous legal traditions and approaches.",
          link: "https://www.justice.gc.ca/eng/fund-fina/acf-fca/ajs-sja/index.html"
        }
      ]}
    />
  
    </div>
  );
}

export default IndigenousLawPage;