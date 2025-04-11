-- Add metadata column to chat_messages table
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB;