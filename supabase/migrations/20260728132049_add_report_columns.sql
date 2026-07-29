/*
# MediScan AI — Add missing columns

## Overview
Adds `status` and `service_category` columns to medical_reports to support
analysis workflow tracking and healthcare service categorization.

## Changes
1. **medical_reports**: add `status` (text, default 'pending') and `service_category` (text, nullable).
*/

ALTER TABLE medical_reports
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'));

ALTER TABLE medical_reports
  ADD COLUMN IF NOT EXISTS service_category text;
