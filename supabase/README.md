# Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env`.
4. Fill:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Restart the dev server.

The public frontend can read `site_stats`, call `increment_like_count()`, and insert `advice_messages`.
Visitors cannot read messages from the frontend because no public select policy is defined for `advice_messages`.

