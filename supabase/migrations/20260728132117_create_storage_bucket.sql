/*
# Create medical-reports storage bucket

## Overview
Creates a storage bucket for medical report file uploads with public read access
for authenticated users. Files are organized by user ID folders.

## Changes
1. Create `medical-reports` storage bucket (public).
2. Add storage policies for authenticated users to manage their own files.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-reports', 'medical-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Users can upload own reports" ON storage.objects;
CREATE POLICY "Users can upload own reports" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access
DROP POLICY IF EXISTS "Public can read reports" ON storage.objects;
CREATE POLICY "Public can read reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'medical-reports');

-- Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "Users can delete own reports" ON storage.objects;
CREATE POLICY "Users can delete own reports" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);
