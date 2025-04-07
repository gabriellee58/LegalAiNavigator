import LegalDomainPage from "./template";

function EmploymentLawPage() {
  return (
    <LegalDomainPage
      title="Employment Law"
      description="Employment law regulates the relationship between employers and employees, covering hiring, workplace conditions, compensation, termination, and worker rights. Our templates help with employment contracts, workplace policies, and related documents."
      templateTypes={["employment"]}
      relatedDomains={[
        { name: "Business", path: "/legal-domains/business" },
        { name: "Personal Injury", path: "/legal-domains/personal-injury" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Tax", path: "/legal-domains/tax" }
      ]}
      resources={[
        {
          title: "Employment and Social Development Canada",
          description: "Federal information on employment standards, workplace safety, and labor relations.",
          link: "https://www.canada.ca/en/employment-social-development.html"
        },
        {
          title: "Canadian Human Rights Commission",
          description: "Resources on workplace discrimination, accommodation, and human rights complaints.",
          link: "https://www.chrc-ccdp.gc.ca/en"
        },
        {
          title: "Provincial Labour Standards",
          description: "Information on provincial employment standards, which vary by jurisdiction.",
          link: "https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards.html"
        }
      ]}
    />
  );
}

export default EmploymentLawPage;