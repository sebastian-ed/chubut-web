# CMS editor layout fix — v8.1.1

- The desktop section editor is anchored to the CMS editing column (after the 236px sidebar).
- Removed the off-canvas left transition that could leave the editor visibly trapped underneath the sidebar.
- The editor now fades in at its final position while the live preview remains visible on the right.
- Added width containment for bilingual fields and form controls.
- Public site, Supabase model, content and CMS features are unchanged.
