import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { getCurrentUser } from '../middleware/auth';
import { analyzeComplianceWithAI } from '../lib/complianceService';

const complianceRouter = Router();

// Define validation schema for compliance check request
const complianceCheckSchema = z.object({
  businessType: z.string().min(1, "Business type is required"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  description: z.string().optional(),
  documents: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    content: z.string().optional()
  })).optional()
});

// Endpoint to check business compliance
complianceRouter.post('/check', getCurrentUser, asyncHandler(async (req, res) => {
  // Validate request body
  const validationResult = complianceCheckSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ 
      message: "Invalid request data",
      errors: validationResult.error.format() 
    });
  }

  const { businessType, jurisdiction, description, documents = [] } = validationResult.data;
  const userId = req.user?.id;

  try {
    // Call the AI service to analyze compliance
    const complianceResult = await analyzeComplianceWithAI({
      businessType,
      jurisdiction,
      description,
      documents,
      userId
    });

    // Return the compliance analysis result
    return res.status(201).json(complianceResult);
  } catch (error) {
    console.error("Compliance check error:", error);
    return res.status(500).json({ 
      message: "An error occurred while analyzing compliance. Please try again later."
    });
  }
}));

// Get compliance history for the current user
complianceRouter.get('/history', getCurrentUser, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  // Get compliance check history from database (to be implemented)
  const history = []; // Replace with actual database query
  
  return res.json(history);
}));

export default complianceRouter;