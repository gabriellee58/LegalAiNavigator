import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { isAuthenticated } from '../auth';
import { analyzeComplianceWithAI } from '../lib/complianceService';
import { db } from '../db';
import { complianceChecks } from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

// Set up multer for file uploads with more flexible file type validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for document uploads
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept PDFs, common document formats, and images
  const allowedMimeTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp',
    // Others
    'application/rtf',
    'application/json',
    'text/csv'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents and images are allowed.'));
  }
};

// Configure multer with storage and file size limits
const upload = multer({
  storage,
  limits: {
    fileSize: (config.MAX_UPLOAD_SIZE_MB || 10) * 1024 * 1024, // Default 10MB
  },
  fileFilter
});

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
complianceRouter.post('/check', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
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

    // Save the compliance check results to database
    try {
      // Make sure the score is converted to an integer
      const score = typeof complianceResult.score === 'number' 
        ? Math.round(complianceResult.score) 
        : 0;
        
      await db.insert(complianceChecks).values({
        userId: userId,
        businessType,
        jurisdiction,
        description,
        complianceArea: 'general', // Default area
        checkResults: complianceResult,
        score: score,
        status: complianceResult.status || 'needs_attention',
        completed: true
      });
      
      console.log(`Compliance check saved to database for user ${userId}`);
    } catch (error) {
      const dbError = error as Error;
      console.error("Error saving compliance check to database:", dbError.message);
      console.error(dbError.stack || dbError);
      // Continue with the response even if there was a database error
    }
    
    // Ensure we have a valid JSON response
    return res.status(201).json({
      success: true,
      data: complianceResult
    });
  } catch (error) {
    console.error("Compliance check error:", error);
    return res.status(500).json({ 
      message: "An error occurred while analyzing compliance. Please try again later."
    });
  }
}));

// Get compliance history for the current user
complianceRouter.get('/history', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    
    // Get compliance check history from database
    const history = await db.select({
      id: complianceChecks.id,
      businessType: complianceChecks.businessType,
      jurisdiction: complianceChecks.jurisdiction,
      score: complianceChecks.score,
      status: complianceChecks.status,
      createdAt: complianceChecks.createdAt,
      description: complianceChecks.description,
      complianceArea: complianceChecks.complianceArea,
    })
    .from(complianceChecks)
    .where(eq(complianceChecks.userId, userId))
    .orderBy(desc(complianceChecks.createdAt));
    
    // Always return an array, even if empty
    return res.json(history || []);
  } catch (err) {
    const error = err as Error;
    console.error("Error fetching compliance history:", error.message);
    console.error(error.stack || error);
    return res.status(500).json({
      message: "An error occurred while fetching compliance history"
    });
  }
}));

export default complianceRouter;