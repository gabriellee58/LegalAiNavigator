-- Create tables for Court Procedure Personalization (Phase 3)

-- User Notes for Court Procedures
CREATE TABLE IF NOT EXISTS user_procedure_notes (
  id SERIAL PRIMARY KEY,
  user_procedure_id INTEGER NOT NULL,
  step_id INTEGER,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_procedure_id) REFERENCES user_procedures(id) ON DELETE CASCADE
);

-- User Reminders for Court Procedures
CREATE TABLE IF NOT EXISTS user_procedure_reminders (
  id SERIAL PRIMARY KEY,
  user_procedure_id INTEGER NOT NULL,
  step_id INTEGER,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  notify_before INTEGER DEFAULT 1, -- days
  notify_method VARCHAR(20) DEFAULT 'app', -- email, app, both
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_procedure_id) REFERENCES user_procedures(id) ON DELETE CASCADE
);

-- User Checklist Items for Court Procedures
CREATE TABLE IF NOT EXISTS user_procedure_checklist (
  id SERIAL PRIMARY KEY,
  user_procedure_id INTEGER NOT NULL,
  step_id INTEGER,
  category VARCHAR(50) DEFAULT 'general',
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_procedure_id) REFERENCES user_procedures(id) ON DELETE CASCADE
);

-- User Documents for Court Procedures
CREATE TABLE IF NOT EXISTS user_procedure_documents (
  id SERIAL PRIMARY KEY,
  user_procedure_id INTEGER NOT NULL,
  step_id INTEGER,
  related_form_id INTEGER,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, completed, submitted, approved, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_procedure_id) REFERENCES user_procedures(id) ON DELETE CASCADE
);

-- Create indexes for optimization
CREATE INDEX IF NOT EXISTS idx_notes_user_procedure_id ON user_procedure_notes(user_procedure_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_procedure_id ON user_procedure_reminders(user_procedure_id);
CREATE INDEX IF NOT EXISTS idx_checklist_user_procedure_id ON user_procedure_checklist(user_procedure_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_procedure_id ON user_procedure_documents(user_procedure_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON user_procedure_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_checklist_category ON user_procedure_checklist(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON user_procedure_documents(status);

-- Add comment for documentation
COMMENT ON TABLE user_procedure_notes IS 'Stores user notes related to court procedures';
COMMENT ON TABLE user_procedure_reminders IS 'Stores reminders and deadlines for court procedure steps';
COMMENT ON TABLE user_procedure_checklist IS 'Stores customizable checklist items for procedure requirements';
COMMENT ON TABLE user_procedure_documents IS 'Stores user documents related to court procedures';