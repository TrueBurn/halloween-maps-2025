-- Add 'AnimalCharity' to location_type enum
-- This is for animal shelter donation stations (visible to public, no candy)

ALTER TYPE location_type ADD VALUE 'AnimalCharity';
