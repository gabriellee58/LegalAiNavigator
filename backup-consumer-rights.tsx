import LegalDomainPage from "./template";

function ConsumerRightsPage() {
  return (
    <LegalDomainPage
      title="Consumer Rights"
      description="Consumer rights law protects buyers of goods and services against unfair practices, fraud, and safety hazards. Our templates help with consumer complaints, refund requests, and protection of your rights in Canadian marketplace transactions."
      templateTypes={["consumer"]}
      relatedDomains={[
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Insurance", path: "/legal-domains/insurance" },
        { name: "Personal Injury", path: "/legal-domains/personal-injury" }
      ]}
      resources={[
        {
          title: "Office of Consumer Affairs",
          description: "Federal consumer information on rights, complaints, and marketplace issues across Canada.",
          link: "https://www.ic.gc.ca/eic/site/oca-bc.nsf/eng/home"
        },
        {
          title: "Competition Bureau Canada",
          description: "Information on consumer protection from false advertising, price-fixing, and other unfair business practices.",
          link: "https://www.competitionbureau.gc.ca/eic/site/cb-bc.nsf/eng/home"
        },
        {
          title: "Provincial Consumer Protection Offices",
          description: "Local consumer protection authorities that handle complaints and enforce provincial regulations.",
          link: "https://www.canada.ca/en/services/finance/consumer-affairs.html"
        }
      ]}
    />
  );
}

export default ConsumerRightsPage;