# RoyalPrep complete product and technical handoff

Revision 2 — 21 November 2026

The supplied 52-screen inventory is authoritative and supersedes the earlier narrow MVP exclusions. These documents specify the target product; the current workspace contains an initial implementation slice, with the remaining delivery work tracked in [12_Execution_Plan.md](./12_Execution_Plan.md).

| File | Purpose |
|---|---|
| 01_PRD.md | All 52 screens, behavior and acceptance |
| 02_Design_System.md | Source palette, typography and components |
| 03_Web_Repository_TAD.md | Shared source and separate student/admin deployments |
| 04_Student_Web_TAD.md | Student routes, state, SEO and assessments |
| 05_Android_TAD.md | Bare React Native app and shared student behavior |
| 06_Admin_TAD.md | Staff screens 43–52 and publishing operations |
| 07_Backend_PostgreSQL_TAD.md | Modular MVC, relational model and transactions |
| 08_API_Contracts.md | API groups and consistency rules |
| 09_AI_And_Learning_TAD.md | Chat, flashcards, revision and media |
| 10_Deployment_And_QA.md | EC2 release design and acceptance checks |
| 11_Screen_Traceability.csv | Exactly one mapping for each screen |
| 12_Execution_Plan.md | Sequenced phases, decision gates, granular tasks and acceptance evidence |
| 13_Feature_Checklist.md | Per-screen implementation areas and honest current status |
| design/ | Original token JSON and logo assets |

The target architecture proposes royalprep-web (both web applications), royalprep-android and royalprep-api. Its backend design specifies PostgreSQL; Cloudinary handles media, Redis supports shared cache/throttling when needed and SQS supports durable background jobs. No development pricing is included.

The execution plan distinguishes this target architecture from the current repository implementation and identifies decisions required before migration or feature work.
