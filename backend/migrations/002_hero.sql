CREATE TABLE hero_revisions (
  revision integer PRIMARY KEY CHECK (revision > 0),
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE hero_state (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  current_revision integer NOT NULL DEFAULT 0 CHECK (current_revision >= 0),
  draft_revision integer REFERENCES hero_revisions(revision),
  published_revision integer REFERENCES hero_revisions(revision)
);

INSERT INTO hero_state (singleton) VALUES (true);

CREATE TABLE hero_audit_events (
  id text PRIMARY KEY,
  action text NOT NULL CHECK (action IN ('draft', 'publish', 'restore')),
  revision integer NOT NULL REFERENCES hero_revisions(revision),
  source_revision integer REFERENCES hero_revisions(revision),
  actor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX hero_audit_events_revision_idx ON hero_audit_events (revision);
