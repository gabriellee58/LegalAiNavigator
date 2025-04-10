import { 
  pgTable, serial, integer, text, json, timestamp, boolean, varchar 
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// User Notes for Court Procedures
export const userProcedureNotes = pgTable('user_procedure_notes', {
  id: serial('id').primaryKey(),
  userProcedureId: integer('user_procedure_id').notNull(),
  stepId: integer('step_id'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type UserProcedureNote = typeof userProcedureNotes.$inferSelect;
export type InsertUserProcedureNote = typeof userProcedureNotes.$inferInsert;

export const insertUserProcedureNoteSchema = createInsertSchema(userProcedureNotes)
  .omit({ id: true, createdAt: true, updatedAt: true });

// User Reminders for Court Procedures
export const userProcedureReminders = pgTable('user_procedure_reminders', {
  id: serial('id').primaryKey(),
  userProcedureId: integer('user_procedure_id').notNull(),
  stepId: integer('step_id'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  notifyBefore: integer('notify_before').default(1), // days
  notifyMethod: varchar('notify_method', { length: 20 }).default('app'), // email, app, both
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type UserProcedureReminder = typeof userProcedureReminders.$inferSelect;
export type InsertUserProcedureReminder = typeof userProcedureReminders.$inferInsert;

export const insertUserProcedureReminderSchema = createInsertSchema(userProcedureReminders)
  .omit({ id: true, createdAt: true, updatedAt: true });

// User Checklist Items for Court Procedures
export const userProcedureChecklist = pgTable('user_procedure_checklist', {
  id: serial('id').primaryKey(),
  userProcedureId: integer('user_procedure_id').notNull(),
  stepId: integer('step_id'),
  category: varchar('category', { length: 50 }).default('general'),
  text: text('text').notNull(),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type UserProcedureChecklistItem = typeof userProcedureChecklist.$inferSelect;
export type InsertUserProcedureChecklistItem = typeof userProcedureChecklist.$inferInsert;

export const insertUserProcedureChecklistItemSchema = createInsertSchema(userProcedureChecklist)
  .omit({ id: true, createdAt: true, updatedAt: true });

// User Documents for Court Procedures
export const userProcedureDocuments = pgTable('user_procedure_documents', {
  id: serial('id').primaryKey(),
  userProcedureId: integer('user_procedure_id').notNull(),
  stepId: integer('step_id'),
  relatedFormId: integer('related_form_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  fileUrl: text('file_url'),
  fileType: varchar('file_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('draft'), // draft, completed, submitted, approved, rejected
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type UserProcedureDocument = typeof userProcedureDocuments.$inferSelect;
export type InsertUserProcedureDocument = typeof userProcedureDocuments.$inferInsert;

export const insertUserProcedureDocumentSchema = createInsertSchema(userProcedureDocuments)
  .omit({ id: true, createdAt: true, updatedAt: true });