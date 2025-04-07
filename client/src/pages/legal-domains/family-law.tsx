import LegalDomainPage from "./template";

function FamilyLawPage() {
  return (
    <LegalDomainPage
      title="Family Law"
      description="Family law governs domestic relations and family matters like marriage, divorce, child custody, adoption, and support. Our templates help with common family law documents needed in Canadian legal proceedings."
      templateTypes={["family"]}
      relatedDomains={[
        { name: "Estate Planning", path: "/legal-domains/estate-planning" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Immigration", path: "/legal-domains/immigration" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Department of Justice - Family Law",
          description: "Official Canadian government resources on family law topics including divorce, separation, and child support.",
          link: "https://www.justice.gc.ca/eng/fl-df/index.html"
        },
        {
          title: "Child Support Calculator",
          description: "Tool for estimating child support amounts based on the Federal Child Support Guidelines.",
          link: "https://www.justice.gc.ca/eng/fl-df/child-enfant/cst-calc.aspx"
        },
        {
          title: "Divorce Law in Canada",
          description: "Information about divorce procedures, legal grounds, and requirements in Canada.",
          link: "https://www.justice.gc.ca/eng/fl-df/divorce/index.html"
        }
      ]}
    />
  );
}

export default FamilyLawPage;