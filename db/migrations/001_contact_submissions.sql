-- Inquiries submitted through the site's contact form.
--
-- The row is written before the notification email is attempted, so a mail
-- outage can never lose a lead — it only delays the notification.

CREATE TABLE IF NOT EXISTS contact_submissions (
  id         BIGSERIAL   PRIMARY KEY,

  -- Who is asking
  name       TEXT        NOT NULL,
  company    TEXT,
  email      TEXT        NOT NULL,
  country    TEXT,

  -- What they want. `quantity` is free text on purpose: buyers write
  -- "2 containers", "5 tons", and "500kg to start" and normalising that
  -- into a number would throw away the part the export desk cares about.
  interest   TEXT,
  quantity   TEXT,
  message    TEXT        NOT NULL,

  -- Sales pipeline state, driven by the admin view later.
  status     TEXT        NOT NULL DEFAULT 'new'
                         CHECK (status IN ('new', 'contacted', 'closed')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin view lists newest-first and filters by status.
CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx
  ON contact_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS contact_submissions_status_idx
  ON contact_submissions (status);
