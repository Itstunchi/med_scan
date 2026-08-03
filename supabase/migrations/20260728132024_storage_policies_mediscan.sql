/*
# Storage policies for medical-reports bucket

## Overview
Creates RLS storage policies so authenticated users can upload, read, and
delete their own medical report files in the `medical-reports` bucket.
Files are stored under a per-user path prefix `user_id/filename`.

## Security
- SELECT: owner can read their own files (path starts with user_id/)
- INSERT: owner can upload to their own path
- UPDATE: owner can update their own files
- DELETE: owner can delete their own files
*/

CREATE POLICY "read_own_report_files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "insert_own_report_files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "update_own_report_files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "delete_own_report_files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);
