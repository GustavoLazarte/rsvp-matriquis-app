-- =============================================================
-- RSVP App - FASE 2 (post-deploy del bundle): RLS + políticas + revoke
-- Aplicar SOLO después de que el bundle con las RPCs esté desplegado,
-- en caso contrario la página pública actual se rompe (anon 401).
-- =============================================================

alter table public.events enable row level security;
alter table public.album_images enable row level security;
alter table public.event_images enable row level security;
alter table public.invitations enable row level security;
alter table public.rsvp_responses enable row level security;

drop policy if exists "events_anon_select_active" on public.events;
create policy "events_anon_select_active"
  on public.events for select to anon
  using (status = 'active');

drop policy if exists "events_admin_all" on public.events;
create policy "events_admin_all"
  on public.events for all to authenticated
  using (admin_id = auth.uid())
  with check (admin_id = auth.uid());

drop policy if exists "album_images_anon_select_active" on public.album_images;
create policy "album_images_anon_select_active"
  on public.album_images for select to anon
  using (exists (
    select 1 from public.events e
    where e.id = album_images.event_id and e.status = 'active'
  ));

drop policy if exists "album_images_admin_all" on public.album_images;
create policy "album_images_admin_all"
  on public.album_images for all to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = album_images.event_id and e.admin_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = album_images.event_id and e.admin_id = auth.uid()
  ));

drop policy if exists "event_images_anon_select_active" on public.event_images;
create policy "event_images_anon_select_active"
  on public.event_images for select to anon
  using (exists (
    select 1 from public.events e
    where e.id = event_images.event_id and e.status = 'active'
  ));

drop policy if exists "event_images_admin_all" on public.event_images;
create policy "event_images_admin_all"
  on public.event_images for all to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_images.event_id and e.admin_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = event_images.event_id and e.admin_id = auth.uid()
  ));

drop policy if exists "invitations_admin_all" on public.invitations;
create policy "invitations_admin_all"
  on public.invitations for all to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = invitations.event_id and e.admin_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = invitations.event_id and e.admin_id = auth.uid()
  ));

drop policy if exists "rsvp_responses_admin_all" on public.rsvp_responses;
create policy "rsvp_responses_admin_all"
  on public.rsvp_responses for all to authenticated
  using (exists (
    select 1 from public.invitations i
    join public.events e on e.id = i.event_id
    where i.id = rsvp_responses.invitation_id and e.admin_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.invitations i
    join public.events e on e.id = i.event_id
    where i.id = rsvp_responses.invitation_id and e.admin_id = auth.uid()
  ));

revoke all on table public.invitations from anon;
revoke all on table public.rsvp_responses from anon;
