import LegalDomainPage from "./template";

function LandClaimsPage() {
  return (
    <LegalDomainPage
      title="Land Claims"
      description="Land claims law deals with Indigenous rights to land and resources in Canada. Our templates help with land claim documentation, treaty rights assertion, and processes related to Aboriginal title under Canadian law."
      templateTypes={["land-claims", "aboriginal-title"]}
      relatedDomains={[
        { name: "Indigenous Law", path: "/legal-domains/indigenous-law" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Constitutional", path: "/legal-domains/constitutional" },
        { name: "Environmental", path: "/legal-domains/environmental" }
      ]}
      resources={[
        {
          title: "Crown-Indigenous Relations and Northern Affairs Canada",
          description: "Federal resources on comprehensive and specific land claims processes, treaties, and self-government.",
          link: "https://www.canada.ca/en/crown-indigenous-relations-northern-affairs.html"
        },
        {
          title: "Land Claims Agreements Coalition",
          description: "Information on modern treaties, land claims implementation, and Indigenous land rights.",
          link: "https://landclaimscoalition.ca/"
        },
        {
          title: "Indigenous Land Rights Resources",
          description: "Educational materials on Aboriginal title, treaty rights, and land claims precedents in Canada.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/principles-principes.html"
        }
      ]}
    />
  );
}

export default LandClaimsPage;