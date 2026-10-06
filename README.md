# Chubut Web V7 — Premium dark tourism portal + CMS

This package upgrades the V6 site into a fully editable Supabase-backed tourism website.

## Public site

- English is the default language, with a complete EN/ES switch.
- The hero uses **one YouTube video only**; there is no hero carousel.
- Visual direction is dark, image-led and editorial, with black as the dominant color.
- The structure takes product/UX cues from official destination portals such as Tourism New Zealand and Visit Iceland: strong destination hierarchy, trip-planning shortcuts, curated experiences, regional/destination discovery, cinematic storytelling and clear planning CTAs.
- The Orcas and Laberinto videos remain in the “Chubut in Motion” gallery, not in the hero.

## Admin CMS (`/admin/`)

The admin behaves like a simplified WordPress/Webflow content system:

- Reorder sections with drag and drop.
- Show/hide, duplicate, edit and delete sections.
- Add new sections from templates.
- Edit English and Spanish content side by side.
- Edit images, YouTube IDs, local video URLs and links.
- Edit section structure/layout settings.
- Edit global colors, typography, spacing, width, radius and motion.
- Manage navigation and highlighted CTA.
- Upload/delete/copy media from Supabase Storage.
- Review trip-form submissions.
- Automatic revision history and one-click restore.
- General brand and bilingual SEO settings.
- Integrated site preview.
- Advanced JSON editor for edge cases.

## Files

- `index.html`: public shell.
- `css/styles.css`: public design system.
- `js/content.js`: bundled default CMS payload.
- `js/app.js`: dynamic page renderer.
- `js/supabase.js`: Supabase data/storage API.
- `admin/`: full CMS interface.
- `supabase/schema.sql`: database/RLS/storage schema.
- `SUPABASE_SETUP.md`: setup instructions.

See `SUPABASE_SETUP.md` before using the admin in production.
