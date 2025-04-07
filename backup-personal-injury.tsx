import LegalDomainPage from "./template";

function PersonalInjuryLawPage() {
  return (
    <LegalDomainPage
      title="Personal Injury Law"
      description="Personal injury law covers cases where individuals have been physically or psychologically injured due to negligence or wrongdoing. Our templates help with accident reports, insurance claims, and other documents related to personal injury matters in Canada."
      templateTypes={["personal-injury"]}
      relatedDomains={[
        { name: "Insurance", path: "/legal-domains/insurance" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Medical", path: "/legal-domains/medical" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Bar Association - Personal Injury",
          description: "Information on personal injury claims, the legal process, and finding legal representation.",
          link: "https://www.cba.org/For-The-Public/Public-Legal-Information"
        },
        {
          title: "Provincial Insurance Regulators",
          description: "Resources on insurance regulations, coverage requirements, and claim processes in your province.",
          link: "https://www.canada.ca/en/financial-consumer-agency/services/insurance/auto-insurance-regulators.html"
        },
        {
          title: "Motor Vehicle Accident Claims",
          description: "Information on automobile accident claims, no-fault insurance, and compensation in Canada.",
          link: "https://www.justice.gc.ca/eng/rp-pr/cj-jp/victim/guide/secm.html"
        }
      ]}
    />
  );
}

export default PersonalInjuryLawPage;