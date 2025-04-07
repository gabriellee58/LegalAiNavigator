import LegalDomainPage from "./template";

function CivilLitigationPage() {
  return (
    <LegalDomainPage
      title="Civil Litigation"
      description="Civil litigation involves disputes between individuals, businesses, or other entities where monetary damages or specific performance are sought rather than criminal sanctions. Our templates help with court filings, claims, and documents related to Canadian civil cases."
      templateTypes={["litigation", "civil"]}
      relatedDomains={[
        { name: "Personal Injury", path: "/legal-domains/personal-injury" },
        { name: "Consumer Rights", path: "/legal-domains/consumer-rights" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Family Law", path: "/legal-domains/family-law" }
      ]}
      resources={[
        {
          title: "Courts Administration Service",
          description: "Information on federal courts, procedures, forms, and filing requirements for civil cases.",
          link: "https://www.cas-satj.gc.ca/en/index.shtml"
        },
        {
          title: "Provincial Courts Civil Divisions",
          description: "Resources on provincial civil courts, small claims procedures, and local filing requirements.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/just/07.html"
        },
        {
          title: "Civil Procedure Rules",
          description: "Provincial rules governing civil litigation procedures, timelines, and requirements.",
          link: "https://www.justice.gc.ca/eng/rp-pr/csj-sjc/just/index.html"
        }
      ]}
    />
  );
}

export default CivilLitigationPage;