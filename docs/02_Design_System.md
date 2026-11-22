# RoyalPrep design system

Use the RoyalPrep ZIP as the source of truth for visual identity. The core values below are taken directly from `royalprep-web/app/globals.css`; [the token JSON](design/royalprep.tokens.json) preserves CSS names, unmodified values and representative style rules. Use the provided marks in `public/brand/logo-256.png` and `logo-512.png`. Publish configurable brand and hero assets through the CMS. The branded app launcher icon is a build asset.

## Semantic color mapping

| Token | Light | Dark override | Role |
|---|---|---|---|
| navy | #0f1a33 | Inherits | Header, hero, primary dark action |
| navy-2 | #2a3d6b | Inherits | Hero gradient endpoint |
| gold | #c9a227 | #e2c15a | Accent, highlighted hero phrase |
| gold-soft | #f6ebc4 | Inherits | Soft gold, primary button gradient start |
| hl | #ffe89a | #6b5a12 | Note highlight background |
| cream / bg | #fbf8f0 | #121b30 / #0b1222 | Accent surface and page background |
| surface | #ffffff | #121b30 | Card, dialog and form surface |
| ink / muted | #1b2236 / #5a6276 | #ece8dc / #a9b0c2 | Primary and secondary text |
| line | #e6dfcc | #25304a | Dividers and borders |
| learn / learn-bg | #2f6fd0 / #eaf1fd | Inherits / #16243f | Learning accent and tile |
| practice / practice-bg | #e07b12 / #fdf0e3 | Inherits / #33230f | Practice accent and tile |
| revise / revise-bg | #2e9150 / #e8f6ee | Inherits / #12301f | Revision accent and tile |
| purple / purple-bg | #7a4cc2 / #f1eafb | Inherits / #251b38 | Supplemental feature accent |
| good / bad / warn | #2e9150 / #c23a3a / #b8901c | Inherits | Status accents with text or an icon |

Use Cormorant Garamond for headings, Nunito Sans for body and interface text. Web heading sizes follow source H1 `clamp(2rem, 5vw, 3.2rem)`, H2 `clamp(1.6rem, 3.5vw, 2.2rem)` and H3 `1.35rem`. Body is 16px at line height 1.55. Register equivalent fonts in the bare build and use native system fallbacks if loading fails. Exam shell reference uses Arial and exam palette #f2f2f2, #111111, #1d3b6e and white. Native exam UI can use the platform sans-serif fallback.

## Layout and components

- The source uses a 1120px content wrapper with 16px insets, 56px section spacing, 16px grid gaps, 20px card padding, 16px card radius, and shadow `0 2px 10px rgba(15, 26, 51, 0.07)`. The MVP may reduce spacing at narrow sizes while preserving hierarchy.
- **Hero:** navy radial gold tint over a 160-degree navy gradient, white H1, gold accent, lead text #dbe1ee. Optional media uses responsive crop and alt text. Render admin-managed blocks inside this constrained shell.
- **Actions:** gold gradient uses gold-soft → gold at 135 degrees with navy text. Secondary actions use navy/white or outline. Cover focus, pressed, busy and disabled states. Reserve primary action space while busy.
- **Cards and chips:** identify module and state through copy or icon as well as color. Use ink for small text on accent surfaces where the accent itself lacks sufficient contrast. A chapter card includes title, optional topic/subtitle and access state. Skeletons preserve layout.
- **Forms:** visible labels, 12px input radius from source, inline field errors, input-mode OTP and keyboard navigation. Confirmation dialogs restore focus, handle Escape where appropriate and never mask unsaved state.
- **Mock screen:** time, progress and submit are always discoverable. Compact layouts open question grid in a drawer and preserve scroll context. Options show selected state independently of correctness. Review adds correct/incorrect markers and explanations.
- **Reader and tutor:** readable paragraph width and spacing, accessible section anchors, overlays with pointer events disabled and meaningful contrast for watermarks. Tutor drawer or inline panel supports keyboard and large font settings. Present relevant source link and remaining quota.
- **Admin shell:** navy header, white/cream form panels, restrained density and the same token values. Use responsive form columns and explicit draft/published badges. Preview supports phone, tablet and desktop.

## Responsive and accessibility rules

The ZIP uses 820px for portal and header transitions, with additional 640px and 1100px library changes. Preserve that intent. Under 640px use one-column content and wrapping actions. At 640–820px allow two-column cards when usable. Over 820px expose desktop navigation and two- or three-column workspaces where content fits. Use 1100px as the upper library density breakpoint. On native, size via available window width and font scale, with safe areas and a single readable column for phone forms.

Validate at 320, 390, 768, 820, 1024 and 1440 CSS px, tablet portrait and landscape, 200% zoom, large Android text, and keyboard-only navigation. Keep controls reachable with the on-screen keyboard, avoid whole-page horizontal overflow, honor reduced motion and verify contrast in both themes if dark mode ships. Only status copy and domain data come from runtime configuration; design tokens are stable code assets.

## Expanded screen coverage

Apply this identity to the complete 52-screen product. Add accessible audio/video controls, due-card states, study task lists, saved-item editors, results visualizations and dense staff forms using the same semantic palette. Public web, student portal and admin have different navigation and density within one visual system. The web repository shares design primitives and token definitions; Android consumes equivalent typed theme values. The current package uses PostgreSQL for persistence and leaves visual token values intact.
