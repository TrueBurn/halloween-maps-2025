-- Fix RLS SELECT policy to allow authenticated users to view all locations
-- This fixes the issue where admins couldn't update is_participating to false
-- because the SELECT policy would prevent them from seeing the updated row

-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Public locations are viewable by everyone" ON locations;

-- Create new SELECT policy for public (anon) users - only participating locations
CREATE POLICY "Public can view participating locations"
  ON locations
  FOR SELECT
  TO anon
  USING (is_participating = true);

-- Create new SELECT policy for authenticated users - all locations
CREATE POLICY "Authenticated users can view all locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);
