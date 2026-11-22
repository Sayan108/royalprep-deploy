# Deployment and release verification

## Deployment units

| Unit | Source | Artifact and runtime |
|---|---|---|
| Student web | royalprep-web/apps/student plus shared packages | Static client assets and public React renderer service |
| Admin web | royalprep-web/apps/admin plus shared packages | Separate static artifact, host and reverse-proxy route |
| Android | royalprep-android | Signed AAB and testing APK |
| API/worker | royalprep-api | Express service, SQL migrations and worker/scheduler entry |
| PostgreSQL | Managed database or privately deployed instance | Authoritative relational state with backups |
| Cloudinary | Client-owned account | Uploaded assets and controlled media |
| Redis/SQS | Configured services when used | Cache/throttle and durable background delivery |

EC2 hosts the API and public renderer with a reverse proxy and service supervisor. Student and admin builds have separate hostnames, releases and configuration even when sharing an EC2 host. Database must be private, with least-privilege credentials and backup retention. Production may use managed PostgreSQL for resilience; self-hosting requires volume, upgrade, backup and restore operations. Capacity and availability targets need measurement and agreement.

## CI and rollout

Web CI builds each changed app and shared dependencies, checks types, contract compatibility and changed flows, and emits independent deployable artifacts. Backend CI runs service/SQL integration tests against PostgreSQL, migration tests and builds. Android CI builds native variants and tests supported API contracts. Keep secrets in injected environment/secret storage and sign artifacts through protected CI configuration.

Deploy compatible SQL migrations before code relying on them, then API/worker, student renderer and chosen web artifacts. Use health/readiness checks and an authenticated smoke test. Retain previous artifact versions; use expand/contract migrations so rollback is possible without destructive database reversal. Client mobile releases require backward-compatible APIs during phased adoption.

## Release verification

- Trace every screen 1–52 to the PRD and screen matrix, including all empty and failure states.
- Change hero, navigation, FAQ, public facts and feature switches through admin, then verify publication and restoration across web and Android where applicable.
- Verify student/admin origin and session isolation, admin password throttling and mandatory second-factor enrollment/recovery, student OTP expiry/replay/attempt limits, and cross-account access checks. The demo OTP must be disabled outside development.
- Exercise custom count/filter selection, practice reveal, scheduled boundaries, concurrent saves/submits, reconnect and question edits after start.
- Ensure Daily Quiz contains five items, Daily Mock uses configured count, Grand registration deduplicates, and rankings freeze consistently with ties.
- Compare score, breakdown, percentile, pass/readiness estimate and low-data behavior using deterministic known attempts.
- Test repeated flashcard reviews, saved-item edits and planner versions from concurrent clients.
- Test eligible/ineligible media, expired grants, resume, missing captions and unavailable recordings.
- Verify tutor thread ownership, bounded context, invalid citations, quotas, provider timeout and ongoing mock restriction.
- Verify domestic/international checkout, coupon caps, repeated/out-of-order webhook, pending reconciliation and refund replay.
- Exercise report replies, audience preview, broadcast retries and consent-filtered exports.
- Test 320–1440px layouts, tablet rotation, keyboard, zoom, screen readers, reduced motion and supported Android capture surfaces.
- Restore PostgreSQL from backup into staging and rehearse a deploy rollback.

## Operations

Monitor API latency/errors, database pool/locks/storage, job delay, DLQ, payment reconciliation, media delivery failures and AI cost. Run workers using unique job claims and retry budgets. Alerts have named owners. Retention and privacy jobs are auditable. Cloudinary, AI, database/hosting, email, gateway/FX, licences and distribution charges are external operating costs.
