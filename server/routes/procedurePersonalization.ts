import express from 'express';
import { db } from '@server/db';
import { 
  userProcedureNotes, userProcedureReminders, 
  userProcedureChecklist, userProcedureDocuments,
  insertUserProcedureNoteSchema, insertUserProcedureReminderSchema,
  insertUserProcedureChecklistItemSchema, insertUserProcedureDocumentSchema
} from '@shared/schema-procedure-extensions';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '@server/utils/asyncHandler';
import { logger } from '@server/logger';

const router = express.Router();

// Middleware to check if user has access to the user procedure
const checkUserProcedureAccess = asyncHandler(async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const userProcedureId = parseInt(req.params.userProcedureId);
  if (isNaN(userProcedureId)) {
    return res.status(400).json({ message: 'Invalid user procedure ID' });
  }
  
  // Check if the user procedure exists and belongs to the user
  const userProcedure = await db.query.userProcedures.findFirst({
    where: and(
      eq(userProcedures.id, userProcedureId),
      eq(userProcedures.userId, req.user.id)
    )
  });
  
  if (!userProcedure) {
    return res.status(404).json({ message: 'User procedure not found or access denied' });
  }
  
  // Store the user procedure for reference in the handler
  req.userProcedure = userProcedure;
  next();
});

// Get all notes for a user procedure
router.get('/user/:userProcedureId/notes', checkUserProcedureAccess, asyncHandler(async (req, res) => {
  const { userProcedureId } = req.params;
  
  const notes = await db
    .select()
    .from(userProcedureNotes)
    .where(eq(userProcedureNotes.userProcedureId, parseInt(userProcedureId)))
    .orderBy(userProcedureNotes.createdAt);
    
  res.json(notes);
}));

// Create a new note for a user procedure
router.post('/user/:userProcedureId/notes', checkUserProcedureAccess, asyncHandler(async (req, res) => {
  const { userProcedureId } = req.params;
  
  const validatedData = insertUserProcedureNoteSchema.parse({
    ...req.body,
    userProcedureId: parseInt(userProcedureId)
  });
  
  const [newNote] = await db
    .insert(userProcedureNotes)
    .values(validatedData)
    .returning();
    
  res.status(201).json(newNote);
}));

// Update a note
router.patch('/notes/:noteId', asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const noteId = parseInt(req.params.noteId);
  if (isNaN(noteId)) {
    return res.status(400).json({ message: 'Invalid note ID' });
  }
  
  // Get the note to check ownership
  const note = await db.query.userProcedureNotes.findFirst({
    where: eq(userProcedureNotes.id, noteId),
    with: {
      userProcedure: true
    }
  });
  
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  
  if (note.userProcedure.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const [updatedNote] = await db
    .update(userProcedureNotes)
    .set({
      ...req.body,
      updatedAt: new Date()
    })
    .where(eq(userProcedureNotes.id, noteId))
    .returning();
    
  res.json(updatedNote);
}));

// Delete a note
router.delete('/notes/:noteId', asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const noteId = parseInt(req.params.noteId);
  if (isNaN(noteId)) {
    return res.status(400).json({ message: 'Invalid note ID' });
  }
  
  // Get the note to check ownership
  const note = await db.query.userProcedureNotes.findFirst({
    where: eq(userProcedureNotes.id, noteId),
    with: {
      userProcedure: true
    }
  });
  
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  
  if (note.userProcedure.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  await db
    .delete(userProcedureNotes)
    .where(eq(userProcedureNotes.id, noteId));
    
  res.status(204).end();
}));

// REMINDERS ENDPOINTS

// Get all reminders for a user procedure
router.get('/user/:userProcedureId/reminders', checkUserProcedureAccess, asyncHandler(async (req, res) => {
  const { userProcedureId } = req.params;
  
  const reminders = await db
    .select()
    .from(userProcedureReminders)
    .where(eq(userProcedureReminders.userProcedureId, parseInt(userProcedureId)))
    .orderBy(userProcedureReminders.dueDate);
    
  res.json(reminders);
}));

// Create a new reminder for a user procedure
router.post('/user/:userProcedureId/reminders', checkUserProcedureAccess, asyncHandler(async (req, res) => {
  const { userProcedureId } = req.params;
  
  const validatedData = insertUserProcedureReminderSchema.parse({
    ...req.body,
    userProcedureId: parseInt(userProcedureId)
  });
  
  const [newReminder] = await db
    .insert(userProcedureReminders)
    .values(validatedData)
    .returning();
    
  res.status(201).json(newReminder);
}));

// Update a reminder
router.patch('/reminders/:reminderId', asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const reminderId = parseInt(req.params.reminderId);
  if (isNaN(reminderId)) {
    return res.status(400).json({ message: 'Invalid reminder ID' });
  }
  
  // Get the reminder to check ownership
  const reminder = await db.query.userProcedureReminders.findFirst({
    where: eq(userProcedureReminders.id, reminderId),
    with: {
      userProcedure: true
    }
  });
  
  if (!reminder) {
    return res.status(404).json({ message: 'Reminder not found' });
  }
  
  if (reminder.userProcedure.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const [updatedReminder] = await db
    .update(userProcedureReminders)
    .set({
      ...req.body,
      updatedAt: new Date()
    })
    .where(eq(userProcedureReminders.id, reminderId))
    .returning();
    
  res.json(updatedReminder);
}));

