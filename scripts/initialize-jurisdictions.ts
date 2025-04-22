import { db } from "../server/db";
import {
  provincialJurisdictions, 
  legalRequirements, 
  insertProvincialJurisdictionSchema,
  insertLegalRequirementSchema
} from "../shared/schema";
import { sql } from "drizzle-orm";

async function initializeJurisdictions() {
  console.log("Initializing jurisdictions data...");

  try {
    // Check if tables exist and create them if they don't
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS provincial_jurisdictions (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        legal_system TEXT NOT NULL DEFAULT 'common_law',
        official_languages JSONB NOT NULL DEFAULT '["en"]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS legal_requirements (
        id SERIAL PRIMARY KEY,
        jurisdiction_id INTEGER REFERENCES provincial_jurisdictions(id) ON DELETE CASCADE,
        legal_category TEXT NOT NULL,
        subcategory TEXT NOT NULL,
        requirement TEXT NOT NULL,
        description TEXT NOT NULL,
        statute_reference TEXT,
        last_updated TIMESTAMP NOT NULL,
        effective_date TIMESTAMP,
        expiry_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS jurisdiction_comparisons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        legal_category TEXT NOT NULL,
        subcategory TEXT NOT NULL,
        jurisdictions JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        notes TEXT,
        is_public BOOLEAN DEFAULT FALSE
      )
    `);

    // Seed provinces data
    const provinces = [
      {
        code: "ON",
        name: "Ontario",
        fullName: "Province of Ontario",
        legalSystem: "common_law",
        officialLanguages: ["en", "fr"],
        updatedAt: new Date(),
      },
      {
        code: "QC",
        name: "Quebec",
        fullName: "Province of Quebec",
        legalSystem: "civil_law",
        officialLanguages: ["fr", "en"],
        updatedAt: new Date(),
      },
      {
        code: "BC",
        name: "British Columbia",
        fullName: "Province of British Columbia",
        legalSystem: "common_law",
        officialLanguages: ["en"],
        updatedAt: new Date(),
      },
      {
        code: "AB",
        name: "Alberta",
        fullName: "Province of Alberta",
        legalSystem: "common_law",
        officialLanguages: ["en"],
        updatedAt: new Date(),
      },
      {
        code: "MB",
        name: "Manitoba",
        fullName: "Province of Manitoba",
        legalSystem: "common_law",
        officialLanguages: ["en", "fr"],
        updatedAt: new Date(),
      },
      {
        code: "SK",
        name: "Saskatchewan",
        fullName: "Province of Saskatchewan",
        legalSystem: "common_law",
        officialLanguages: ["en"],
        updatedAt: new Date(),
      },
      {
        code: "NS",
        name: "Nova Scotia",
        fullName: "Province of Nova Scotia",
        legalSystem: "common_law",
        officialLanguages: ["en"],
        updatedAt: new Date(),
      },
      {
        code: "NB",
        name: "New Brunswick",
        fullName: "Province of New Brunswick",
        legalSystem: "common_law",
        officialLanguages: ["en", "fr"],
        updatedAt: new Date(),
      },
      {
        code: "NL",
        name: "Newfoundland and Labrador",
        fullName: "Province of Newfoundland and Labrador",
        legalSystem: "common_law",
        officialLanguages: ["en"],
        updatedAt: new Date(),
      },
      {
        code: "PE",
        name: "Prince Edward Island",
        fullName: "Province of Prince Edward Island",
        legalSystem: "common_law",
        officialLanguages: ["en"],
        updatedAt: new Date(),
      },
      {
        code: "YT",
        name: "Yukon",
        fullName: "Yukon Territory",
        legalSystem: "common_law",
        officialLanguages: ["en", "fr"],
        updatedAt: new Date(),
      },
      {
        code: "NT",
        name: "Northwest Territories",
        fullName: "Northwest Territories",
        legalSystem: "common_law",
        officialLanguages: ["en", "fr"],
        updatedAt: new Date(),
      },
      {
        code: "NU",
        name: "Nunavut",
        fullName: "Territory of Nunavut",
        legalSystem: "common_law",
        officialLanguages: ["en", "fr", "iu"],
        updatedAt: new Date(),
      },
    ];

    // Insert provinces one by one to get their IDs
    for (const province of provinces) {
      // Check if province already exists
      const existingProvince = await db.select().from(provincialJurisdictions).where(sql`code = ${province.code}`);
      
      if (existingProvince.length === 0) {
        const parsed = insertProvincialJurisdictionSchema.parse(province);
        await db.insert(provincialJurisdictions).values(parsed);
        console.log(`Added province: ${province.name}`);
      } else {
        console.log(`Province ${province.name} already exists, skipping...`);
      }
    }

    // Add sample legal requirements for family law category
    const familyLawRequirements = [
      // Ontario divorce requirements
      {
        jurisdiction: "ON",
        category: "family_law",
        subcategory: "divorce",
        requirements: [
          {
            requirement: "Separation Period",
            description: "Spouses must be separated for at least 1 year, or prove adultery or cruelty.",
            statute: "Divorce Act, R.S.C. 1985, c. 3 (2nd Supp.), s. 8(1) and (2)"
          },
          {
            requirement: "Residency",
            description: "At least one spouse must have been ordinarily resident in the province for at least one year immediately preceding the application.",
            statute: "Divorce Act, R.S.C. 1985, c. 3 (2nd Supp.), s. 3(1)"
          },
          {
            requirement: "Filing Location",
            description: "Application must be filed with the Superior Court of Justice (Family Court Branch).",
            statute: "Family Law Rules, O. Reg. 114/99"
          }
        ]
      },
      // Quebec divorce requirements
      {
        jurisdiction: "QC",
        category: "family_law",
        subcategory: "divorce",
        requirements: [
          {
            requirement: "Separation Period",
            description: "Spouses must be separated for at least 1 year, or prove adultery or cruelty.",
            statute: "Divorce Act, R.S.C. 1985, c. 3 (2nd Supp.), s. 8(1) and (2)"
          },
          {
            requirement: "Residency",
            description: "At least one spouse must have been ordinarily resident in the province for at least one year immediately preceding the application.",
            statute: "Divorce Act, R.S.C. 1985, c. 3 (2nd Supp.), s. 3(1)"
          },
          {
            requirement: "Filing Location",
            description: "Application must be filed with the Superior Court of Quebec.",
            statute: "Code of Civil Procedure, C.Q.L.R. c. C-25.01"
          },
          {
            requirement: "No-Fault Option",
            description: "Spouses can jointly apply for divorce after completing a joint agreement on corollary measures.",
            statute: "Civil Code of Quebec, C.Q.L.R. c. CCQ-1991, art. 518"
          }
        ]
      },
      // British Columbia divorce requirements
      {
        jurisdiction: "BC",
        category: "family_law",
        subcategory: "divorce",
        requirements: [
          {
            requirement: "Separation Period",
            description: "Spouses must be separated for at least 1 year, or prove adultery or cruelty.",
            statute: "Divorce Act, R.S.C. 1985, c. 3 (2nd Supp.), s. 8(1) and (2)"
          },
          {
            requirement: "Residency",
            description: "At least one spouse must have been ordinarily resident in the province for at least one year immediately preceding the application.",
            statute: "Divorce Act, R.S.C. 1985, c. 3 (2nd Supp.), s. 3(1)"
          },
          {
            requirement: "Filing Location",
            description: "Application must be filed with the Supreme Court of British Columbia.",
            statute: "Supreme Court Family Rules, B.C. Reg. 169/2009"
          },
          {
            requirement: "Notice of Family Claim",
            description: "Divorce proceedings are started by filing a Notice of Family Claim (Form F3).",
            statute: "Supreme Court Family Rules, B.C. Reg. 169/2009, Rule 3-1"
          }
        ]
      }
    ];

    // Add sample child custody requirements
    const childCustodyRequirements = [
      // Ontario
      {
        jurisdiction: "ON",
        category: "family_law",
        subcategory: "child_custody",
        requirements: [
          {
            requirement: "Best Interests of the Child Standard",
            description: "All decisions relating to custody and access must be made in accordance with the best interests of the child.",
            statute: "Children's Law Reform Act, R.S.O. 1990, c. C.12, s. 24"
          },
          {
            requirement: "Parenting Time and Decision-Making Responsibility",
            description: "The terms 'custody' and 'access' have been replaced with 'decision-making responsibility' and 'parenting time'.",
            statute: "Divorce Act, R.S.C. 1985, c. 3 (2nd Supp.), as amended March 1, 2021"
          },
          {
            requirement: "Parenting Plan",
            description: "Parents are encouraged to create a parenting plan that outlines how decisions will be made and how time with the children will be shared.",
            statute: "Children's Law Reform Act, R.S.O. 1990, c. C.12"
          }
        ]
      },
      // Quebec
      {
        jurisdiction: "QC",
        category: "family_law",
        subcategory: "child_custody",
        requirements: [
          {
            requirement: "Joint Parental Authority",
            description: "Both parents maintain parental authority (legal custody) regardless of physical custody arrangements, unless a court orders otherwise.",
            statute: "Civil Code of Quebec, C.Q.L.R. c. CCQ-1991, art. 600"
          },
          {
            requirement: "Best Interests of the Child Standard",
            description: "All decisions relating to custody must be made in accordance with the best interests of the child.",
            statute: "Civil Code of Quebec, C.Q.L.R. c. CCQ-1991, art. 33"
          },
          {
            requirement: "Access Rights",
            description: "The non-custodial parent maintains the right to maintain personal relationships with the child and to supervise their maintenance and education.",
            statute: "Civil Code of Quebec, C.Q.L.R. c. CCQ-1991, art. 606"
          }
        ]
      },
      // British Columbia
      {
        jurisdiction: "BC",
        category: "family_law",
        subcategory: "child_custody",
        requirements: [
          {
            requirement: "Parental Responsibilities and Parenting Time",
            description: "BC uses the terms 'parental responsibilities' and 'parenting time' instead of 'custody' and 'access'.",
            statute: "Family Law Act, S.B.C. 2011, c. 25, s. 40-42"
          },
          {
            requirement: "Best Interests of the Child Only Consideration",
            description: "The best interests of the child is the only consideration when making parenting arrangements.",
            statute: "Family Law Act, S.B.C. 2011, c. 25, s. 37"
          },
          {
            requirement: "Family Violence Consideration",
            description: "The court must consider the impact of family violence on the child's safety and well-being when determining parenting arrangements.",
            statute: "Family Law Act, S.B.C. 2011, c. 25, s. 38"
          }
        ]
      }
    ];

    // Add requirements to the database
    async function addRequirements(requirementsData) {
      for (const data of requirementsData) {
        // Find the jurisdiction ID
        const [jurisdiction] = await db.select().from(provincialJurisdictions).where(sql`code = ${data.jurisdiction}`);
        
        if (!jurisdiction) {
          console.log(`Jurisdiction ${data.jurisdiction} not found, skipping...`);
          continue;
        }

        // Add each requirement
        for (const req of data.requirements) {
          const requirement = {
            jurisdictionId: jurisdiction.id,
            legalCategory: data.category,
            subcategory: data.subcategory,
            requirement: req.requirement,
            description: req.description,
            statuteReference: req.statute,
            lastUpdated: new Date(),
            effectiveDate: new Date(),
            expiryDate: null,
          };

          // Check if requirement already exists
          const existingReq = await db.select().from(legalRequirements).where(sql`
            jurisdiction_id = ${requirement.jurisdictionId} AND 
            legal_category = ${requirement.legalCategory} AND 
            subcategory = ${requirement.subcategory} AND 
            requirement = ${requirement.requirement}
          `);

          if (existingReq.length === 0) {
            const parsed = insertLegalRequirementSchema.parse(requirement);
            await db.insert(legalRequirements).values(parsed);
            console.log(`Added requirement: ${req.requirement} for ${data.jurisdiction} - ${data.subcategory}`);
          } else {
            console.log(`Requirement already exists, skipping...`);
          }
        }
      }
    }

    // Add all requirement sets
    await addRequirements(familyLawRequirements);
    await addRequirements(childCustodyRequirements);

    console.log("Jurisdictions initialization completed successfully.");
  } catch (error) {
    console.error("Error initializing jurisdictions:", error);
  }
}

initializeJurisdictions()
  .then(() => {
    console.log("Script execution complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
  });