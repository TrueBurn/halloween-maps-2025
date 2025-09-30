-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read participating locations (public access)
CREATE POLICY "Public locations are viewable by everyone"
  ON locations
  FOR SELECT
  USING (is_participating = true);

-- Policy: Authenticated users (admins) can insert locations
CREATE POLICY "Authenticated users can insert locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users (admins) can update any location
CREATE POLICY "Authenticated users can update locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users (admins) can delete locations
CREATE POLICY "Authenticated users can delete locations"
  ON locations
  FOR DELETE
  TO authenticated
  USING (true);
