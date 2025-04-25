-- Add email column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='email') THEN
    ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
  END IF;
END $$;

-- Add photoURL column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='photo_url') THEN
    ALTER TABLE users ADD COLUMN photo_url TEXT;
  END IF;
END $$;