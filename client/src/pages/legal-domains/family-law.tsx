import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function FamilyLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("family law");

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
          Family Law
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
              title="Family Law"
              description="Family law deals with legal matters concerning family relationships, including divorce, child custody, support, and property division. Our templates help navigate Canadian family law procedures and documentation requirements."
              templateTypes={["family", "divorce", "custody", "support"]}
              relatedDomains={[
                { name: "Real Estate", path: "/legal-domains/real-estate" },
                { name: "Estate Planning", path: "/legal-domains/estate-planning" },
                { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
                { name: "Mediation", path: "/legal-domains/mediation" }
              ]}
              resources={[
                {
                  title: "Department of Justice - Family Law",
                  description: "Federal family law information including divorce, separation, and child support guidelines.",
                  link: "https://www.justice.gc.ca/eng/fl-df/index.html"
                },
                {
                  title: "Provincial Family Courts",
                  description: "Provincial family court resources, forms, and procedural guides for family law matters.",
                  link: "https://www.justice.gc.ca/eng/fl-df/pt-tp/index.html"
                },
                {
                  title: "Child Support Guidelines",
                  description: "Federal and provincial child support calculation tools and enforcement information.",
                  link: "https://www.justice.gc.ca/eng/fl-df/child-enfant/index.html"
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
        title="Family Law"
        description="Family law deals with legal matters concerning family relationships, including divorce, child custody, support, and property division. Our templates help navigate Canadian family law procedures and documentation requirements."
        templateTypes={["family", "divorce", "custody", "support"]}
        relatedDomains={[
          { name: "Real Estate", path: "/legal-domains/real-estate" },
          { name: "Estate Planning", path: "/legal-domains/estate-planning" },
          { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
          { name: "Mediation", path: "/legal-domains/mediation" }
        ]}
        resources={[
          {
            title: "Department of Justice - Family Law",
            description: "Federal family law information including divorce, separation, and child support guidelines.",
            link: "https://www.justice.gc.ca/eng/fl-df/index.html"
          },
          {
            title: "Provincial Family Courts",
            description: "Provincial family court resources, forms, and procedural guides for family law matters.",
            link: "https://www.justice.gc.ca/eng/fl-df/pt-tp/index.html"
          },
          {
            title: "Child Support Guidelines",
            description: "Federal and provincial child support calculation tools and enforcement information.",
            link: "https://www.justice.gc.ca/eng/fl-df/child-enfant/index.html"
          }
        ]}
      />
    </div>
  );
}

export default FamilyLawPage;