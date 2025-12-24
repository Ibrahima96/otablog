-- Migration: Add WhatsApp Number to Marketplace Items
-- Run this in your Supabase SQL Editor

-- Add whatsapp_number column to marketplace_items table
ALTER TABLE marketplace_items
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN marketplace_items.whatsapp_number IS 'WhatsApp phone number for direct seller contact';

-- Update the index if needed (optional, only if you want to filter by whatsapp presence)
-- CREATE INDEX IF NOT EXISTS marketplace_items_whatsapp_idx ON marketplace_items(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
