-- Create court procedure categories table
CREATE TABLE IF NOT EXISTS court_procedure_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create court procedures table
CREATE TABLE IF NOT EXISTS court_procedures (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES court_procedure_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'Canada',
  steps JSONB NOT NULL,
  flowchart_data JSONB NOT NULL,
  estimated_timeframes JSONB,
  court_fees JSONB,
  requirements JSONB,
  source_name TEXT,
  source_url TEXT,
  related_forms JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create court procedure steps table
CREATE TABLE IF NOT EXISTS court_procedure_steps (
  id SERIAL PRIMARY KEY,
  procedure_id INTEGER REFERENCES court_procedures(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  estimated_time TEXT,
  required_documents JSONB,
  instructions TEXT,
  tips JSONB,
  warnings JSONB,
  fees JSONB,
  is_optional BOOLEAN DEFAULT FALSE,
  next_step_ids JSONB,
  alternate_path_info TEXT,
  source_references JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create user court procedures tracking table
CREATE TABLE IF NOT EXISTS user_court_procedures (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  procedure_id INTEGER REFERENCES court_procedures(id),
  current_step_id INTEGER REFERENCES court_procedure_steps(id),
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER NOT NULL DEFAULT 0,
  completed_steps JSONB,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expected_completion_date TIMESTAMP,
  completed_at TIMESTAMP,
  case_specific_data JSONB
);