// Delete a reminder
router.delete('/reminders/:reminderId', asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const reminderId = parseInt(req.params.reminderId);
  if (isNaN(reminderId)) {
    return res.status(400).json({ message: 'Invalid reminder ID' });
  }
  
  // Get the reminder to check ownership
  const reminder = await db.query.userProcedureReminders.findFirst({
    where: eq(userProcedureReminders.id, reminderId),
    with: {
      userProcedure: true
    }
  });
  
  if (!reminder) {
    return res.status(404).json({ message: 'Reminder not found' });
  }
  
  if (reminder.userProcedure.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  await db
    .delete(userProcedureReminders)
    .where(eq(userProcedureReminders.id, reminderId));
    
  res.status(204).end();
}));

// CHECKLIST ENDPOINTS

// Get all checklist items for a user procedure
router.get('/user/:userProcedureId/checklist', checkUserProcedureAccess, asyncHandler(async (req, res) => {
  const { userProcedureId } = req.params;
  
  const checklist = await db
    .select()
    .from(userProcedureChecklist)
    .where(eq(userProcedureChecklist.userProcedureId, parseInt(userProcedureId)))
    .orderBy(userProcedureChecklist.createdAt);
    
  res.json(checklist);
}));

// Create a new checklist item for a user procedure
router.post('/user/:userProcedureId/checklist', checkUserProcedureAccess, asyncHandler(async (req, res) => {
  const { userProcedureId } = req.params;
  
  const validatedData = insertUserProcedureChecklistItemSchema.parse({
    ...req.body,
    userProcedureId: parseInt(userProcedureId)
  });
  
  const [newChecklistItem] = await db
    .insert(userProcedureChecklist)
    .values(validatedData)
    .returning();
    
  res.status(201).json(newChecklistItem);
}));

// Update a checklist item
router.patch('/checklist/:itemId', asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const itemId = parseInt(req.params.itemId);
  if (isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid checklist item ID' });
  }
  
  // Get the checklist item to check ownership
  const checklistItem = await db.query.userProcedureChecklist.findFirst({
    where: eq(userProcedureChecklist.id, itemId),
    with: {
      userProcedure: true
    }
  });
  
  if (!checklistItem) {
    return res.status(404).json({ message: 'Checklist item not found' });
  }
  
  if (checklistItem.userProcedure.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const [updatedChecklistItem] = await db
    .update(userProcedureChecklist)
    .set({
      ...req.body,
      updatedAt: new Date()
    })
    .where(eq(userProcedureChecklist.id, itemId))
    .returning();
    
  res.json(updatedChecklistItem);
}));

// Delete a checklist item
router.delete('/checklist/:itemId', asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const itemId = parseInt(req.params.itemId);
  if (isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid checklist item ID' });
  }
  
  // Get the checklist item to check ownership
  const checklistItem = await db.query.userProcedureChecklist.findFirst({
    where: eq(userProcedureChecklist.id, itemId),
    with: {
      userProcedure: true
    }
  });
  
  if (!checklistItem) {
    return res.status(404).json({ message: 'Checklist item not found' });
  }
  
  if (checklistItem.userProcedure.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  await db
    .delete(userProcedureChecklist)
    .where(eq(userProcedureChecklist.id, itemId));
    
  res.status(204).end();
}));

// DOCUMENT ENDPOINTS

// Get all documents for a user procedure
router.get('/user/:userProcedureId/documents', checkUserProcedureAccess, asyncHandler(async (req, res) => {
  const { userProcedureId } = req.params;
  
  const documents = await db
    .select()
    .from(userProcedureDocuments)
    .where(eq(userProcedureDocuments.userProcedureId, parseInt(userProcedureId)))
    .orderBy(userProcedureDocuments.createdAt);
    
  res.json(documents);
}));

// Create a new document for a user procedure
router.post('/user/:userProcedureId/documents', checkUserProcedureAccess, asyncHandler(async (req, res) => {
  const { userProcedureId } = req.params;
  
  const validatedData = insertUserProcedureDocumentSchema.parse({
    ...req.body,
    userProcedureId: parseInt(userProcedureId)
  });
  
  const [newDocument] = await db
    .insert(userProcedureDocuments)
    .values(validatedData)
    .returning();
    
  res.status(201).json(newDocument);
}));

// Update a document
router.patch('/documents/:documentId', asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const documentId = parseInt(req.params.documentId);
  if (isNaN(documentId)) {
    return res.status(400).json({ message: 'Invalid document ID' });
  }
  
  // Get the document to check ownership
  const document = await db.query.userProcedureDocuments.findFirst({
    where: eq(userProcedureDocuments.id, documentId),
    with: {
      userProcedure: true
    }
  });
  
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  if (document.userProcedure.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const [updatedDocument] = await db
    .update(userProcedureDocuments)
    .set({
      ...req.body,
      updatedAt: new Date()
    })
    .where(eq(userProcedureDocuments.id, documentId))
    .returning();
    
  res.json(updatedDocument);
}));

// Delete a document
router.delete('/documents/:documentId', asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const documentId = parseInt(req.params.documentId);
  if (isNaN(documentId)) {
    return res.status(400).json({ message: 'Invalid document ID' });
  }
  
  // Get the document to check ownership
  const document = await db.query.userProcedureDocuments.findFirst({
    where: eq(userProcedureDocuments.id, documentId),
    with: {
      userProcedure: true
    }
  });
  
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  if (document.userProcedure.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  await db
    .delete(userProcedureDocuments)
    .where(eq(userProcedureDocuments.id, documentId));
    
  res.status(204).end();
}));

export default router;