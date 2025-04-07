import LegalDomainPage from "./template";

function TechnologyLawPage() {
  return (
    <LegalDomainPage
      title="Technology Law"
      description="Technology law addresses legal issues related to software, internet, data privacy, and emerging technologies. Our templates help with technology contracts, privacy policies, and digital rights protection under Canadian technology regulations."
      templateTypes={["technology", "privacy", "digital"]}
      relatedDomains={[
        { name: "Intellectual Property", path: "/legal-domains/intellectual-property" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Entertainment", path: "/legal-domains/entertainment" },
        { name: "Consumer Rights", path: "/legal-domains/consumer-rights" }
      ]}
      resources={[
        {
          title: "Office of the Privacy Commissioner of Canada",
          description: "Federal resources on privacy laws, data protection requirements, and compliance for tech companies.",
          link: "https://www.priv.gc.ca/en/"
        },
        {
          title: "Canadian Radio-television and Telecommunications Commission",
          description: "Information on telecommunications regulations, internet policies, and digital communication laws.",
          link: "https://crtc.gc.ca/eng/home-accueil.htm"
        },
        {
          title: "Innovation, Science and Economic Development Canada",
          description: "Resources on technology policy, digital economy initiatives, and innovation regulations.",
          link: "https://www.ic.gc.ca/eic/site/icgc.nsf/eng/home"
        }
      ]}
    />
  );
}

export default TechnologyLawPage;