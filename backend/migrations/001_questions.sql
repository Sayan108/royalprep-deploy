CREATE TABLE questions (
  id text PRIMARY KEY,
  sequence bigserial UNIQUE NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  chapter text NOT NULL,
  published boolean NOT NULL,
  stem text NOT NULL,
  options jsonb NOT NULL CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) = 4),
  correct integer NOT NULL CHECK (correct BETWEEN 0 AND 3),
  explanation text NOT NULL,
  source text
);

CREATE INDEX questions_published_chapter_idx ON questions (published, chapter);

CREATE TABLE question_reports (
  id text PRIMARY KEY,
  question_id text NOT NULL REFERENCES questions(id),
  question_version integer NOT NULL CHECK (question_version > 0),
  question_stem text NOT NULL,
  message text NOT NULL,
  created_at bigint NOT NULL
);

CREATE INDEX question_reports_question_idx ON question_reports (question_id);
