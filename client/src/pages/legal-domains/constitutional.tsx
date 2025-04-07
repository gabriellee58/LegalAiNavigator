import LegalDomainPage from "./template";

function ConstitutionalLawPage() {
  return (
    <LegalDomainPage
      title="Constitutional Law"
      description="Constitutional law deals with the interpretation and application of the Canadian Constitution, including the Charter of Rights and Freedoms. Our templates help with constitutional challenges, rights claims, and documentation related to constitutional issues in Canada."
      templateTypes={["constitutional", "charter"]}
      relatedDomains={[
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Administrative", path: "/legal-domains/administrative" },
        { name: "Indigenous Law", path: "/legal-domains/indigenous-law" },
        { name: "Criminal", path: "/legal-domains/criminal" }
      ]}
      resources={[
        {
          title: "Department of Justice - Constitutional Law",
          description: "Federal resources on constitutional principles, Charter rights, and constitutional litigation.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/charter-charte/index.html"
        },
        {
          title: "Supreme Court of Canada",
          description: "Information on constitutional cases, precedents, and the court's role in constitutional interpretation.",
          link: "https://www.scc-csc.ca/home-accueil/index-eng.aspx"
        },
        {
          title: "Charter of Rights and Freedoms",
          description: "Full text and explanatory materials on Canada's constitutional rights and freedoms.",
          link: "https://laws-lois.justice.gc.ca/eng/const/page-12.html"
        }
      ]}
    />
  );
}

export default ConstitutionalLawPage;