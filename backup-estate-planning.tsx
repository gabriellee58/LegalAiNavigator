import LegalDomainPage from "./template";

function EstatePlanningPage() {
  return (
    <LegalDomainPage
      title="Estate Planning"
      description="Estate planning involves preparing for the transfer of a person's assets after death. Our templates help with wills, trusts, powers of attorney, and other documents essential for Canadian estate management."
      templateTypes={["estate", "will"]}
      relatedDomains={[
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Tax", path: "/legal-domains/tax" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Business", path: "/legal-domains/business" }
      ]}
      resources={[
        {
          title: "Canadian Estate Planning Guide",
          description: "Comprehensive information on wills, probate process, and estate administration across provinces.",
          link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/life-events/what-when-someone-died.html"
        },
        {
          title: "Power of Attorney Information",
          description: "Provincial guides on creating and using powers of attorney for property and personal care.",
          link: "https://www.justice.gc.ca/eng/fl-df/index.html"
        },
        {
          title: "Estate Tax Planning",
          description: "Resources on minimizing tax implications for estates and beneficiaries in Canada.",
          link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/life-events/what-when-someone-died/final-return.html"
        }
      ]}
    />
  );
}

export default EstatePlanningPage;