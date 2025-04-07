import LegalDomainPage from "./template";

function CriminalLawPage() {
  return (
    <LegalDomainPage
      title="Criminal Law"
      description="Criminal law involves offenses against the public, prosecuted by the state. Our templates help with understanding criminal procedures, rights of the accused, and documentation relevant to the Canadian criminal justice system."
      templateTypes={["criminal"]}
      relatedDomains={[
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Administrative", path: "/legal-domains/administrative" },
        { name: "Youth Justice", path: "/legal-domains/youth-justice" }
      ]}
      resources={[
        {
          title: "Department of Justice - Criminal Justice",
          description: "Official information on the Canadian criminal justice system, procedures, and recent reforms.",
          link: "https://www.justice.gc.ca/eng/cj-jp/index.html"
        },
        {
          title: "Legal Aid Programs",
          description: "Provincial legal aid services available to those facing criminal charges who cannot afford representation.",
          link: "https://www.justice.gc.ca/eng/fund-fina/gov-gouv/aid-aide.html"
        },
        {
          title: "Criminal Code of Canada",
          description: "Full text of Canada's criminal laws, offenses, and procedures with annotations.",
          link: "https://laws-lois.justice.gc.ca/eng/acts/c-46/"
        }
      ]}
    />
  );
}

export default CriminalLawPage;