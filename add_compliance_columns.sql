-- Add missing columns to compliance_checks table if they don't exist
DO $$
BEGIN
    -- Check and add description column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'compliance_checks' AND column_name = 'description'
    ) THEN
        ALTER TABLE compliance_checks ADD COLUMN description TEXT;
    END IF;

    -- Check and add score column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'compliance_checks' AND column_name = 'score'
    ) THEN
        ALTER TABLE compliance_checks ADD COLUMN score INTEGER;
    END IF;

    -- Check and add status column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'compliance_checks' AND column_name = 'status'
    ) THEN
        ALTER TABLE compliance_checks ADD COLUMN status TEXT;
    END IF;
END
$$;