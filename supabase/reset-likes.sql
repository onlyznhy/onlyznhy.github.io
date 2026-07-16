insert into public.site_stats (id, likes)
values ('main', 0)
on conflict (id) do update
set likes = 0,
    updated_at = now();
