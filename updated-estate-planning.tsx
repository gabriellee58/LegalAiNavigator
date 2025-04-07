import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function EstatePlanningPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("estate planning law");

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
          Estate Planning
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
      title="Estate Planning"
      description="Estate planning involves preparing for the transfer of a person's assets after death. Our templates help with wills, trusts, powers of attorney, and other documents essential for Canadian estate management."
      templateTypes={["estate", "will"]}
      relatedDomains={[
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Tax", path: "/legal-domains/tax" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Business", path: "/legal-domains/business" }
      ]}
      resources={[
        {
          title: "Canadian Estate Planning Guide",
          description: "Comprehensive information on wills, probate process, and estate administration across provinces.",
          link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/life-events/what-when-someone-died.html"
        },
        {
          title: "Power of Attorney Information",
          description: "Provincial guides on creating and using powers of attorney for property and personal care.",
          link: "https://www.justice.gc.ca/eng/fl-df/index.html"
        },
        {
          title: "Estate Tax Planning",
          description: "Resources on minimizing tax implications for estates and beneficiaries in Canada.",
          link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/life-events/what-when-someone-died/final-return.html"
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
      title="Estate Planning"
      description="Estate planning involves preparing for the transfer of a person's assets after death. Our templates help with wills, trusts, powers of attorney, and other documents essential for Canadian estate management."
      templateTypes={["estate", "will"]}
      relatedDomains={[
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Tax", path: "/legal-domains/tax" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Business", path: "/legal-domains/business" }
      ]}
      resources={[
        {
          title: "Canadian Estate Planning Guide",
          description: "Comprehensive information on wills, probate process, and estate administration across provinces.",
          link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/life-events/what-when-someone-died.html"
        },
        {
          title: "Power of Attorney Information",
          description: "Provincial guides on creating and using powers of attorney for property and personal care.",
          link: "https://www.justice.gc.ca/eng/fl-df/index.html"
        },
        {
          title: "Estate Tax Planning",
          description: "Resources on minimizing tax implications for estates and beneficiaries in Canada.",
          link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/life-events/what-when-someone-died/final-return.html"
        }
      ]}
    />
  
    </div>
  );
}

export default EstatePlanningPage;