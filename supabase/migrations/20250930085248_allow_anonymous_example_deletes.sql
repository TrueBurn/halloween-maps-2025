-- Allow anonymous users to delete example locations (for /dev tools)
CREATE POLICY "Allow anonymous deletes for example locations"
  ON locations
  FOR DELETE
  TO anon
  USING (address LIKE 'Example - %');
