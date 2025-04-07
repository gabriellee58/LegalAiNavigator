import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function PersonalInjuryLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("personal injury law");

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
          Personal Injury Law
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
      title="Personal Injury Law"
      description="Personal injury law covers cases where individuals have been physically or psychologically injured due to negligence or wrongdoing. Our templates help with accident reports, insurance claims, and other documents related to personal injury matters in Canada."
      templateTypes={["personal-injury"]}
      relatedDomains={[
        { name: "Insurance", path: "/legal-domains/insurance" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Medical", path: "/legal-domains/medical" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Bar Association - Personal Injury",
          description: "Information on personal injury claims, the legal process, and finding legal representation.",
          link: "https://www.cba.org/For-The-Public/Public-Legal-Information"
        },
        {
          title: "Provincial Insurance Regulators",
          description: "Resources on insurance regulations, coverage requirements, and claim processes in your province.",
          link: "https://www.canada.ca/en/financial-consumer-agency/services/insurance/auto-insurance-regulators.html"
        },
        {
          title: "Motor Vehicle Accident Claims",
          description: "Information on automobile accident claims, no-fault insurance, and compensation in Canada.",
          link: "https://www.justice.gc.ca/eng/rp-pr/cj-jp/victim/guide/secm.html"
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
      title="Personal Injury Law"
      description="Personal injury law covers cases where individuals have been physically or psychologically injured due to negligence or wrongdoing. Our templates help with accident reports, insurance claims, and other documents related to personal injury matters in Canada."
      templateTypes={["personal-injury"]}
      relatedDomains={[
        { name: "Insurance", path: "/legal-domains/insurance" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Medical", path: "/legal-domains/medical" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Bar Association - Personal Injury",
          description: "Information on personal injury claims, the legal process, and finding legal representation.",
          link: "https://www.cba.org/For-The-Public/Public-Legal-Information"
        },
        {
          title: "Provincial Insurance Regulators",
          description: "Resources on insurance regulations, coverage requirements, and claim processes in your province.",
          link: "https://www.canada.ca/en/financial-consumer-agency/services/insurance/auto-insurance-regulators.html"
        },
        {
          title: "Motor Vehicle Accident Claims",
          description: "Information on automobile accident claims, no-fault insurance, and compensation in Canada.",
          link: "https://www.justice.gc.ca/eng/rp-pr/cj-jp/victim/guide/secm.html"
        }
      ]}
    />
  
    </div>
  );
}

export default PersonalInjuryLawPage;