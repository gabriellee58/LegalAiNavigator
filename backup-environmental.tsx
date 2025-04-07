import LegalDomainPage from "./template";

function EnvironmentalLawPage() {
  return (
    <LegalDomainPage
      title="Environmental Law"
      description="Environmental law regulates human impact on the natural environment. Our templates help with environmental compliance, impact assessments, and documentation related to Canadian environmental regulations and sustainability requirements."
      templateTypes={["environmental"]}
      relatedDomains={[
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Indigenous Law", path: "/legal-domains/indigenous-law" },
        { name: "Administrative", path: "/legal-domains/administrative" }
      ]}
      resources={[
        {
          title: "Environment and Climate Change Canada",
          description: "Federal environmental regulations, compliance requirements, and sustainability initiatives.",
          link: "https://www.canada.ca/en/environment-climate-change.html"
        },
        {
          title: "Canadian Environmental Assessment Agency",
          description: "Information on environmental assessments, reviews, and impact studies requirements.",
          link: "https://www.canada.ca/en/impact-assessment-agency.html"
        },
        {
          title: "Environmental Law Centre",
          description: "Resources on environmental rights, regulations, and compliance across Canadian jurisdictions.",
          link: "https://www.cela.ca/"
        }
      ]}
    />
  );
}

export default EnvironmentalLawPage;