-- Add whatsapp_number to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp 
ON profiles(whatsapp_number);

-- Update RLS policies to allow users to update their own number
-- (Assuming existing policies cover basic update, but ensuring specific field is safe)
-- If you have a specific policy for "profiles", ensure it allows updating this column.

-- Policy for reading public profiles (drop if exists to avoid conflict)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING ( true );

-- Policy for users to update their own profile (drop if exists to avoid conflict)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id );

-- Comment
COMMENT ON COLUMN profiles.whatsapp_number IS 'Numéro WhatsApp international (ex: 33612345678) pour contact direct via Terminal.';

-- Verification query
SELECT id, username, whatsapp_number FROM profiles LIMIT 5;
