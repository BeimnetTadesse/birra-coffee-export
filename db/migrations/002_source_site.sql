-- Coffee Export, Coffee Roastery, Birra Living and Birra Group all write to
-- this same shared database (one place to review every inquiry) — this
-- column is what lets the admin tell them apart.
--
-- Idempotent and safe to run from any of the four projects; only needs to
-- run once against the shared database regardless of which project runs it.

ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS source_site TEXT NOT NULL DEFAULT 'group';

CREATE INDEX IF NOT EXISTS contact_submissions_source_site_idx
  ON contact_submissions (source_site);
