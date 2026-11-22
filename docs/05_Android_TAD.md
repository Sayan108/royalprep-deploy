# Android application technical architecture

Use a separate bare React Native repository with TypeScript, React Navigation, Redux Toolkit, Redux Saga and Redux Persist for approved preferences. Structure src as app/pages/widgets/features/entities/shared. Use the same contracts and business calculations as the API, maintained through generated types or a versioned package.

## Native screen mapping

Sign-in maps to screen 13. Screens 14–36 have native equivalents including reader, practice, custom mocks, timed exam, results, revision packs, spaced flashcards, radio, masterclasses, recall lists, mistakes, saved items, final-week plan, tutor history, privacy and plan status. Web-first tools remain available on the student site. Policies and contact/help have in-app navigation. Billing screen on Android displays current access, expiry and historical status; purchasing stays on the website under the agreed consumption model.

## State and security

Keep short-lived access credentials in memory and refresh credentials in Android Keystore-backed storage. Restore the session before showing protected navigation. Never persist tokens or paid notes through AsyncStorage/Redux Persist. Saga handles refresh coalescing, media progress, queued acknowledged interactions and expired-attempt recovery. Cross-device sync comes from the API, with version checks on learning and assessment updates.

Set FLAG_SECURE on protected native windows before rendering, and cover dialogs, video surfaces, recents, background transition and casting. Restricted content renderer disables arbitrary navigation and unexpected JavaScript bridges. Watermark protected materials. Camera recording and modified devices cannot be controlled by the app.

## Native interactions

Exam controls use safe areas, clear timer/save status and a mobile question-grid sheet. Restore accepted answers from the API after interruption. Record flashcard ratings as unique review events. Media uses authenticated delivery with speed, seek and server-backed progress; handle URL renewal and entitlement expiry. Tutor conversations are paginated and owner-scoped, with bounded prompt context and source navigation to the relevant chapter anchor.

Validate physical devices, font scaling, portrait/landscape, interruptions, screen capture, seek/resume and deep-link guard behavior. Deliver signed AAB, testing build, release settings and an API compatibility matrix for phased rollout.
