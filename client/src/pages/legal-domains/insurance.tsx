import LegalDomainPage from "./template";

function InsuranceLawPage() {
  return (
    <LegalDomainPage
      title="Insurance Law"
      description="Insurance law governs the relationship between insurers and policyholders. Our templates help with insurance claims, policy reviews, and dispute resolution processes under Canadian insurance regulations."
      templateTypes={["insurance"]}
      relatedDomains={[
        { name: "Personal Injury", path: "/legal-domains/personal-injury" },
        { name: "Real Estate", path: "/legal-domains/real-estate" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Consumer Rights", path: "/legal-domains/consumer-rights" }
      ]}
      resources={[
        {
          title: "Financial Consumer Agency of Canada - Insurance",
          description: "Federal information on insurance products, consumer rights, and complaint procedures.",
          link: "https://www.canada.ca/en/financial-consumer-agency/services/insurance.html"
        },
        {
          title: "Provincial Insurance Regulators",
          description: "Provincial authorities that oversee insurance companies and handle consumer concerns.",
          link: "https://www.canada.ca/en/financial-consumer-agency/services/insurance/regulators.html"
        },
        {
          title: "Insurance Bureau of Canada",
          description: "Industry association with consumer information on insurance policies, claims, and best practices.",
          link: "http://www.ibc.ca/"
        }
      ]}
    />
  );
}

export default InsuranceLawPage;