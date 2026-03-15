-- Migration 025: Add geocoding and station distance columns to listings
-- lat/lng columns and PostGIS index already exist from migration 002

ALTER TABLE listings ADD COLUMN IF NOT EXISTS geocoded_address text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS station_distance_min int;
