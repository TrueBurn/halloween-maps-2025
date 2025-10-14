-- Convert route column from enum to text to support dynamic routes via environment variables
-- This allows each neighborhood deployment to define its own age groups/routes

-- Step 1: Add a temporary text column
ALTER TABLE locations ADD COLUMN route_text TEXT;

-- Step 2: Copy existing route values to the temporary column
UPDATE locations SET route_text = route::text WHERE route IS NOT NULL;

-- Step 3: Drop the old route column (this also drops the enum constraint)
ALTER TABLE locations DROP COLUMN route;

-- Step 4: Rename the temporary column to route
ALTER TABLE locations RENAME COLUMN route_text TO route;

-- Step 5: Drop the route enum type (no longer needed)
DROP TYPE IF EXISTS route;

-- Note: The route column is now TEXT and nullable, allowing any string value
-- Routes will be validated against NEXT_PUBLIC_ROUTES environment variable in the application
