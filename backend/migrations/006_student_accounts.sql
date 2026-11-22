CREATE TABLE student_accounts (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
