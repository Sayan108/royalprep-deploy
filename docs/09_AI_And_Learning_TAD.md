# AI and learning services technical design

## AI tutor and persistent conversations

Store owned chapter-scoped threads and sequenced messages in PostgreSQL. Paginate prior messages and retain source section/revision references. At each request verify active entitlement, tutor switch, active timed mock restriction, input limits and quota. Search published note sections using PostgreSQL full-text search and headings. Use a bounded recent message window plus up to three relevant excerpts; do not send the entire conversation or question bank.

Reserve student/global quota and request ID in a SQL transaction before a hosted OpenAI Responses API call. Calls run outside the database transaction. Persist final status, validated cited section IDs and billed token metrics afterward. Use a unique request record to prevent double billing under client retry; unknown provider completion remains a tracked ambiguous outcome. A missing source match returns an insufficient-source response without a generation call. One active generation per thread preserves message order.

Use model IDs and usage caps from server configuration and select a supported model through medical-editor-reviewed evaluation before launch. Five questions/day is a configurable starting rule. UI must distinguish insufficient sources, quota, unavailable service and completed answer. Staff can turn off generation without deleting history or disabling study.

## Revision and flashcards

Revision items include chapter/revision, content type, yield and recall tags. Add-to-flashcards creates a stable owner reference or a personal card through an idempotent command. A simple versioned scheduling algorithm maps Again/Hard/Good/Easy to due intervals and stores prior state plus review event. Apply reviews under row lock and unique event ID, recomputing the next due date once. Display due counts from SQL and sync after online review. Offline paid-content download is outside this release.

## Recall and mistakes

Fawzia and mixed recalls are content tags with approved provenance. Coverage is calculated from active tagged question revisions. Mistakes derives from submitted answers and records subsequent practice outcomes; retests select published eligible revisions while result history retains original ones. Saved notes and highlights retain owner, content revision and anchor, and show unavailable-source state for retired content.

## Study planner and final week

Planner uses target date, days/hours available and published topic weights to propose tasks. Store the generated plan with algorithm version, allow edits and completion, and recompute only after explicit student action. Final-week views use target date and curated resources. Client-approved eligibility rules and exam facts carry source and verifiedAt fields.

## Media

Store metadata, chapter relationships, captions and access classification in PostgreSQL; Cloudinary stores assets. Public preview assets are explicitly separate from protected full episodes/videos. Generate playback grants after access checks, refresh safely during long playback, and store seek position and completion through versioned checkpoints. Validate resource type, file limits, delivery features and account limits before integration. Captions, speed and resume should have native and web equivalents. Coming-soon flags describe absent recordings accurately.
