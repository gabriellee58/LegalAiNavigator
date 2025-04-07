import LegalDomainPage from "./template";

function MediationPage() {
  return (
    <LegalDomainPage
      title="Mediation & Dispute Resolution"
      description="Mediation law covers alternative dispute resolution methods outside the court system. Our templates help with mediation agreements, settlement documents, and paperwork required for resolving conflicts through Canadian mediation and alternative dispute resolution processes."
      templateTypes={["mediation", "arbitration", "dispute-resolution"]}
      relatedDomains={[
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Business", path: "/legal-domains/business" }
      ]}
      resources={[
        {
          title: "ADR Institute of Canada",
          description: "National association for alternative dispute resolution with resources on mediation and arbitration standards.",
          link: "https://adric.ca/"
        },
        {
          title: "Department of Justice - Dispute Resolution",
          description: "Federal resources on alternative dispute resolution mechanisms, benefits, and processes.",
          link: "https://www.justice.gc.ca/eng/rp-pr/csj-sjc/dprs-sprd/index.html"
        },
        {
          title: "Provincial Mediation Services",
          description: "Information on provincial court-connected mediation programs, family mediation, and civil mediation services.",
          link: "https://www.justice.gc.ca/eng/fl-df/fjs-sjf/index.html"
        }
      ]}
    />
  );
}

export default MediationPage;