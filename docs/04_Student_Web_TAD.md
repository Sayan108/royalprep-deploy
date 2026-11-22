# Student website technical architecture

Implement screens 1–42 using the routes in the PRD. Public tools, marketing, legal and sample pages are indexable when approved. Auth, checkout, study attempts, personal results and saved material are noindex and private. Render title, description, canonical, social metadata and approved structured data with React Helmet. Generate sitemap entries from published records; absent or unpublished public resources return HTTP 404.

## Feature groups

- Public CMS loads hero, course catalog, chapter previews, pricing, about, support and policy content through published endpoints.
- Tools use versioned eligibility and planner inputs; validate dates, time budgets and supported rule combinations before returning computed results. Orientation guide and exam dates retain sourced verified metadata.
- Reader uses sanitized structured content, stable section anchors and progress checkpoints. Saved sections, highlights and personal notes refer to a specific content revision and anchor, with handling when later revisions retire the anchor.
- Practice and custom mock builder use question inventory counts from the backend. Filters reflect that student's history; published question revisions are selected and frozen at start.
- Assessment shell separates tutor practice reveal from timed exam mode. A timer derived from server time is resynchronized on focus and reconnect. Flags, selected options and allowed CBT tools are attempt-scoped.
- Review and results request server-calculated chapter breakdown, percentiles, pass estimates, readiness and score series. Empty and low-data states explain which evidence is missing.
- Revision, flashcards, radio, video and recalls use the learning services described in 09_AI_And_Learning_TAD.md.
- Profile manages consent and sessions; billing launches provider checkout only with a validated server order. Handle redirects, closed windows and pending order reconciliation.

## Exam consistency

Create attempts using an idempotency key. Persist answer selections through versioned writes; distinguish local pending selections from server-acknowledged values. Do not replay unsent answers after the deadline. Submission waits for active saves when time permits and finalizes once. Concurrent-device stale writes produce 409 and a current-state reload. The same complete answer key cannot be sent in initial question DTOs.

Daily Quiz has five questions per date. Daily Mock uses configured duration, release window and count. Grand Mock supports registration and event states within the mock hub. Final rankings count valid scored attempts only and freeze at close. Protect personal percentile and result access.

## Content protection and responsive behavior

Authorized proxy or temporary delivery grants cover notes and protected media. Public samples are separately flagged. Apply pseudonymous watermark, disabled official download actions and print deterrents without breaking screen-reader access. OS-level website screenshot blocking cannot be guaranteed.

Desktop can show an exam sidebar or reader TOC; phone uses a drawer or collapsible navigation. Tablet layout follows available width and touch targets. Input keyboard must not obscure tutor or submit actions. All assessments remain usable at 200% zoom and with reduced motion.
