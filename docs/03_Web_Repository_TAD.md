# Shared web repository technical architecture

One Git repository holds both web applications. They produce separate artifacts and deploy independently. Use React, TypeScript strict, React Router, Redux Toolkit, Redux Saga, Redux Persist, an HTTP client and React Helmet through react-helmet-async with lockfile-verified React compatibility.

## Structure

royalprep-web/
- apps/student/src/app, pages, widgets, features, entities, shared
- apps/admin/src/app, pages, widgets, features, entities, shared
- packages/ui for tokens, accessible primitives and CMS block renderers
- packages/contracts for generated DTO types and runtime validation helpers
- packages/config for technical constants and build configuration
- deploy/student and deploy/admin for separate reverse-proxy and service configuration

Use basic feature-sliced layering with downward dependencies. Keep tiny page interactions in pages. Shared packages expose intentional entry points; student code cannot import admin modules. Root package scripts build either application or both. Each app has its own environment example and output directory. A workspace package manager in this single web repository is a proposed implementation choice.

## Deployment and session boundary

student.example and admin.example are illustrative origins configured through environment values. The student build never imports staff screens, staff permissions or admin credentials. Admin source is shared through Git, not through the publicly served student bundle. A release records web app, shared package and API contract versions; changes to shared contracts trigger both builds but need not force simultaneous deployment when backward-compatible.

Route /api through each deployment's reverse proxy to the same Express API. Browser sessions are host-only Secure HttpOnly cookies scoped to the appropriate principal. Admin and student login contexts are separate. Browser mutations verify Origin and CSRF tokens; the API authorizes the principal and entity for every operation. Avoid domain-wide cookies across subdomains. Explicitly allow only configured origins if cross-origin requests are used.

Public student routes use an Express React rendering entry and request-scoped state, then hydrate using the same published data snapshot. Authenticated portal and admin screens may render client-side. SEO tags and meaningful public content must exist in first-response HTML. Admin deployment sets noindex and remains authorization protected.

## Shared state and delivery

Each app owns its store and root saga. Persist only approved preferences; credentials, note bodies, answer keys and personal exported data remain outside Redux Persist. Handle session restore before guarded routing. Coalesce refresh calls, replay safe requests once and cancel obsolete reads. Sequential answer mutation sagas retain explicit pending/acknowledged state and use server versions to resolve conflicts.

Load runtime content/configuration after boot; use a clear unavailable state rather than prototype data on failure. Admin previews render the same hero component and schema as student publication. The existing navy/gold tokens remain bundled code assets. Use responsive grids, 320px minimum layout QA, tablet rotation and accessible focus states.
