# Admin website technical architecture

Admin is the second application in royalprep-web, with its own build and deployment. Use the same React/TypeScript/Saga stack, basic FSD structure and source tokens. Every staff capability is also authorized by Express. The target uses password-based staff login plus mandatory second-factor enrollment and recovery. The current prototype accepts a configured shared password followed by a development-only dummy email code; it sends no email and has no real second factor, recovery, named staff accounts, persistent replay prevention, or role permissions.

## Screens 43–52

| Screen | Technical responsibility |
|---|---|
| 43 | Password challenge, mandatory second-factor enrollment and recovery, throttling, session expiry and protected admin routes |
| 44 | Aggregated metrics with date/timezone filters and explicit currency separation |
| 45 | Content revisions, assets, draft/review/approval/publication, protected preview and restore |
| 46 | Question pagination, filters, tags, options/explanations and validated all-or-nothing import |
| 47 | Daily calendar, custom blueprint validation, full mocks, Grand Mock registration, review release and ranking freeze |
| 48 | Student lookup, session/device inspection, reasoned access changes and revocation |
| 49 | Plans, effective dated prices, coupon limits, payment/refund status and credit notes |
| 50 | Report workflow, replies, consent-aware audience preview, scheduled broadcast and delivery status |
| 51 | Public metadata, sourced exam facts, leads and consent-filtered CSV export |
| 52 | Invites, roles, flags, staff second-factor status and append-only audit lookup |

## Hero and CMS workflow

Hero fields include eyebrow, headline, optional highlighted text, description, primary/secondary CTA, asset, alt/decorative state and focal point. Validate links against internal route keys or approved HTTPS targets. Use the shared renderer in phone/tablet/desktop preview. Save draft with expected revision, show stale edit conflicts and publish using an atomic live-pointer update. Invalidate student render caches and write an audit event in the same publication transaction. Restore creates a new publication referencing earlier content, preserving history.

## Import and exam operations

Validate file type/size, schema, chapter IDs, correct-option count, duplicate question IDs and option values. Store validation report, fingerprint and import batch. Commit the exact validated batch once, with progress and retry feedback. Large jobs use SQS and an outbox. Existing attempt question revisions remain frozen.

Mocks enforce question totals and sufficient inventory, reject missing/deactivated content before publication and flag recently used questions. Published sitting rules are locked after the first attempt; staff correction uses an audited incident workflow rather than silent changes to active exams.

## Sensitive changes

Refunds, access extensions, roles, broadcasts and publication need clear confirmation and persisted reason where appropriate. Verify permissions, display targeted audience/count before sending, and distinguish queued from delivered. Staff exports and previews use no-store and scoped temporary downloads. Every state change records principal, entity, time, reason and correlation ID while excluding passwords, OTPs and full payment card data.
