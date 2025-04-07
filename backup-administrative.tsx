import LegalDomainPage from "./template";

function AdministrativeLawPage() {
  return (
    <LegalDomainPage
      title="Administrative Law"
      description="Administrative law governs the activities of government agencies, boards, and tribunals. Our templates help with administrative proceedings, appeals, and documentation for interactions with Canadian regulatory bodies and government agencies."
      templateTypes={["administrative", "regulatory"]}
      relatedDomains={[
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Immigration", path: "/legal-domains/immigration" },
        { name: "Environmental", path: "/legal-domains/environmental" }
      ]}
      resources={[
        {
          title: "Administrative Tribunals in Canada",
          description: "Information on federal and provincial administrative tribunals, their procedures, and jurisdiction.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/just/08.html"
        },
        {
          title: "Judicial Review Process",
          description: "Resources on challenging administrative decisions through judicial review in Canadian courts.",
          link: "https://www.canlii.org/en/commentary/judicial-review/"
        },
        {
          title: "Administrative Law Resources",
          description: "Educational materials on administrative law principles, procedures, and practices in Canada.",
          link: "https://www.canada.ca/en/services/benefits/disability.html"
        }
      ]}
    />
  );
}

export default AdministrativeLawPage;