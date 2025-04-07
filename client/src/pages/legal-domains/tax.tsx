import LegalDomainPage from "./template";

function TaxLawPage() {
  return (
    <LegalDomainPage
      title="Tax Law"
      description="Tax law encompasses the rules and regulations governing taxation of individuals and businesses. Our templates help with tax planning, disputes with tax authorities, and documentation related to Canadian federal and provincial tax matters."
      templateTypes={["tax"]}
      relatedDomains={[
        { name: "Business", path: "/legal-domains/business" },
        { name: "Estate Planning", path: "/legal-domains/estate-planning" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Administrative", path: "/legal-domains/administrative" }
      ]}
      resources={[
        {
          title: "Canada Revenue Agency",
          description: "Official tax resources, forms, guides, and procedures for individual and business tax matters.",
          link: "https://www.canada.ca/en/revenue-agency.html"
        },
        {
          title: "Tax Court of Canada",
          description: "Information on tax disputes, appeals procedures, and resolving disagreements with tax authorities.",
          link: "https://www.tcc-cci.gc.ca/en/home.html"
        },
        {
          title: "Tax Planning Resources",
          description: "Educational materials on tax planning strategies, deductions, and credits available in Canada.",
          link: "https://www.canada.ca/en/services/taxes/income-tax.html"
        }
      ]}
    />
  );
}

export default TaxLawPage;