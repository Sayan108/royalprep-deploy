# RoyalPrep practice

The frontend and backend are independently installable Node projects.

## Backend

Use Node 22 or newer. In `backend`, run `npm ci`, copy `.env.example` to `.env`, and set your own `ADMIN_PASSWORD` (12+ characters), `SESSION_SECRET` (32+ characters), and `MONGODB_URI`. Start MongoDB, then run `npm run dev`. The example `HOST=127.0.0.1` binds locally; configure the host as appropriate for deployment.

For temporary local testing without MongoDB, explicitly set `STORAGE=memory`. Questions and reports are then lost on restart.

## Frontend

In `frontend`, run `npm ci`, copy `.env.example` to `.env`, and run `npm run dev`. Open the URL printed by Vite. The development proxy forwards `/api` to port 4000; if the backend uses another port, set `VITE_API_URL` to its origin. Set backend `FRONTEND_ORIGIN` to the frontend origin and restart the backend if the frontend uses a different port.

## Practice and administration

Students can answer published questions at `/practice`, view explanations, and report errors. Practice progress is not saved. Sign in at `/admin` to create, edit, publish, filter and import individual questions and review reports. Edits use version checks; a report retains the question text and version at the time it was submitted.

Import CSV files up to 100 KB with one question per row (1–1000 rows) and the header `chapter,published,stem,option_a,option_b,option_c,option_d,correct,explanation,source`. The `source` column is optional. Use `true` or `false` for published and A, B, C or D for correct. Quote fields containing commas, quotes or newlines using standard CSV quoting. Import adds new questions.

To add optional sample questions, start the backend and run `node --import tsx seed/seed.ts` from `backend`. Existing questions with matching chapter and stem are retained. The sample questions are for practice and are not an official or independently reviewed examination resource.

## Upgrading existing installations

Before upgrading an installation that used the earlier set-based storage, stop the backend and back up the database. With MongoDB configured in `backend/.env`, run `node --import tsx scripts/migrate-questions.ts` from `backend`, then restart the backend. The migration copies questions and reports into the new collections without overwriting existing migrated records. The old collections, including attempts and results, are left untouched but are no longer exposed by the application.

## Build and checks

Run `npm run build` in each project and `npm test` in `backend`. The backend production command is `npm start`; serve `frontend/dist` with an `index.html` fallback and use a same-origin `/api` proxy or set `VITE_API_URL` when building. Use HTTPS and stable secrets. Admin bearer tokens expire after eight hours and are stored in sessionStorage.
