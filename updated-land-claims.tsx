import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function LandClaimsPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("land claims law");

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
          Land Claims
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
      title="Land Claims"
      description="Land claims law deals with Indigenous rights to land and resources in Canada. Our templates help with land claim documentation, treaty rights assertion, and processes related to Aboriginal title under Canadian law."
      templateTypes={["land-claims", "aboriginal-title"]}
      relatedDomains={[
        { name: "Indigenous Law", path: "/legal-domains/indigenous-law" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Constitutional", path: "/legal-domains/constitutional" },
        { name: "Environmental", path: "/legal-domains/environmental" }
      ]}
      resources={[
        {
          title: "Crown-Indigenous Relations and Northern Affairs Canada",
          description: "Federal resources on comprehensive and specific land claims processes, treaties, and self-government.",
          link: "https://www.canada.ca/en/crown-indigenous-relations-northern-affairs.html"
        },
        {
          title: "Land Claims Agreements Coalition",
          description: "Information on modern treaties, land claims implementation, and Indigenous land rights.",
          link: "https://landclaimscoalition.ca/"
        },
        {
          title: "Indigenous Land Rights Resources",
          description: "Educational materials on Aboriginal title, treaty rights, and land claims precedents in Canada.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/principles-principes.html"
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
      title="Land Claims"
      description="Land claims law deals with Indigenous rights to land and resources in Canada. Our templates help with land claim documentation, treaty rights assertion, and processes related to Aboriginal title under Canadian law."
      templateTypes={["land-claims", "aboriginal-title"]}
      relatedDomains={[
        { name: "Indigenous Law", path: "/legal-domains/indigenous-law" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Constitutional", path: "/legal-domains/constitutional" },
        { name: "Environmental", path: "/legal-domains/environmental" }
      ]}
      resources={[
        {
          title: "Crown-Indigenous Relations and Northern Affairs Canada",
          description: "Federal resources on comprehensive and specific land claims processes, treaties, and self-government.",
          link: "https://www.canada.ca/en/crown-indigenous-relations-northern-affairs.html"
        },
        {
          title: "Land Claims Agreements Coalition",
          description: "Information on modern treaties, land claims implementation, and Indigenous land rights.",
          link: "https://landclaimscoalition.ca/"
        },
        {
          title: "Indigenous Land Rights Resources",
          description: "Educational materials on Aboriginal title, treaty rights, and land claims precedents in Canada.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/principles-principes.html"
        }
      ]}
    />
  
    </div>
  );
}

export default LandClaimsPage;