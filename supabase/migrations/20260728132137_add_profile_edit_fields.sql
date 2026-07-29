/*
# Add editable profile fields

1. Modified Tables
- `profiles`: add `phone` (text, nullable), `date_of_birth` (date, nullable), `bio` (text, nullable)
2. Security
- No policy changes needed — existing `update_own_profile` policy already covers all columns on the row.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
