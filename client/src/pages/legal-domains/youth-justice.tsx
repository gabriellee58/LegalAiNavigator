import LegalDomainPage from "./template";

function YouthJusticePage() {
  return (
    <LegalDomainPage
      title="Youth Justice"
      description="Youth justice law governs the legal system for young persons accused of crimes in Canada. Our templates help with understanding youth criminal procedures, rights, and documentation related to the Youth Criminal Justice Act."
      templateTypes={["youth", "juvenile"]}
      relatedDomains={[
        { name: "Criminal", path: "/legal-domains/criminal" },
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Administrative", path: "/legal-domains/administrative" }
      ]}
      resources={[
        {
          title: "Department of Justice - Youth Justice",
          description: "Federal information on the Youth Criminal Justice Act, procedures, and protections for young persons.",
          link: "https://www.justice.gc.ca/eng/cj-jp/yj-jj/index.html"
        },
        {
          title: "Youth Criminal Justice Act",
          description: "Full text and explanatory materials on Canada's youth justice legislation.",
          link: "https://laws-lois.justice.gc.ca/eng/acts/y-1.5/"
        },
        {
          title: "Provincial Youth Justice Programs",
          description: "Resources on provincial youth justice services, alternatives to court, and rehabilitation programs.",
          link: "https://www.justice.gc.ca/eng/cj-jp/yj-jj/tools-outils/sheets-feuillets/index.html"
        }
      ]}
    />
  );
}

export default YouthJusticePage;