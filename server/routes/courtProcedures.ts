import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { db } from '../db';
import { eq, and, isNull } from 'drizzle-orm';
import { 
  courtProcedureCategories, 
  courtProcedures, 
  courtProcedureSteps,
  userCourtProcedures
} from '@shared/schema';

const router = Router();

// Get all court procedure categories
router.get("/categories", asyncHandler(async (req: Request, res: Response) => {
  const categories = await db.query.courtProcedureCategories.findMany({
    where: eq(courtProcedureCategories.isActive, true),
    orderBy: courtProcedureCategories.order
  });
  
  res.json(categories);
}));

// Get a specific category by slug
router.get("/categories/:slug", asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  
  const [category] = await db
    .select()
    .from(courtProcedureCategories)
    .where(
      and(
        eq(courtProcedureCategories.slug, slug),
        eq(courtProcedureCategories.isActive, true)
      )
    );
  
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  res.json(category);
}));

// Get procedures for a specific category
router.get("/categories/:categoryId/procedures", asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  
  const procedures = await db
    .select()
    .from(courtProcedures)
    .where(
      and(
        eq(courtProcedures.categoryId, parseInt(categoryId)),
        eq(courtProcedures.isActive, true)
      )
    );
  
  res.json(procedures);
}));

// Get a specific procedure with its steps
router.get("/procedures/:id", asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const [procedure] = await db
    .select()
    .from(courtProcedures)
    .where(eq(courtProcedures.id, parseInt(id)));
  
  if (!procedure) {
    return res.status(404).json({ message: 'Procedure not found' });
  }
  
  const steps = await db
    .select()
    .from(courtProcedureSteps)
    .where(eq(courtProcedureSteps.procedureId, procedure.id))
    .orderBy(courtProcedureSteps.stepOrder);
  
  res.json({
    ...procedure,
    steps
  });
}));

// Get all user's court procedures
router.get("/user", asyncHandler(async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userProcedures = await db
    .select()
    .from(userCourtProcedures)
    .where(eq(userCourtProcedures.userId, req.user.id))
    .orderBy(userCourtProcedures.lastActivityAt, 'desc');
  
  res.json(userProcedures);
}));

// Create a new user court procedure
router.post("/user", asyncHandler(async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { procedureId, title, notes } = req.body;
  
  if (!procedureId || !title) {
    return res.status(400).json({ message: 'Procedure ID and title are required' });
  }
  
  // Get the first step of the procedure
  const [firstStep] = await db
    .select()
    .from(courtProcedureSteps)
    .where(eq(courtProcedureSteps.procedureId, procedureId))
    .orderBy(courtProcedureSteps.stepOrder)
    .limit(1);
  
  if (!firstStep) {
    return res.status(404).json({ message: 'Procedure steps not found' });
  }
  
  const [newUserProcedure] = await db
    .insert(userCourtProcedures)
    .values({
      userId: req.user.id,
      procedureId: procedureId,
      currentStepId: firstStep.id,
      title: title,
      notes: notes || null,
      status: 'active',
      progress: 0,
      completedSteps: JSON.stringify([]),
      startedAt: new Date(),
      lastActivityAt: new Date(),
      expectedCompletionDate: null,
      completedAt: null,
      caseSpecificData: null
    })
    .returning();
  
  res.status(201).json(newUserProcedure);
}));

// Get a specific user court procedure
router.get("/user/:id", asyncHandler(async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.params;
  
  const [userProcedure] = await db
    .select()
    .from(userCourtProcedures)
    .where(
      and(
        eq(userCourtProcedures.id, parseInt(id)),
        eq(userCourtProcedures.userId, req.user.id)
      )
    );
  
  if (!userProcedure) {
    return res.status(404).json({ message: 'User procedure not found' });
  }
  
  // Get the procedure details
  const [procedure] = await db
    .select()
    .from(courtProcedures)
    .where(eq(courtProcedures.id, userProcedure.procedureId));
  
  // Get all steps for this procedure
  const steps = await db
    .select()
    .from(courtProcedureSteps)
    .where(eq(courtProcedureSteps.procedureId, userProcedure.procedureId))
    .orderBy(courtProcedureSteps.stepOrder);
  
  // Get the current step
  const [currentStep] = await db
    .select()
    .from(courtProcedureSteps)
    .where(eq(courtProcedureSteps.id, userProcedure.currentStepId));
  
  res.json({
    ...userProcedure,
    procedure,
    steps,
    currentStep
  });
}));

// Update a user court procedure (progress, current step, etc.)
router.patch("/user/:id", asyncHandler(async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.params;
  const { 
    currentStepId, 
    status, 
    progress, 
    completedSteps, 
    notes, 
    expectedCompletionDate,
    completedAt,
    caseSpecificData
  } = req.body;
  
  // Verify the user owns this procedure
  const [existingProcedure] = await db
    .select()
    .from(userCourtProcedures)
    .where(
      and(
        eq(userCourtProcedures.id, parseInt(id)),
        eq(userCourtProcedures.userId, req.user.id)
      )
    );
  
  if (!existingProcedure) {
    return res.status(404).json({ message: 'User procedure not found' });
  }
  
  const updateData: Partial<typeof userCourtProcedures.$inferInsert> = {
    lastActivityAt: new Date()
  };
  
  if (currentStepId !== undefined) updateData.currentStepId = currentStepId;
  if (status !== undefined) updateData.status = status;
  if (progress !== undefined) updateData.progress = progress;
  if (completedSteps !== undefined) updateData.completedSteps = completedSteps;
  if (notes !== undefined) updateData.notes = notes;
  if (expectedCompletionDate !== undefined) updateData.expectedCompletionDate = expectedCompletionDate ? new Date(expectedCompletionDate) : null;
  if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;
  if (caseSpecificData !== undefined) updateData.caseSpecificData = caseSpecificData;
  
  // If status is set to 'completed', set completedAt to current time if not provided
  if (status === 'completed' && completedAt === undefined) {
    updateData.completedAt = new Date();
  }
  
  const [updatedProcedure] = await db
    .update(userCourtProcedures)
    .set(updateData)
    .where(eq(userCourtProcedures.id, parseInt(id)))
    .returning();
  
  res.json(updatedProcedure);
}));

// Delete a user court procedure
router.delete("/user/:id", asyncHandler(async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.params;
  
  // Verify the user owns this procedure
  const [existingProcedure] = await db
    .select()
    .from(userCourtProcedures)
    .where(
      and(
        eq(userCourtProcedures.id, parseInt(id)),
        eq(userCourtProcedures.userId, req.user.id)
      )
    );
  
  if (!existingProcedure) {
    return res.status(404).json({ message: 'User procedure not found' });
  }
  
  await db
    .delete(userCourtProcedures)
    .where(eq(userCourtProcedures.id, parseInt(id)));
  
  res.status(204).end();
}));

export default router;