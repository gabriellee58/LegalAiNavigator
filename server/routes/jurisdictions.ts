import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { eq, and } from "drizzle-orm";
import { provincialJurisdictions, legalRequirements } from "@shared/schema";

const router = Router();

// Get all provincial jurisdictions
router.get("/provinces", async (_req: Request, res: Response) => {
  try {
    const provinces = await storage.db
      .select({
        code: provincialJurisdictions.code,
        name: provincialJurisdictions.name,
        system: provincialJurisdictions.legalSystem,
      })
      .from(provincialJurisdictions)
      .orderBy(provincialJurisdictions.name);

    res.json(provinces);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    res.status(500).json({ message: "Error fetching provincial jurisdictions" });
  }
});

// Get legal requirements by category, subcategory, and provinces
router.get("/requirements", async (req: Request, res: Response) => {
  try {
    const { category, subcategory, provinces } = req.query;

    if (!category || !subcategory || !provinces) {
      return res.status(400).json({ 
        message: "Missing required parameters: category, subcategory, and provinces"
      });
    }

    // Parse comma-separated provinces
    const provincesList = (provinces as string).split(',');
    
    // Create a result object with the same structure as the mock data
    const result: {
      [provinceCode: string]: {
        requirements: {
          title: string;
          description: string;
          statute: string;
        }[];
      };
    } = {};

    // For each province, fetch the requirements
    for (const provinceCode of provincesList) {
      const province = await storage.db
        .select()
        .from(provincialJurisdictions)
        .where(eq(provincialJurisdictions.code, provinceCode))
        .limit(1);

      if (province.length === 0) {
        continue; // Skip if province not found
      }

      // Get requirements for this province, category, and subcategory
      const requirements = await storage.db
        .select({
          requirement: legalRequirements.requirement,
          description: legalRequirements.description,
          statuteReference: legalRequirements.statuteReference,
        })
        .from(legalRequirements)
        .where(
          and(
            eq(legalRequirements.jurisdictionId, province[0].id),
            eq(legalRequirements.legalCategory, category as string),
            eq(legalRequirements.subcategory, subcategory as string)
          )
        );

      // Map to expected format
      result[provinceCode] = {
        requirements: requirements.map(req => ({
          title: req.requirement,
          description: req.description,
          statute: req.statuteReference || "N/A",
        })),
      };
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    res.status(500).json({ message: "Error fetching legal requirements" });
  }
});

// Save a comparison (requires authentication)
router.post("/save-comparison", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      category, 
      subcategory, 
      provinces,
      description = ""
    } = req.body;

    if (!title || !category || !subcategory || !provinces || !Array.isArray(provinces)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userId = req.user!.id;

    // Save the comparison
    const savedComparison = await storage.saveJurisdictionComparison({
      userId,
      title,
      description,
      legalCategory: category,
      subcategory,
      jurisdictions: provinces,
      isPublic: false
    });

    res.status(201).json(savedComparison);
  } catch (error) {
    console.error("Error saving comparison:", error);
    res.status(500).json({ message: "Error saving comparison" });
  }
});

// Get user's saved comparisons
router.get("/saved-comparisons", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const savedComparisons = await storage.getUserJurisdictionComparisons(userId);
    res.json(savedComparisons);
  } catch (error) {
    console.error("Error fetching saved comparisons:", error);
    res.status(500).json({ message: "Error fetching saved comparisons" });
  }
});

// Get available legal categories
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    // Fetch distinct categories from legal requirements table
    const categories = await storage.db
      .selectDistinct({ 
        legalCategory: legalRequirements.legalCategory 
      })
      .from(legalRequirements)
      .orderBy(legalRequirements.legalCategory);
    
    // Format response
    const formattedCategories = categories.map(cat => ({
      id: cat.legalCategory,
      name: formatCategoryName(cat.legalCategory)
    }));
    
    res.json(formattedCategories);
  } catch (error) {
    console.error("Error fetching legal categories:", error);
    res.status(500).json({ message: "Error fetching legal categories" });
  }
});

// Get subcategories for a specific category
router.get("/subcategories/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    
    // Fetch distinct subcategories for this category
    const subcategories = await storage.db
      .selectDistinct({ 
        subcategory: legalRequirements.subcategory 
      })
      .from(legalRequirements)
      .where(eq(legalRequirements.legalCategory, category))
      .orderBy(legalRequirements.subcategory);
    
    // Format response
    const formattedSubcategories = subcategories.map(sub => ({
      id: sub.subcategory,
      name: formatCategoryName(sub.subcategory)
    }));
    
    res.json(formattedSubcategories);
  } catch (error) {
    console.error(`Error fetching subcategories for ${req.params.category}:`, error);
    res.status(500).json({ message: "Error fetching subcategories" });
  }
});

// Helper function to format category IDs into readable names
function formatCategoryName(categoryId: string): string {
  return categoryId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default router;