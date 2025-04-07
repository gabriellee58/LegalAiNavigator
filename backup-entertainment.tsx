import LegalDomainPage from "./template";

function EntertainmentLawPage() {
  return (
    <LegalDomainPage
      title="Entertainment Law"
      description="Entertainment law covers legal issues related to film, music, publishing, and other creative industries. Our templates help with contracts, licensing, and rights protection for artists, performers, and creative businesses in Canada."
      templateTypes={["entertainment", "media"]}
      relatedDomains={[
        { name: "Intellectual Property", path: "/legal-domains/intellectual-property" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Media Production Association",
          description: "Industry resources for film, television, and digital media production legal requirements.",
          link: "https://cmpa.ca/resource/"
        },
        {
          title: "SOCAN - Society of Composers, Authors and Music Publishers",
          description: "Information on music licensing, royalties, and copyright protection for music in Canada.",
          link: "https://www.socan.com/"
        },
        {
          title: "Entertainment Law Resources",
          description: "Educational materials on contracts, rights, and legal issues for Canadian entertainment professionals.",
          link: "https://www.canada.ca/en/canadian-heritage/services/funding/music-publishing.html"
        }
      ]}
    />
  );
}

export default EntertainmentLawPage;