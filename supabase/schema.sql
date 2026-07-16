create table if not exists public.site_stats (
  id text primary key,
  likes integer not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.site_stats (id, likes)
values ('main', 0)
on conflict (id) do nothing;

create table if not exists public.advice_messages (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(trim(content)) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.site_stats enable row level security;
alter table public.advice_messages enable row level security;

drop policy if exists "Public can read site stats" on public.site_stats;
create policy "Public can read site stats"
on public.site_stats
for select
to anon
using (id = 'main');

drop policy if exists "Public can submit advice messages" on public.advice_messages;
create policy "Public can submit advice messages"
on public.advice_messages
for insert
to anon
with check (char_length(trim(content)) between 1 and 1000);

create or replace function public.increment_like_count()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_likes integer;
begin
  insert into public.site_stats (id, likes)
  values ('main', 1)
  on conflict (id) do update
  set likes = public.site_stats.likes + 1,
      updated_at = now()
  returning likes into next_likes;

  return next_likes;
end;
$$;

grant execute on function public.increment_like_count() to anon;
