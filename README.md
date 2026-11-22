# RoyalPrep practice

The frontend and backend are independently installable Node projects.

## Backend

Use Node 22 or newer. In `backend`, run `npm ci`, copy `.env.example` to `.env`, and set your PostgreSQL `DATABASE_URL`, `ADMIN_PASSWORD` (12+ characters), `ADMIN_EMAIL`, and `SESSION_SECRET` (32+ characters). Start PostgreSQL, apply the schema with `node --import tsx scripts/migrate-postgres.ts`, then run `npm run dev`. For local testing, the example enables `DUMMY_OTP_ENABLED=true` with `NODE_ENV=development` and binds to `127.0.0.1`. No email is sent: after requesting a challenge, any six-digit code is accepted for students and admins. This bypass permits impersonation and must never be exposed publicly or used with real users' data.

Student sign-in creates an email-only account on first verification. Admin sign-in checks the shared password before issuing a one-use code challenge. Challenges and sessions are process-local, so restarting the backend signs users out and multiple backend processes do not share them. Both sign-in flows are unavailable outside development until real email delivery and verification are implemented. They are not production authentication.

Students call `POST /api/auth/otp/request` with `email`, then `POST /api/auth/otp/verify` with `email` and `code`. Admins call `POST /api/admin/otp/request` with `password`, then `POST /api/admin/login` with the returned `challenge` and a `code`. Challenges expire after five minutes and are single-use.

## Frontend

In `frontend`, run `npm ci` once for the shared codebase and copy `.env.example` to `.env`. Run `npm run dev:student` for the student app on port 5173 and `npm run dev:admin` for the admin app on port 5174. Build them independently with `npm run build:student` and `npm run build:admin`; output is in `dist/student` and `dist/admin`. Each app contains only its own routes and must be served with its own SPA fallback. Optional `VITE_STUDENT_URL` and `VITE_ADMIN_URL` configure links between deployments. `npm run dev` and `npm run build` retain the combined development app.

The development proxy forwards `/api` to port 4000; if the backend uses another port, set `VITE_API_URL` to its origin. Configure the backend and reverse proxy for the actual frontend origins.

## PostgreSQL database

PostgreSQL is the backend's only application database for questions, reports, homepage hero content, student study plans, custom mock attempts and personal flashcards. Install PostgreSQL, create an appropriately restricted database and user, and set `DATABASE_URL` in `backend/.env` without committing credentials. From `backend`, run `node --import tsx scripts/migrate-postgres.ts` to apply the SQL migrations. The backend requires the connection and all required tables at startup. Real PostgreSQL migration, locking, concurrency and backup/restore behavior still need operational verification.

For a remote PostgreSQL server with a private CA, obtain the CA certificate through your provider's trusted console and add `sslmode=verify-full` and `sslrootcert` (the URL-encoded local certificate path) to `DATABASE_URL`. This verifies both the certificate chain and server hostname for the backend and migration script. Do not disable certificate verification.

## Practice and administration

Students can browse chapters with published questions at `/study/library`, answer questions at `/practice`, view explanations, and report errors. These study screens require student sign-in, and practice API requests require the student session. Chapter notes are not yet available. Student demo sign-in or sign-up is at `/sign-in`; it creates an email-only account and a temporary session, but does not save practice progress. Sign in at `/admin` with the configured password and a demo email code to create, edit, publish, filter and import individual questions and review reports. Edits use version checks; a report retains the question text and version at the time it was submitted.

The public chapter catalog is at `/course`, study tools at `/tools`, and the protected student dashboard at `/app`. The planner at `/tools/planner` proposes one editable task per published practice chapter, evenly spaced to a target date. Signed-in students can save tasks, completion and their available days/hours with optimistic revision checks; the dashboard shows their upcoming tasks. This basic proposal does not use approved topic weights or selected weekdays. Since student sign-in is a development demo, these are not secure production accounts.

Students can create timed custom mocks at `/app/mocks`, resume saved attempts, review submitted answers at `/app/results`, and see recent incorrect answers at `/app/mistakes`. Mistakes consider at most the latest 100 submitted custom mocks. `/app/flashcards` supports personal cards and scheduled reviews, not approved shared decks. Daily and grand mocks, rankings and comprehensive analytics are not implemented. The admin dashboard and reports screen show question and report counts and submitted question reports, not the full planned administrative suite.

With PostgreSQL configured, `/admin/content/hero` lets an admin edit text and internal CTA paths, preview the draft at three sizes, publish it, and restore previously published revisions. The public homepage reads only the published revision and displays an unavailable state until one exists. Image uploads, external CTA approval, full CMS content, SSR, and durable staff identities/permissions are not yet implemented.

The prototype hero API is `GET /api/public/site/hero`, `GET /api/admin/site/hero`, `PUT /api/admin/site/hero/draft`, and `POST /api/admin/site/hero/publish` or `/restore`. Draft writes include `expectedRevision` and `content`; publish includes `expectedRevision`; restore includes `expectedRevision` and `sourceRevision`. A stale revision returns 409. Responses are `no-store`; public reads return 404 until published and 503 without PostgreSQL.

Import CSV files up to 100 KB with one question per row (1–1000 rows) and the header `chapter,published,stem,option_a,option_b,option_c,option_d,correct,explanation,source`. The `source` column is optional. Use `true` or `false` for published and A, B, C or D for correct. Quote fields containing commas, quotes or newlines using standard CSV quoting. Import adds new questions.

To add optional sample questions, start the backend in development demo mode and run `node --import tsx seed/seed.ts` from `backend` with `ADMIN_PASSWORD` and `ADMIN_EMAIL` configured. Existing questions with matching chapter and stem are retained. The sample questions are for practice and are not an official or independently reviewed examination resource.

## Database upgrades

Back up PostgreSQL before applying schema changes. The backend applies only the versioned SQL migrations in `backend/migrations`; transferring data from another database is a separate, explicit operation and is not performed automatically.

## Build and checks

Run `npm run build:student` and `npm run build:admin` in `frontend`, and `npm run build` and `npm test` in `backend`. Serve each frontend build with an `index.html` fallback and use a same-origin `/api` proxy or set `VITE_API_URL` when building. The current prototype must not be deployed as production authentication.

## Android prototype

In `royalprep-android`, run `npm ci` and `npm start`; in another terminal run `npm run android` with an Android emulator or device. For the emulator, the default development backend origin is `http://10.0.2.2:4000`; the backend must be running on the host with development demo OTP enabled. A physical device needs a reachable backend origin and appropriate network binding. HTTP origins are permitted only in development; release builds require HTTPS. The app supports demo OTP, a published chapter list and practice answers, explanations and reports. Other native workflows are not implemented. Sessions are held in memory and are lost when the app closes. `FLAG_SECURE` is enabled for the activity, but screen protection, interruptions and device behavior have not been verified on a device.

This is not a production app: the backend has no production student authentication, refresh or secure session restoration. Release signing is not configured; do not distribute a debug build or treat an unsigned release build as a signed deliverable. Run `npx tsc --noEmit`, `npm test -- --runInBand` and `npm run lint` for the native prototype.
