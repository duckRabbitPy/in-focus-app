-- Add notes column to photos table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'photos' 
        AND column_name = 'notes'
    ) THEN 
        ALTER TABLE photos ADD COLUMN notes TEXT;
    END IF;
END $$; 