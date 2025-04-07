import LegalDomainPage from "./template";

function HumanRightsPage() {
  return (
    <LegalDomainPage
      title="Human Rights"
      description="Human rights law protects fundamental rights and freedoms of individuals. Our templates help with human rights complaints, accommodation requests, and documentation related to Canadian human rights legislation at federal and provincial levels."
      templateTypes={["human-rights", "discrimination"]}
      relatedDomains={[
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Immigration", path: "/legal-domains/immigration" },
        { name: "Administrative", path: "/legal-domains/administrative" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Human Rights Commission",
          description: "Federal agency responsible for applying the Canadian Human Rights Act with resources on discrimination and complaint procedures.",
          link: "https://www.chrc-ccdp.gc.ca/en"
        },
        {
          title: "Provincial Human Rights Commissions",
          description: "Provincial and territorial human rights agencies that handle complaints within their jurisdictions.",
          link: "https://www.chrc-ccdp.gc.ca/en/complaints/provincial-territorial-human-rights-agencies"
        },
        {
          title: "Human Rights Legal Support Centre",
          description: "Resources for legal help with human rights applications and hearings across Canada.",
          link: "http://www.hrlsc.on.ca/"
        }
      ]}
    />
  );
}

export default HumanRightsPage;