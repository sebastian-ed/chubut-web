# V8.2 — Integrated editor fix

- The section editor is now an actual CMS workspace column on desktop, not a floating/fixed drawer.
- Opening a section replaces the left content pane while keeping Live Preview on the right.
- Close (×), Cancel, Escape and navigation changes all close the editor reliably.
- Mobile keeps an overlay drawer because the screen is too narrow for two columns.
- Supabase configuration is included in `js/supabase-config.js`.
- The provided Supabase URL ended in `.supabase.coo`; it was normalized to the standard `.supabase.co` project domain.
