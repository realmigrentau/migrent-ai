-- Migration 024: Add suburb column to listings table
-- Allows direct suburb-based search without parsing the address field

ALTER TABLE listings ADD COLUMN IF NOT EXISTS suburb TEXT;

-- Create index for suburb search
CREATE INDEX IF NOT EXISTS idx_listings_suburb ON listings (suburb);

-- Backfill suburb from address for existing listings (address format: "Suburb, Postcode")
UPDATE listings
SET suburb = split_part(address, ',', 1)
WHERE suburb IS NULL AND address IS NOT NULL;
