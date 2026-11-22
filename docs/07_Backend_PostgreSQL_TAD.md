# Backend and PostgreSQL technical architecture

Use strict TypeScript and Express in a modular MVC monolith. Modules contain routes/validators, controllers, domain services and repositories/models. PostgreSQL owns authoritative records; use SQL migrations with reviewed forward changes. A typed SQL query layer such as Drizzle is the proposed default, subject to dependency verification at implementation. External integrations are isolated adapters.

## Module structure

auth, users, staff, cms, assets, catalog, questions, assessments, results, revision, flashcards, media, recalls, saved, planner, tutor, commerce, reports, broadcasts, leads, audit and jobs. Controllers translate HTTP only; transaction boundaries belong to services. Validation, errors, logging, configuration and provider clients live in shared infrastructure.

## Relational data model

| Tables | Essential fields and constraints |
|---|---|
| users, staff_users, roles, staff_roles | UUID keys, normalized unique email per principal, active state, role FKs |
| otp_challenges, sessions, devices | Hashed secret/token, expiry, consumed/revoked state, session family, device owner |
| site_documents, site_revisions, publications | Unique key+locale and document+revision, author, status, current live revision FK |
| assets | Unique provider ID/type/version, usage, MIME, bytes, publication/access state |
| courses, chapters, chapter_revisions, note_sections | Unique slug, paper, subject, published revision and stable anchor |
| questions, question_revisions, question_options, question_tags | Immutable revisions, ordered options unique per revision, correct key stored only in authorized server queries |
| import_batches, import_rows | File fingerprint, validation status, row errors and unique committed batch |
| mock_definitions, mock_versions, blueprint_rows | Duration, filters, scoring policy, totals and immutable selected revisions |
| sittings, registrations | Kind, release/close/review timestamps, unique registration per user/sitting |
| attempts, attempt_questions, attempt_answers | Owner, status, deadline, selected revision, per-question save version and unique attempt/question |
| results, result_breakdowns, leaderboard_snapshots | One final result per attempt, counts, scoring version and frozen cohort snapshot |
| revision_packs, revision_items, flashcards, flashcard_states, review_events | Published revisions, owner state, due_at and unique client review event |
| media_items, media_progress, recall_topics, question_recall_links | Protected asset, topic/tag associations and unique user/media progress |
| saved_items, highlights, personal_notes, study_plans, plan_tasks | Owned references, content revision, updated version and due/check state |
| tutor_threads, tutor_messages, tutor_usage, tutor_requests | Owner/chapter/revision, sequence, unique request and daily counter scope |
| plans, prices, coupons, coupon_redemptions, orders, payments, refunds, entitlements, invoices | Amount in minor units, currency, quote snapshot, unique provider event/grant/redemption constraints |
| reports, report_messages, broadcasts, deliveries, leads, consents | Entity references, audience snapshot, consent state and deduplicated recipient delivery |
| audit_events, outbox_events, job_runs | Append-only audit, transactional job intent and unique scheduler execution key |

Use timestamptz for persisted instants and IANA timezone for scheduling policies. Store money in bigint minor units with currency. JSONB supports rich content blocks, provider metadata and snapshots; core identities, ownership and relationships remain relational. Add indexes on owner+updated_at, status+deadline, sitting+score, flashcard owner+due_at, publication key and provider event ID. Use generated tsvector/GIN for approved note search. Avoid logging full educational content or credentials.

## Transactions and concurrency

- Consume OTP with an expiry-checked conditional update; rotate refresh tokens atomically and revoke reused families.
- Start a ranked attempt under a unique user/sitting scored-attempt constraint; freeze selected questions and scoring rules in one transaction.
- Answer writes and finalization both lock the attempt row using SELECT FOR UPDATE, check status/deadline and mutate answers/result in the same transaction.
- Finalization creates one result using unique attempt_id; repeat submission returns that result. Use database time for deadlines.
- Publish content revision and advance publication pointer together with audit/outbox records; optimistic revision guards reject stale staff edits.
- Validate quiz or mock inventory before publication; scheduling claims jobs with unique sitting/date keys and row locks so multiple workers cannot release twice.
- Verify raw payment webhook signatures, lock order and deduplicate provider events, then grant/extend entitlement once using a unique grant source.
- Reserve coupon redemption atomically against global/per-user limits with expiry and order state; release failed reservations idempotently.
- A refund request writes intent first, calls the provider with an idempotency key and reconciles unknown outcomes; verified completion updates entitlements/accounting and credit notes transactionally.
- Flashcard review and tutor quota reservations use unique event/request keys, row locks and bounded counters.

## Storage and background work

Cloudinary holds approved public media and authenticated protected assets. Signed uploads are scoped and verified on completion. Enforce type and size limits and sanitize note/rich-text formats. Use authorized API delivery or tested expiring provider access; ordinary signed URLs alone are not an expiry guarantee. Media hosting/account features must be validated early for intended video playback and bandwidth.

Use SQL outbox plus SQS for imports, exports, email, broadcasts and long provider work. Workers are idempotent with bounded retries and dead-letter monitoring. Redis may cache public content, coordinate shared throttles and reduce contention, while database constraints preserve correctness. Small deployments can run an EC2 scheduled SQL job runner with the same deduplication keys.

## Auth and operations

Separate browser staff/student host-only Secure HttpOnly sessions and CSRF validation; native uses scoped access and rotating refresh tokens. Always check ownership/permission in services. Use least-privilege SQL roles, secret injection, parameterized queries, private DB networking, structured errors and redacted logs. Export and deletion follow approved retention policy with queued auditable workflows.
