import LegalDomainPage from "./template";

function IntellectualPropertyPage() {
  return (
    <LegalDomainPage
      title="Intellectual Property"
      description="Intellectual property law protects creations of the mind, including patents, trademarks, copyrights, and trade secrets. Our templates help with IP registration, protection, and licensing under Canadian intellectual property regulations."
      templateTypes={["intellectual-property", "copyright", "trademark"]}
      relatedDomains={[
        { name: "Business", path: "/legal-domains/business" },
        { name: "Entertainment", path: "/legal-domains/entertainment" },
        { name: "Technology", path: "/legal-domains/technology" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Intellectual Property Office",
          description: "Official government resource for registering and protecting patents, trademarks, and copyrights in Canada.",
          link: "https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/home"
        },
        {
          title: "Copyright Board of Canada",
          description: "Information on copyright law, royalties, and licensing requirements for creative works.",
          link: "https://cb-cda.gc.ca/en"
        },
        {
          title: "IP Law Information",
          description: "Educational resources on intellectual property protection, infringement, and enforcement in Canada.",
          link: "https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/h_wr04234.html"
        }
      ]}
    />
  );
}

export default IntellectualPropertyPage;