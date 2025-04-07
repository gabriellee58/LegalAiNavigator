import LegalDomainPage from "./template";

function ImmigrationLawPage() {
  return (
    <LegalDomainPage
      title="Immigration Law"
      description="Immigration law covers entry, residence, citizenship, and refugee protection in Canada. Our templates help with visa applications, permanent residence, citizenship, and related immigration documents for individuals and sponsors."
      templateTypes={["immigration"]}
      relatedDomains={[
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Administrative", path: "/legal-domains/administrative" }
      ]}
      resources={[
        {
          title: "Immigration, Refugees and Citizenship Canada",
          description: "Official government information on immigration programs, application procedures, and requirements.",
          link: "https://www.canada.ca/en/immigration-refugees-citizenship.html"
        },
        {
          title: "Canada Immigration and Visa Information",
          description: "Resources on various immigration pathways, including Express Entry, Provincial Nominee Programs, and family sponsorship.",
          link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html"
        },
        {
          title: "Immigration and Refugee Board of Canada",
          description: "Information on refugee claims, appeals, and immigration hearings in Canada.",
          link: "https://irb-cisr.gc.ca/en/Pages/index.aspx"
        }
      ]}
    />
  );
}

export default ImmigrationLawPage;