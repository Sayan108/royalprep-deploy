CREATE TABLE custom_attempts (
  id uuid PRIMARY KEY,
  owner_email text NOT NULL,
  request_id uuid NOT NULL,
  fingerprint text NOT NULL,
  payload jsonb NOT NULL,
  UNIQUE (owner_email, request_id)
);

CREATE INDEX custom_attempts_owner_idx ON custom_attempts (owner_email);
