import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function EntertainmentLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("entertainment law");

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
          Entertainment Law
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
      title="Entertainment Law"
      description="Entertainment law covers legal issues related to film, music, publishing, and other creative industries. Our templates help with contracts, licensing, and rights protection for artists, performers, and creative businesses in Canada."
      templateTypes={["entertainment", "media"]}
      relatedDomains={[
        { name: "Intellectual Property", path: "/legal-domains/intellectual-property" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Media Production Association",
          description: "Industry resources for film, television, and digital media production legal requirements.",
          link: "https://cmpa.ca/resource/"
        },
        {
          title: "SOCAN - Society of Composers, Authors and Music Publishers",
          description: "Information on music licensing, royalties, and copyright protection for music in Canada.",
          link: "https://www.socan.com/"
        },
        {
          title: "Entertainment Law Resources",
          description: "Educational materials on contracts, rights, and legal issues for Canadian entertainment professionals.",
          link: "https://www.canada.ca/en/canadian-heritage/services/funding/music-publishing.html"
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
      title="Entertainment Law"
      description="Entertainment law covers legal issues related to film, music, publishing, and other creative industries. Our templates help with contracts, licensing, and rights protection for artists, performers, and creative businesses in Canada."
      templateTypes={["entertainment", "media"]}
      relatedDomains={[
        { name: "Intellectual Property", path: "/legal-domains/intellectual-property" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Media Production Association",
          description: "Industry resources for film, television, and digital media production legal requirements.",
          link: "https://cmpa.ca/resource/"
        },
        {
          title: "SOCAN - Society of Composers, Authors and Music Publishers",
          description: "Information on music licensing, royalties, and copyright protection for music in Canada.",
          link: "https://www.socan.com/"
        },
        {
          title: "Entertainment Law Resources",
          description: "Educational materials on contracts, rights, and legal issues for Canadian entertainment professionals.",
          link: "https://www.canada.ca/en/canadian-heritage/services/funding/music-publishing.html"
        }
      ]}
    />
  
    </div>
  );
}

export default EntertainmentLawPage;