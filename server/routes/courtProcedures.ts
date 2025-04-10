import { Router, Request, Response } from "express";
import { db } from "../db";
import { 
  courtProcedureCategories, 
  courtProcedures,
  courtProcedureSteps,
  userCourtProcedures,
  insertCourtProcedureCategorySchema,
  insertCourtProcedureSchema,
  insertCourtProcedureStepSchema,
  insertUserCourtProcedureSchema 
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler";
import { isAuthenticated } from "../auth";
import { z } from "zod";

const router = Router();

// Get all court procedure categories
router.get("/categories", asyncHandler(async (req: Request, res: Response) => {
  const categories = await db.select().from(courtProcedureCategories)
    .where(eq(courtProcedureCategories.isActive, true))
    .orderBy(courtProcedureCategories.order);
  
  res.json(categories);
}));

// Get a specific court procedure category by slug
router.get("/categories/:slug", asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  
  const [category] = await db.select().from(courtProcedureCategories)
    .where(and(
      eq(courtProcedureCategories.slug, slug),
      eq(courtProcedureCategories.isActive, true)
    ));
  
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  
  res.json(category);
}));

// Get all procedures for a category
router.get("/categories/:categoryId/procedures", asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  
  const procedures = await db.select().from(courtProcedures)
    .where(and(
      eq(courtProcedures.categoryId, parseInt(categoryId)),
      eq(courtProcedures.isActive, true)
    ));
  
  res.json(procedures);
}));

// Get a specific procedure with steps
router.get("/procedures/:id", asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const [procedure] = await db.select().from(courtProcedures)
    .where(eq(courtProcedures.id, parseInt(id)));
  
  if (!procedure) {
    return res.status(404).json({ message: "Procedure not found" });
  }
  
  // Get all steps for this procedure
  const steps = await db.select().from(courtProcedureSteps)
    .where(eq(courtProcedureSteps.procedureId, procedure.id))
    .orderBy(courtProcedureSteps.stepOrder);
  
  res.json({
    ...procedure,
    steps
  });
}));

// User endpoints (requires authentication)
router.use(isAuthenticated);

// Get all user court procedures
router.get("/user", asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const userProcedures = await db.select().from(userCourtProcedures)
    .where(eq(userCourtProcedures.userId, req.user.id));
  
  res.json(userProcedures);
}));

// Create a new user court procedure
router.post("/user", asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const validatedData = insertUserCourtProcedureSchema.parse({
    ...req.body,
    userId: req.user.id
  });
  
  const [newUserProcedure] = await db.insert(userCourtProcedures)
    .values(validatedData)
    .returning();
  
  res.status(201).json(newUserProcedure);
}));

// Get a specific user court procedure
router.get("/user/:id", asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const { id } = req.params;
  
  const [userProcedure] = await db.select().from(userCourtProcedures)
    .where(and(
      eq(userCourtProcedures.id, parseInt(id)),
      eq(userCourtProcedures.userId, req.user.id)
    ));
  
  if (!userProcedure) {
    return res.status(404).json({ message: "User procedure not found" });
  }
  
  // Get procedure details
  const [procedure] = await db.select().from(courtProcedures)
    .where(eq(courtProcedures.id, userProcedure.procedureId as number));
  
  // Get current step details if any
  let currentStep = null;
  if (userProcedure.currentStepId) {
    const [step] = await db.select().from(courtProcedureSteps)
      .where(eq(courtProcedureSteps.id, userProcedure.currentStepId));
    currentStep = step;
  }
  
  res.json({
    ...userProcedure,
    procedure,
    currentStep
  });
}));

// Update a user court procedure
router.patch("/user/:id", asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const { id } = req.params;
  
  // Check if the user procedure exists and belongs to the user
  const [userProcedure] = await db.select().from(userCourtProcedures)
    .where(and(
      eq(userCourtProcedures.id, parseInt(id)),
      eq(userCourtProcedures.userId, req.user.id)
    ));
  
  if (!userProcedure) {
    return res.status(404).json({ message: "User procedure not found" });
  }
  
  // Validate update data
  const updateSchema = z.object({
    currentStepId: z.number().optional(),
    status: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
    notes: z.string().optional(),
    completedSteps: z.array(z.number()).optional(),
    expectedCompletionDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    completedAt: z.string().optional().transform(val => val ? new Date(val) : undefined),
    caseSpecificData: z.any().optional(),
  });
  
  const validatedData = updateSchema.parse(req.body);
  
  // Update the user procedure
  const [updatedUserProcedure] = await db.update(userCourtProcedures)
    .set({
      ...validatedData,
      lastActivityAt: new Date()
    })
    .where(eq(userCourtProcedures.id, parseInt(id)))
    .returning();
  
  res.json(updatedUserProcedure);
}));

// Delete a user court procedure
router.delete("/user/:id", asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const { id } = req.params;
  
  // Check if the user procedure exists and belongs to the user
  const [userProcedure] = await db.select().from(userCourtProcedures)
    .where(and(
      eq(userCourtProcedures.id, parseInt(id)),
      eq(userCourtProcedures.userId, req.user.id)
    ));
  
  if (!userProcedure) {
    return res.status(404).json({ message: "User procedure not found" });
  }
  
  await db.delete(userCourtProcedures)
    .where(eq(userCourtProcedures.id, parseInt(id)));
  
  res.status(204).end();
}));

export default router;