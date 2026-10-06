# Supabase setup — Chubut CMS V7

1. Create/open the Supabase project.
2. In **SQL Editor**, run `supabase/schema.sql` completely. It can be run over the earlier V5/V6 schema.
3. In **Project Settings → API**, copy the Project URL and the public publishable/anon key.
4. Put both values in `js/supabase-config.js`.
5. In **Authentication → Users**, create the administrator users that will access `/admin/`.
6. Deploy the whole folder to the same static hosting. The public site works with bundled defaults before the first CMS publish.

## What the CMS stores

- `site_content`: current published website payload.
- `content_revisions`: automatic snapshots created on every publish.
- `media_assets`: metadata for files uploaded to Supabase Storage.
- `trip_leads`: public trip-planner submissions.
- `chubut-media`: public Storage bucket for website images and video assets.

## Security model

Public visitors can only read published site content/media and submit the public trip form. Authenticated Supabase users can manage CMS content, revisions and media. For a small editorial team, only create Authentication users for actual administrators.
