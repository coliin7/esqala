-- Add Google Drive video support to lessons.
-- Stores the Google Drive file ID (not the full URL).
-- Creator pastes a shareable link; the UI extracts the file ID client-side.
alter table public.lessons add column if not exists video_drive_id text;
