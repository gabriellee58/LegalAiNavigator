import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function InsuranceLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("insurance law");

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
          Insurance Law
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
      title="Insurance Law"
      description="Insurance law governs the relationship between insurers and policyholders. Our templates help with insurance claims, policy reviews, and dispute resolution processes under Canadian insurance regulations."
      templateTypes={["insurance"]}
      relatedDomains={[
        { name: "Personal Injury", path: "/legal-domains/personal-injury" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Consumer Rights", path: "/legal-domains/consumer-rights" }
      ]}
      resources={[
        {
          title: "Financial Consumer Agency of Canada - Insurance",
          description: "Federal information on insurance products, consumer rights, and complaint procedures.",
          link: "https://www.canada.ca/en/financial-consumer-agency/services/insurance.html"
        },
        {
          title: "Provincial Insurance Regulators",
          description: "Provincial authorities that oversee insurance companies and handle consumer concerns.",
          link: "https://www.canada.ca/en/financial-consumer-agency/services/insurance/regulators.html"
        },
        {
          title: "Insurance Bureau of Canada",
          description: "Industry association with consumer information on insurance policies, claims, and best practices.",
          link: "http://www.ibc.ca/"
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
      title="Insurance Law"
      description="Insurance law governs the relationship between insurers and policyholders. Our templates help with insurance claims, policy reviews, and dispute resolution processes under Canadian insurance regulations."
      templateTypes={["insurance"]}
      relatedDomains={[
        { name: "Personal Injury", path: "/legal-domains/personal-injury" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Consumer Rights", path: "/legal-domains/consumer-rights" }
      ]}
      resources={[
        {
          title: "Financial Consumer Agency of Canada - Insurance",
          description: "Federal information on insurance products, consumer rights, and complaint procedures.",
          link: "https://www.canada.ca/en/financial-consumer-agency/services/insurance.html"
        },
        {
          title: "Provincial Insurance Regulators",
          description: "Provincial authorities that oversee insurance companies and handle consumer concerns.",
          link: "https://www.canada.ca/en/financial-consumer-agency/services/insurance/regulators.html"
        },
        {
          title: "Insurance Bureau of Canada",
          description: "Industry association with consumer information on insurance policies, claims, and best practices.",
          link: "http://www.ibc.ca/"
        }
      ]}
    />
  
    </div>
  );
}

export default InsuranceLawPage;