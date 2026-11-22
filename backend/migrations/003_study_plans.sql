CREATE TABLE student_study_plans (
  owner_email text PRIMARY KEY,
  version integer NOT NULL CHECK (version > 0),
  plan jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
