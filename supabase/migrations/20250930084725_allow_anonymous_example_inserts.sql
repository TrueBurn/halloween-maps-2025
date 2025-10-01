-- Allow anonymous users to insert example locations (for /dev tools)
CREATE POLICY "Allow anonymous inserts for example locations"
  ON locations
  FOR INSERT
  TO anon
  WITH CHECK (address LIKE 'Example - %');
