-- Create locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  address VARCHAR NOT NULL,
  is_start BOOLEAN NOT NULL DEFAULT false,
  is_participating BOOLEAN NOT NULL DEFAULT true,
  has_candy BOOLEAN NOT NULL DEFAULT true,
  location_type location_type NOT NULL,
  route route,
  phone_number VARCHAR,
  email VARCHAR,
  has_activity BOOLEAN NOT NULL DEFAULT false,
  activity_details TEXT
);

-- Create index on coordinates for faster map queries
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);

-- Create index on is_participating for filtering
CREATE INDEX idx_locations_participating ON locations(is_participating) WHERE is_participating = true;
