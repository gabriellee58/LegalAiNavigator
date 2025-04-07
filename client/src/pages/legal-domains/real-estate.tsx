import LegalDomainPage from "./template";

function RealEstateLawPage() {
  return (
    <LegalDomainPage
      title="Real Estate Law"
      description="Real estate law covers property rights, transactions, landlord-tenant relations, and land use regulations. Our templates help with property purchases, leases, and other real estate documents common in Canadian property transactions."
      templateTypes={["real-estate"]}
      relatedDomains={[
        { name: "Business", path: "/legal-domains/business" },
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Environmental", path: "/legal-domains/environmental" },
        { name: "Municipal", path: "/legal-domains/municipal" }
      ]}
      resources={[
        {
          title: "Canada Mortgage and Housing Corporation",
          description: "Information on housing market data, mortgage loan insurance, and programs to support Canadians in finding affordable housing.",
          link: "https://www.cmhc-schl.gc.ca/en"
        },
        {
          title: "Canadian Real Estate Association",
          description: "National organization representing real estate professionals, with resources for buyers and sellers.",
          link: "https://www.crea.ca/"
        },
        {
          title: "Land Registry Information",
          description: "Provincial land registry systems for property searches and land title information.",
          link: "https://www.canada.ca/en/services/business/permits/federallyregulatedbusinessactivities/landsurvey.html"
        }
      ]}
    />
  );
}

export default RealEstateLawPage;