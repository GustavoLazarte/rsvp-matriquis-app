-- =============================================================
-- RSVP App - Rollback de fix_rls.sql
-- IMPORTANTE: el rollback debe ir SIEMPRE acompañado del deploy
-- del bundle ANTERIOR (la app usa las RPCs; sin ellas, y sin
-- anon directo a tablas, la página pública quedaría rota).
-- =============================================================

drop function if exists public.respond_invitation(text, text, integer, text, text, inet);
drop function if exists public.track_open(text);
drop function if exists public.get_invitation(text);

drop policy if exists "rsvp_responses_admin_all" on public.rsvp_responses;
drop policy if exists "invitations_admin_all" on public.invitations;
drop policy if exists "event_images_admin_all" on public.event_images;
drop policy if exists "event_images_anon_select_active" on public.event_images;
drop policy if exists "album_images_admin_all" on public.album_images;
drop policy if exists "album_images_anon_select_active" on public.album_images;
drop policy if exists "events_admin_all" on public.events;
drop policy if exists "events_anon_select_active" on public.events;

alter table public.events disable row level security;
alter table public.album_images disable row level security;
alter table public.event_images disable row level security;
alter table public.invitations disable row level security;
alter table public.rsvp_responses disable row level security;

grant all on table public.invitations to anon;
grant all on table public.rsvp_responses to anon;
