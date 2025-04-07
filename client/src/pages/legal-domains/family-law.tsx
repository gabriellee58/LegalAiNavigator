import LegalDomainPage from "./template";

function FamilyLawPage() {
  return (
    <LegalDomainPage
      title="Family Law"
      description="Family law deals with legal matters concerning family relationships, including divorce, child custody, support, and property division. Our templates help navigate Canadian family law procedures and documentation requirements."
      templateTypes={["family", "divorce", "custody", "support"]}
      relatedDomains={[
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Estate Planning", path: "/legal-domains/estate-planning" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
        { name: "Mediation", path: "/legal-domains/mediation" }
      ]}
      resources={[
        {
          title: "Department of Justice - Family Law",
          description: "Federal family law information including divorce, separation, and child support guidelines.",
          link: "https://www.justice.gc.ca/eng/fl-df/index.html"
        },
        {
          title: "Provincial Family Courts",
          description: "Provincial family court resources, forms, and procedural guides for family law matters.",
          link: "https://www.justice.gc.ca/eng/fl-df/pt-tp/index.html"
        },
        {
          title: "Child Support Guidelines",
          description: "Federal and provincial child support calculation tools and enforcement information.",
          link: "https://www.justice.gc.ca/eng/fl-df/child-enfant/index.html"
        }
      ]}
    />
  );
}

export default FamilyLawPage;