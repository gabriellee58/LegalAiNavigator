import pg from 'pg';
const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get domain IDs from the database
async function getDomainIds() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, name FROM legal_domains');
    return result.rows.reduce((acc, row) => {
      acc[row.name.toLowerCase().replace(/\s+/g, '_')] = row.id;
      return acc;
    }, {});
  } finally {
    client.release();
  }
}

// Legal knowledge base content organized by domain
async function populateLegalKnowledgeBase() {
  const client = await pool.connect();
  
  try {
    // Get domain IDs
    const domainIds = await getDomainIds();
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Family Law knowledge
    const familyLawItems = [
      {
        domainId: domainIds.family_law,
        question: "What is the Divorce Act in Canada?",
        answer: "The Divorce Act is federal legislation that governs divorce in Canada. It covers the grounds for divorce, spousal support, child support, and child custody and access arrangements. The Act was significantly amended in 2021 to focus more on the best interests of children, address family violence, and reduce poverty after separation or divorce.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["divorce", "family law", "legislation"]),
        relevanceScore: 90,
        sources: JSON.stringify([
          {
            name: "Department of Justice Canada",
            url: "https://www.justice.gc.ca/eng/fl-df/divorce/index.html"
          }
        ])
      },
      {
        domainId: domainIds.family_law,
        question: "How is child support calculated in Canada?",
        answer: "Child support in Canada is calculated using the Federal Child Support Guidelines, which are based on the paying parent's income, the number of children, and the province where the paying parent lives. The Guidelines establish a table amount that represents the basic costs of raising children. In addition to the table amount, special or extraordinary expenses (such as childcare, healthcare, and education) may be shared proportionally between parents based on their incomes.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["child support", "family law", "guidelines"]),
        relevanceScore: 85,
        sources: JSON.stringify([
          {
            name: "Department of Justice - Child Support",
            url: "https://www.justice.gc.ca/eng/fl-df/child-enfant/index.html"
          }
        ])
      },
      {
        domainId: domainIds.family_law,
        question: "What factors determine child custody decisions in Canada?",
        answer: "Child custody decisions in Canada are made based on the 'best interests of the child' principle. Courts consider factors including: the child's physical, emotional, and psychological safety and wellbeing; the child's relationship with each parent; each parent's willingness to support the child's relationship with the other parent; the child's views and preferences (depending on age and maturity); cultural and religious factors; each parent's parenting abilities and plans; family violence considerations; and stability for the child. Recent amendments to the Divorce Act provide specific factors courts must consider when determining a child's best interests.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["child custody", "best interests", "family law"]),
        relevanceScore: 88,
        sources: JSON.stringify([
          {
            name: "Department of Justice - Custody and Parenting",
            url: "https://www.justice.gc.ca/eng/fl-df/parent/index.html"
          }
        ])
      },
      {
        domainId: domainIds.family_law,
        question: "What is the difference between legal and physical custody?",
        answer: "In Canadian family law, the terms 'legal custody' and 'physical custody' have been largely replaced with concepts of 'decision-making responsibility' and 'parenting time'. Decision-making responsibility (formerly legal custody) refers to the authority to make significant decisions about a child's well-being, including education, healthcare, and religious upbringing. Parenting time (formerly physical custody) refers to the time a child spends in the care of each parent. These arrangements can be sole (one parent) or joint (shared between parents) and are determined based on the best interests of the child.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["custody", "decision-making", "parenting time"]),
        relevanceScore: 82,
        sources: JSON.stringify([
          {
            name: "Department of Justice - Parenting Arrangements",
            url: "https://www.justice.gc.ca/eng/fl-df/parent/ppt-ecppp/index.html"
          }
        ])
      },
      {
        domainId: domainIds.family_law,
        question: "How is property divided after divorce in Canada?",
        answer: "Property division after divorce in Canada is governed by provincial/territorial laws, not federal legislation. Most jurisdictions follow a system of 'equalization of net family property' where the value of property acquired during the marriage is shared equally, regardless of who purchased it or whose name is on the title. The matrimonial home often receives special treatment. Some assets may be excluded, such as gifts, inheritances, and property owned before marriage, though rules vary by province. Quebec follows a different system based on civil law principles.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["property division", "equalization", "family law"]),
        relevanceScore: 84,
        sources: JSON.stringify([
          {
            name: "Department of Justice - Property Division",
            url: "https://www.justice.gc.ca/eng/fl-df/divorce/div.html"
          }
        ])
      }
    ];
    
    // Employment Law knowledge
    const employmentLawItems = [
      {
        domainId: domainIds.employment_law,
        question: "What are the minimum wage rates across Canada?",
        answer: "Minimum wage rates in Canada vary by province and territory and are subject to change. As of 2025, the rates range from approximately $14.00 to $18.00 per hour, with some jurisdictions having different rates for different categories of workers. For the most accurate and current minimum wage information, check with the employment standards office in your specific province or territory, as these rates are typically reviewed and adjusted annually based on various economic factors.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["minimum wage", "employment standards", "compensation"]),
        relevanceScore: 85,
        sources: JSON.stringify([
          {
            name: "Government of Canada - Minimum Wage Database",
            url: "https://www.canada.ca/en/employment-social-development/programs/employment-standards/minimum-wage.html"
          }
        ])
      },
      {
        domainId: domainIds.employment_law,
        question: "What is wrongful dismissal in Canadian employment law?",
        answer: "Wrongful dismissal in Canadian employment law occurs when an employee is terminated without cause and not provided with adequate notice or pay in lieu of notice as required by common law, employment standards legislation, or their employment contract. Unlike 'unjust dismissal' (which questions the grounds for termination), wrongful dismissal primarily concerns whether appropriate notice or compensation was provided. The required notice period depends on factors such as length of service, age, position, and availability of similar employment. Employers can dismiss without notice for 'just cause' involving serious misconduct, but courts interpret this standard strictly.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["wrongful dismissal", "termination", "notice period"]),
        relevanceScore: 88,
        sources: JSON.stringify([
          {
            name: "Supreme Court of Canada - Employment Law Decisions",
            url: "https://scc-csc.lexum.com/scc-csc/en/d/s/index.do"
          }
        ])
      },
      {
        domainId: domainIds.employment_law,
        question: "What is the difference between an employee and an independent contractor?",
        answer: "In Canadian employment law, the distinction between employees and independent contractors is determined by several factors: control (how much direction the employer exercises), ownership of tools/equipment, chance of profit/risk of loss, integration into the business, and exclusivity of the relationship. Employees typically work under the employer's direction, use employer-provided tools, have no profit/loss risk, are integrated into the organization, and often work exclusively for one employer. Independent contractors generally maintain autonomy over their work, use their own tools, bear financial risks, operate as separate businesses, and may work for multiple clients. This distinction affects rights to employment standards protections, tax treatment, and liability issues.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["employment status", "independent contractor", "misclassification"]),
        relevanceScore: 86,
        sources: JSON.stringify([
          {
            name: "Canada Revenue Agency - Employee or Self-employed?",
            url: "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4110/employee-self-employed.html"
          }
        ])
      },
      {
        domainId: domainIds.employment_law,
        question: "What are employers' obligations regarding workplace harassment?",
        answer: "Canadian employers have legal obligations to provide harassment-free workplaces under both occupational health and safety legislation and human rights laws. Employers must: develop and implement harassment prevention policies; establish complaint procedures; investigate complaints promptly and confidentially; take appropriate corrective action when harassment occurs; provide training on policies and procedures; and protect complainants from retaliation. These obligations extend to addressing all forms of harassment, including sexual harassment and discriminatory harassment based on protected grounds. Employers may be held vicariously liable for harassment by employees, particularly by supervisors or managers.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["workplace harassment", "employer obligations", "workplace safety"]),
        relevanceScore: 87,
        sources: JSON.stringify([
          {
            name: "Canadian Human Rights Commission",
            url: "https://www.chrc-ccdp.gc.ca/en/complaints/harassment-workplace"
          }
        ])
      },
      {
        domainId: domainIds.employment_law,
        question: "What are the rules for overtime pay in Canada?",
        answer: "Overtime rules in Canada are governed by provincial/territorial employment standards legislation and vary across jurisdictions. Typically, overtime pay (usually 1.5 times regular wages) is required after 8 hours per day or 40-44 hours per week, depending on the province or territory. Some jurisdictions use only weekly thresholds. Certain occupations may be exempt from standard overtime rules. Employers and employees may also enter into averaging agreements that allow for flexible scheduling while still providing overtime protection. Federally regulated industries (like banking, telecommunications, and interprovincial transportation) follow the Canada Labour Code, which has its own overtime provisions.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["overtime", "employment standards", "compensation"]),
        relevanceScore: 84,
        sources: JSON.stringify([
          {
            name: "Government of Canada - Employment Standards",
            url: "https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards/hours-work.html"
          }
        ])
      }
    ];
    
    // Real Estate Law knowledge
    const realEstateLawItems = [
      {
        domainId: domainIds.real_estate_law,
        question: "What is the home buying process in Canada?",
        answer: "The home buying process in Canada typically involves: determining your budget and getting pre-approved for a mortgage; finding a real estate agent; searching for properties; making an offer with conditions (like home inspection and financing); completing due diligence during the conditional period; removing conditions to firm up the offer; arranging mortgage financing; hiring a lawyer to handle closing; conducting a final property inspection; closing the transaction (typically 30-90 days after the offer is accepted) where you sign documents and pay closing costs; and receiving the keys upon completion. The process may vary slightly by province, particularly regarding legal requirements and tax considerations.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["home buying", "real estate transaction", "property purchase"]),
        relevanceScore: 88,
        sources: JSON.stringify([
          {
            name: "Canada Mortgage and Housing Corporation",
            url: "https://www.cmhc-schl.gc.ca/en/consumers/home-buying/buying-guides/home-buying"
          }
        ])
      },
      {
        domainId: domainIds.real_estate_law,
        question: "What is title insurance and why is it important?",
        answer: "Title insurance in Canada is a policy that protects property owners and lenders against financial loss from defects in title, certain legal issues, and fraudulent claims against property ownership. It covers issues like unknown title defects, existing liens, encroachments, title fraud, survey issues, and problems with previous owners. Unlike other insurance types, title insurance involves a one-time premium and covers issues that occurred before the policy date, providing protection for as long as you own the property. While not mandatory in all provinces, it's often recommended as an alternative or supplement to a traditional lawyer's title opinion, especially given the rise in title fraud cases.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["title insurance", "property ownership", "real estate"]),
        relevanceScore: 82,
        sources: JSON.stringify([
          {
            name: "Financial Consumer Agency of Canada",
            url: "https://www.canada.ca/en/financial-consumer-agency/services/mortgages/title-insurance.html"
          }
        ])
      },
      {
        domainId: domainIds.real_estate_law,
        question: "What are the landlord and tenant laws in Canada?",
        answer: "Landlord-tenant laws in Canada are governed by provincial/territorial residential tenancy legislation. These laws regulate key aspects of the landlord-tenant relationship, including: lease agreements; rent increases (many jurisdictions have limits on frequency and amount); security deposits (rules vary widely); tenant privacy and landlord entry rights; maintenance responsibilities; eviction procedures and grounds; dispute resolution processes; and protections against discrimination. Most jurisdictions have specialized tribunals to handle disputes (like Ontario's Landlord and Tenant Board). While specific rules vary across provinces and territories, all provide certain basic protections for both landlords and tenants, with generally stronger tenant protections in provinces like Ontario, Quebec, and British Columbia.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["landlord tenant", "residential tenancy", "renting"]),
        relevanceScore: 86,
        sources: JSON.stringify([
          {
            name: "Canada Mortgage and Housing Corporation - Renting",
            url: "https://www.cmhc-schl.gc.ca/en/consumers/renting-a-home"
          }
        ])
      },
      {
        domainId: domainIds.real_estate_law,
        question: "What should I know about condominium ownership in Canada?",
        answer: "Condominium ownership in Canada involves purchasing a unit while sharing ownership of common elements with other owners. Key aspects include: provincial/territorial condominium legislation governing rights and responsibilities; condominium corporations managed by elected boards; mandatory monthly maintenance fees covering shared expenses; reserve funds for major repairs; bylaws and rules regulating unit use and modification; insurance requirements (both personal unit insurance and corporation insurance); and special assessment possibilities for unexpected costs. Before purchasing, review the condominium's declaration, bylaws, rules, financial statements, reserve fund study, meeting minutes, and status certificate to understand the corporation's financial health and potential issues.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["condominium", "strata", "property ownership"]),
        relevanceScore: 84,
        sources: JSON.stringify([
          {
            name: "Canada Mortgage and Housing Corporation - Condominiums",
            url: "https://www.cmhc-schl.gc.ca/en/consumers/home-buying/buying-guides/condominium"
          }
        ])
      },
      {
        domainId: domainIds.real_estate_law,
        question: "What taxes are involved in real estate transactions in Canada?",
        answer: "Real estate transactions in Canada involve several potential taxes: land transfer tax (provincial/territorial and sometimes municipal, varying by location and property value; first-time homebuyers may qualify for rebates); property transfer tax (similar to land transfer tax in some jurisdictions); Goods and Services Tax (GST) or Harmonized Sales Tax (HST) on new construction homes or substantially renovated properties (rebates may be available); property taxes (ongoing annual taxes levied by municipalities); capital gains tax on non-principal residences (50% of the gain is taxable at your marginal tax rate); non-resident speculation tax in some jurisdictions; and foreign buyers tax in certain markets like Vancouver and Toronto. Tax rules and rates vary significantly across provinces and territories.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["real estate taxes", "land transfer tax", "property tax"]),
        relevanceScore: 85,
        sources: JSON.stringify([
          {
            name: "Canada Revenue Agency - Real Estate",
            url: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/gst-hst-home-construction.html"
          }
        ])
      }
    ];
    
    // Immigration Law knowledge
    const immigrationLawItems = [
      {
        domainId: domainIds.immigration_law,
        question: "What are the main pathways to permanent residency in Canada?",
        answer: "Canada offers several main pathways to permanent residency: Economic Class programs (Express Entry system managing the Federal Skilled Worker Program, Federal Skilled Trades Program, and Canadian Experience Class; Provincial Nominee Programs; Quebec's immigration programs; Start-up Visa Program; Self-employed Persons Program; and Rural and Northern Immigration Pilot); Family Class sponsorship (for spouses, partners, dependent children, parents, and grandparents); Refugee and humanitarian programs (Government-Assisted Refugee Program, Privately Sponsored Refugee Program, and humanitarian and compassionate grounds applications); and the Atlantic Immigration Program. Each pathway has specific eligibility criteria, application processes, and processing times.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["permanent residency", "immigration pathways", "express entry"]),
        relevanceScore: 90,
        sources: JSON.stringify([
          {
            name: "Immigration, Refugees and Citizenship Canada",
            url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html"
          }
        ])
      },
      {
        domainId: domainIds.immigration_law,
        question: "How does Express Entry work for Canadian immigration?",
        answer: "Express Entry is Canada's application management system for key economic immigration programs. The process involves: creating an Express Entry profile with details on age, education, language skills, work experience, etc.; receiving a Comprehensive Ranking System (CRS) score based on these factors; entering the Express Entry pool where candidates are ranked by CRS score; potentially receiving an Invitation to Apply (ITA) during periodic draws (typically every two weeks) if your score meets the cutoff; submitting a complete permanent residency application within 60 days if invited; and undergoing medical, security, and background checks. Processing time for applications is typically 6-8 months from ITA. Express Entry manages the Federal Skilled Worker Program, Canadian Experience Class, and Federal Skilled Trades Program.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["express entry", "immigration", "CRS score"]),
        relevanceScore: 88,
        sources: JSON.stringify([
          {
            name: "Immigration, Refugees and Citizenship Canada - Express Entry",
            url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/works.html"
          }
        ])
      },
      {
        domainId: domainIds.immigration_law,
        question: "What are Provincial Nominee Programs (PNPs) for Canadian immigration?",
        answer: "Provincial Nominee Programs (PNPs) allow Canadian provinces and territories to select immigrants who meet their specific economic and labor market needs. Each province/territory (except Quebec, which has its own selection system) operates its own PNP with unique streams, eligibility criteria, and application processes. PNPs may target specific occupations, graduates, entrepreneurs, or semi-skilled workers. Nominations can be obtained through Express Entry-linked streams (providing 600 additional CRS points, virtually guaranteeing an ITA) or through base PNP streams (requiring a separate application to IRCC after provincial nomination). PNPs often provide pathways for candidates who may not qualify for Express Entry due to lower CRS scores or ineligibility for federal programs.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["provincial nominee program", "immigration", "regional immigration"]),
        relevanceScore: 86,
        sources: JSON.stringify([
          {
            name: "Immigration, Refugees and Citizenship Canada - Provincial Nominees",
            url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html"
          }
        ])
      },
      {
        domainId: domainIds.immigration_law,
        question: "How can I sponsor a family member to immigrate to Canada?",
        answer: "Canadian citizens and permanent residents can sponsor certain family members for permanent residency through the Family Class immigration program. Eligible relationships include: spouses/common-law/conjugal partners; dependent children (under 22 and unmarried); parents and grandparents (subject to annual application intake limits); and in limited circumstances, orphaned siblings, nephews/nieces, or grandchildren. Sponsors must meet income requirements (except for spouse/partner sponsorship), sign an undertaking to financially support the sponsored person (3-20 years depending on relationship), and be physically present in Canada (except for citizens sponsoring spouses/partners/children). The sponsorship process involves submitting a sponsorship application and the sponsored person's permanent residency application, typically processed together.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["family sponsorship", "immigration", "family class"]),
        relevanceScore: 87,
        sources: JSON.stringify([
          {
            name: "Immigration, Refugees and Citizenship Canada - Family Sponsorship",
            url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship.html"
          }
        ])
      },
      {
        domainId: domainIds.immigration_law,
        question: "What is the difference between a work permit and a study permit in Canada?",
        answer: "Work permits and study permits are temporary resident documents with different purposes and requirements. Work permits authorize foreign nationals to work in Canada temporarily, with types including employer-specific permits (tied to a specific employer, job, and location) and open work permits (allowing work for any employer, with exceptions). Key work permit programs include the Temporary Foreign Worker Program (requiring Labour Market Impact Assessment) and International Mobility Program (LMIA-exempt). Study permits authorize foreign nationals to study at designated learning institutions in Canada. While study permits include limited work authorization (on/off-campus), they're primarily for education. Both permit types have specific eligibility criteria, application processes, and conditions that must be maintained, and neither automatically leads to permanent residency, though pathways exist to transition from temporary to permanent status.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["temporary resident", "work permit", "study permit"]),
        relevanceScore: 85,
        sources: JSON.stringify([
          {
            name: "Immigration, Refugees and Citizenship Canada - Temporary Residents",
            url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html"
          }
        ])
      }
    ];
    
    // Tax Law knowledge
    const taxLawItems = [
      {
        domainId: domainIds.tax_law,
        question: "How does income tax work in Canada?",
        answer: "Canada's income tax system is administered by the Canada Revenue Agency (CRA) and operates on a progressive, self-assessment basis. Income tax consists of two components: federal tax (applied to all Canadians) and provincial/territorial tax (which varies by region). Tax rates increase progressively with income through defined tax brackets. All residents must file annual tax returns by April 30 reporting worldwide income, while non-residents are taxed only on Canadian-source income. The system includes various deductions (reducing taxable income) and tax credits (reducing tax payable). Employment income is subject to source withholdings, while self-employed individuals must remit installment payments. Canada has tax treaties with numerous countries to prevent double taxation on international income.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["income tax", "tax filing", "tax brackets"]),
        relevanceScore: 90,
        sources: JSON.stringify([
          {
            name: "Canada Revenue Agency",
            url: "https://www.canada.ca/en/services/taxes/income-tax.html"
          }
        ])
      },
      {
        domainId: domainIds.tax_law,
        question: "What is the difference between GST, HST, and PST in Canada?",
        answer: "Canada has three main consumption taxes: Goods and Services Tax (GST), Harmonized Sales Tax (HST), and Provincial Sales Tax (PST). GST is a federal 5% tax applied to most goods and services across Canada. HST combines the federal GST with provincial sales tax in participating provinces (Ontario, New Brunswick, Newfoundland and Labrador, Nova Scotia, and Prince Edward Island) with rates ranging from 13-15%. PST is a separate provincial sales tax collected in British Columbia, Saskatchewan, Manitoba, and Quebec (where it's called QST) with rates from 6-9.975%. Alberta has no provincial sales tax, while the territories apply only GST. The taxes differ in administration (HST is administered federally; PST provincially) and in which goods and services are taxable or exempt.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["sales tax", "GST", "HST", "PST"]),
        relevanceScore: 85,
        sources: JSON.stringify([
          {
            name: "Canada Revenue Agency - GST/HST",
            url: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses.html"
          }
        ])
      },
      {
        domainId: domainIds.tax_law,
        question: "What tax deductions and credits are available to Canadian taxpayers?",
        answer: "Canadian taxpayers can access numerous tax deductions and credits, including: deductions like RRSP contributions, childcare expenses, moving expenses, and employment expenses; non-refundable tax credits such as basic personal amount, eligible dependent credit, age amount, pension income amount, disability tax credit, medical expenses, charitable donations, and tuition amounts; refundable tax credits like GST/HST credit, Canada Child Benefit, Climate Action Incentive, and Canada Workers Benefit; provincial/territorial credits that vary by jurisdiction; and specific credits for homebuyers, digital news subscriptions, home accessibility, and home office expenses. Eligibility and amounts change periodically with federal and provincial budgets, so it's important to review the latest information during tax filing season.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["tax deductions", "tax credits", "tax planning"]),
        relevanceScore: 87,
        sources: JSON.stringify([
          {
            name: "Canada Revenue Agency - Deductions, Credits, and Expenses",
            url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses.html"
          }
        ])
      },
      {
        domainId: domainIds.tax_law,
        question: "How are capital gains taxed in Canada?",
        answer: "Capital gains taxation in Canada requires including 50% of capital gains in taxable income, taxed at your marginal rate. Key aspects include: capital gains realized when disposing of capital property (stocks, real estate, etc.) for more than its adjusted cost base; calculation as proceeds minus (adjusted cost base plus outlays and expenses); principal residence exemption eliminating tax on gains from primary homes; lifetime capital gains exemption for qualified small business shares and farm/fishing property (up to specified limits); capital gains deferral strategies like property exchanges, loss harvesting, and prescribed annuities; and deemed disposition rules for gifts, death, or leaving Canada. Foreign property reporting requirements apply for assets over $100,000. Capital gains inside tax-advantaged accounts like TFSAs are tax-free, while unrealized gains (increases in value without selling) aren't taxed until disposition.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["capital gains", "investment taxation", "property tax"]),
        relevanceScore: 86,
        sources: JSON.stringify([
          {
            name: "Canada Revenue Agency - Capital Gains",
            url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-12700-capital-gains.html"
          }
        ])
      },
      {
        domainId: domainIds.tax_law,
        question: "What are the tax implications of being self-employed in Canada?",
        answer: "Self-employment taxation in Canada involves reporting business income and claiming eligible expenses on the T2125 form. Self-employed individuals must: pay both employer and employee portions of Canada Pension Plan (CPP) contributions (9.9% of net business income, subject to annual maximum); make quarterly tax installment payments if annually owing more than $3,000; collect and remit GST/HST if earning over $30,000 annually; maintain detailed records for at least six years; deduct legitimate business expenses including home office costs (if meeting specific criteria), vehicle expenses, supplies, and marketing; track health insurance premiums for potential deduction; consider incorporation benefits if profitable; and potentially register for payroll accounts if hiring employees. Unlike employees, self-employed individuals don't receive Employment Insurance benefits unless enrolling in the voluntary EI program for special benefits.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["self-employment", "business taxation", "tax deductions"]),
        relevanceScore: 88,
        sources: JSON.stringify([
          {
            name: "Canada Revenue Agency - Self-employed",
            url: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships.html"
          }
        ])
      }
    ];
    
    // Business Law knowledge
    const businessLawItems = [
      {
        domainId: domainIds.business_law,
        question: "What are the different business structures in Canada and their legal implications?",
        answer: "Canada has several business structures, each with distinct legal implications: Sole proprietorships (simplest form, no legal separation between owner and business, unlimited personal liability, straightforward taxation as personal income); Partnerships (general partnerships where partners share unlimited liability, limited partnerships with at least one general partner with unlimited liability and limited partners with liability limited to investment, and limited liability partnerships available mainly for professionals); Corporations (separate legal entities from shareholders with limited liability, taxed separately at corporate rates, can be federal or provincial, with more complex formation and compliance requirements); and Cooperatives (democratic organizations owned by members who use its services, with specialized legislation and unique governance requirements). The choice affects taxation, liability, ownership flexibility, capital raising ability, compliance burdens, and continuity of business.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["business structures", "incorporation", "liability"]),
        relevanceScore: 90,
        sources: JSON.stringify([
          {
            name: "Government of Canada - Choose a business structure",
            url: "https://www.canada.ca/en/services/business/start/choose-business-structure.html"
          }
        ])
      },
      {
        domainId: domainIds.business_law,
        question: "What are the key considerations when incorporating a business in Canada?",
        answer: "Key considerations when incorporating a business in Canada include: Jurisdiction (federal or provincial/territorial incorporation, with federal providing nationwide name protection but requiring extra-provincial registration to operate outside incorporating province); Corporate name (must be distinctive, descriptive, and meet legal requirements) or numbered company option; Share structure (classes, voting rights, dividend entitlements, etc.); Ownership restrictions (Canadian ownership requirements in certain sectors); Directors (residency requirements in some jurisdictions); Corporate governance documents (articles, by-laws, shareholder agreements); Taxation considerations (small business deduction eligibility, tax planning opportunities); Business registrations (business number, HST/GST, payroll, etc.); and Ongoing compliance requirements (annual filings, corporate records, etc.). Professional advice from lawyers and accountants is recommended to optimize structure for specific business needs.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["incorporation", "corporate structure", "business registration"]),
        relevanceScore: 88,
        sources: JSON.stringify([
          {
            name: "Corporations Canada",
            url: "https://corporationscanada.ic.gc.ca/eic/site/cd-dgc.nsf/eng/home"
          }
        ])
      },
      {
        domainId: domainIds.business_law,
        question: "What are the legal requirements for business contracts in Canada?",
        answer: "Business contracts in Canada require: offer and acceptance (one party extends an offer, the other accepts without modifications); consideration (something of value exchanged by both parties); legal purpose (contract cannot be for illegal activities); contractual intention (parties intend to create legal obligations); capacity (parties must be legally able to enter contracts); and mutual understanding (parties must agree on essential terms). Contracts are typically binding whether verbal or written, though written contracts provide better evidence and certainty. No witnesses or notarization is generally required for validity (exceptions exist for specific document types). Contracts should clearly identify parties, detail obligations, specify payment terms, include dispute resolution mechanisms, and address termination conditions. Provincial/territorial contract law applies with subtle differences across jurisdictions, particularly in Quebec which follows civil law traditions.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["contracts", "business agreements", "contract law"]),
        relevanceScore: 85,
        sources: JSON.stringify([
          {
            name: "Canadian Encyclopedia - Contract Law",
            url: "https://www.thecanadianencyclopedia.ca/en/article/contract-law"
          }
        ])
      },
      {
        domainId: domainIds.business_law,
        question: "What are the intellectual property protections available to businesses in Canada?",
        answer: "Canada offers several intellectual property protections for businesses: Trademarks (protecting distinctive brands, names, slogans, and designs, registered through CIPO for 10-year renewable terms, or established through common law use); Patents (protecting new inventions and processes for 20 years from filing, requiring novelty, non-obviousness, and utility); Copyright (automatically protecting original literary, artistic, dramatic, and musical works for life of creator plus 70 years); Industrial designs (protecting visual features of manufactured products for up to 15 years); Trade secrets (protecting confidential business information through non-disclosure agreements rather than registration); and Integrated circuit topographies (protecting computer chip layouts for 10 years). Each protection type has specific application procedures, maintenance requirements, and enforcement mechanisms through both administrative actions and court proceedings.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["intellectual property", "patents", "trademarks", "copyright"]),
        relevanceScore: 86,
        sources: JSON.stringify([
          {
            name: "Canadian Intellectual Property Office",
            url: "https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/home"
          }
        ])
      },
      {
        domainId: domainIds.business_law,
        question: "What privacy laws apply to businesses operating in Canada?",
        answer: "Businesses operating in Canada must comply with: PIPEDA (Personal Information Protection and Electronic Documents Act) or substantially similar provincial legislation (British Columbia, Alberta, and Quebec), governing the collection, use, and disclosure of personal information in commercial activities; Provincial privacy legislation for employee information in provincially-regulated organizations; Consumer privacy legislation (particularly Quebec's Bill 64, imposing enhanced requirements); Sector-specific legislation for healthcare, banking, and telecommunications; Anti-spam legislation (CASL) regulating commercial electronic messages; and breach notification requirements. Compliance entails obtaining meaningful consent, limiting collection to necessary information, implementing security safeguards, providing access/correction rights, being transparent about practices, and reporting serious breaches. The Office of the Privacy Commissioner of Canada and provincial counterparts enforce these laws through investigations, audits, and compliance orders.",
        language: "en",
        jurisdiction: "canada",
        tags: JSON.stringify(["privacy law", "PIPEDA", "data protection"]),
        relevanceScore: 87,
        sources: JSON.stringify([
          {
            name: "Office of the Privacy Commissioner of Canada",
            url: "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/"
          }
        ])
      }
    ];
    
    async function insertKnowledgeItems(items) {
      for (const item of items) {
        await client.query(
          `INSERT INTO domain_knowledge
           (domain_id, question, answer, language, jurisdiction, tags, relevance_score, sources, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [
            item.domainId,
            item.question,
            item.answer,
            item.language,
            item.jurisdiction,
            item.tags,
            item.relevanceScore,
            item.sources
          ]
        );
        console.log(`Inserted knowledge item: "${item.question}"`);
      }
    }
    
    // Insert all knowledge items
    await insertKnowledgeItems(familyLawItems);
    await insertKnowledgeItems(employmentLawItems);
    await insertKnowledgeItems(realEstateLawItems);
    await insertKnowledgeItems(immigrationLawItems);
    await insertKnowledgeItems(taxLawItems);
    await insertKnowledgeItems(businessLawItems);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Successfully populated legal knowledge base.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error populating legal knowledge base:', error);
  } finally {
    client.release();
  }
}

// Run the function
populateLegalKnowledgeBase().catch(console.error);