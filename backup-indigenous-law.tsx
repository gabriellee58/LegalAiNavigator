import LegalDomainPage from "./template";

function IndigenousLawPage() {
  return (
    <LegalDomainPage
      title="Indigenous Law"
      description="Indigenous law encompasses the unique legal rights, traditions, and governance of First Nations, Métis, and Inuit peoples in Canada. Our templates help with issues related to Aboriginal rights, treaty claims, and Indigenous legal matters under Canadian law."
      templateTypes={["indigenous", "aboriginal"]}
      relatedDomains={[
        { name: "Constitutional", path: "/legal-domains/constitutional" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Environmental", path: "/legal-domains/environmental" },
        { name: "Land Claims", path: "/legal-domains/land-claims" }
      ]}
      resources={[
        {
          title: "Indigenous Services Canada",
          description: "Federal resource for Indigenous communities with information on legal services, rights, and programs.",
          link: "https://www.canada.ca/en/indigenous-services-canada.html"
        },
        {
          title: "Aboriginal Law Centre",
          description: "Research and resources on Indigenous legal systems, rights, and reconciliation initiatives.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/index.html"
        },
        {
          title: "Indigenous Justice Programs",
          description: "Community-based justice programs designed to reflect Indigenous legal traditions and approaches.",
          link: "https://www.justice.gc.ca/eng/fund-fina/acf-fca/ajs-sja/index.html"
        }
      ]}
    />
  );
}

export default IndigenousLawPage;