import LegalDomainPage from "./template";

function BusinessLawPage() {
  return (
    <LegalDomainPage
      title="Business Law"
      description="Business law governs commercial activities, corporate formation, operations, and transactions. Our templates help with incorporation, partnerships, contracts, and other documents essential for Canadian businesses."
      templateTypes={["business", "contract"]}
      relatedDomains={[
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Tax", path: "/legal-domains/tax" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Intellectual Property", path: "/legal-domains/intellectual-property" }
      ]}
      resources={[
        {
          title: "Corporations Canada",
          description: "Federal corporate registry with information on incorporation, filing requirements, and corporate compliance.",
          link: "https://corporationscanada.ic.gc.ca/eic/site/cd-dgc.nsf/eng/home"
        },
        {
          title: "Business Development Bank of Canada",
          description: "Resources and financing for Canadian businesses, with guides on business planning, growth, and management.",
          link: "https://www.bdc.ca/en"
        },
        {
          title: "Canada Business Network",
          description: "Government services for businesses and start-ups, including regulations, financing, and market research.",
          link: "https://www.canada.ca/en/services/business.html"
        }
      ]}
    />
  );
}

export default BusinessLawPage;