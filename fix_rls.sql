-- =============================================================
-- RSVP App - RLS hardening
-- Local dev: aplicar con `docker exec -i supabase_db_rsvp-app psql -U postgres -d postgres -f - < fix_rls.sql`
-- Prod:      aplicar desde SQL editor del dashboard (coordinar con deploy del bundle).
-- Rollback:  fix_rls_rollback.sql
-- =============================================================

-- -------------------------------------------------------------
-- 1) RPCs para flujos públicos (anon), seguros por token secreto
-- -------------------------------------------------------------

create or replace function public.get_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.invitations%rowtype;
  v_event public.events%rowtype;
  v_response public.rsvp_responses%rowtype;
begin
  select * into v_invitation from public.invitations where token = p_token limit 1;
  if not found then
    raise exception 'invitation not found';
  end if;

  select * into v_event from public.events where id = v_invitation.event_id;
  select * into v_response from public.rsvp_responses where invitation_id = v_invitation.id;

  return jsonb_build_object(
    'invitation', to_jsonb(v_invitation),
    'event', to_jsonb(v_event),
    'response', case
      when v_response is null then null::jsonb
      else to_jsonb(v_response)
    end
  );
end;
$$;

create or replace function public.track_open(p_token text)
returns public.invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.invitations%rowtype;
begin
  select * into v_inv from public.invitations where token = p_token limit 1;
  if not found then
    raise exception 'invitation not found';
  end if;

  update public.invitations
     set opened_count = coalesce(opened_count, 0) + 1,
         last_opened_at = now(),
         status = case when status = 'pending' then 'opened' else status end
   where id = v_inv.id
   returning * into v_inv;

  return v_inv;
end;
$$;

create or replace function public.respond_invitation(
  p_token text,
  p_attending text,
  p_guest_count integer,
  p_dietary_notes text default null,
  p_message text default null,
  p_ip inet default null
)
returns public.rsvp_responses
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.invitations%rowtype;
  v_resp public.rsvp_responses%rowtype;
begin
  if p_attending is null or p_attending not in ('yes', 'no', 'maybe') then
    raise exception 'attending must be one of: yes, no, maybe';
  end if;
  if p_guest_count is null or p_guest_count < 1 then
    raise exception 'guest_count must be >= 1';
  end if;

  select * into v_inv from public.invitations where token = p_token limit 1;
  if not found then
    raise exception 'invitation not found';
  end if;
  if v_inv.status = 'revoked' then
    raise exception 'invitation is revoked';
  end if;
  if p_guest_count > 1 and coalesce(v_inv.plus_one_allowed, 0) < 1 then
    raise exception 'plus one not allowed';
  end if;

  insert into public.rsvp_responses(invitation_id, attending, guest_count, dietary_notes, message, ip_address)
  values (v_inv.id, p_attending, p_guest_count, p_dietary_notes, p_message, p_ip)
  on conflict (invitation_id) do update
    set attending = excluded.attending,
        guest_count = excluded.guest_count,
        dietary_notes = excluded.dietary_notes,
        message = excluded.message,
        ip_address = excluded.ip_address,
        responded_at = now()
  returning * into v_resp;

  update public.invitations set status = 'responded' where id = v_inv.id;

  return v_resp;
end;
$$;

grant execute on function public.get_invitation(text) to anon, authenticated;
grant execute on function public.track_open(text) to anon, authenticated;
grant execute on function public.respond_invitation(text, text, integer, text, text, inet) to anon, authenticated;

-- -------------------------------------------------------------
-- 2) Habilitar RLS en las 5 tablas
-- -------------------------------------------------------------
alter table public.events enable row level security;
alter table public.album_images enable row level security;
alter table public.event_images enable row level security;
alter table public.invitations enable row level security;
alter table public.rsvp_responses enable row level security;

-- -------------------------------------------------------------
-- 3) events
--    anon: solo SELECT de eventos activos (página pública / landing)
--    authenticated: CRUD completo donde el usuario es el admin
-- -------------------------------------------------------------
drop policy if exists "events_anon_select_active" on public.events;
create policy "events_anon_select_active"
  on public.events for select to anon
  using (status = 'active');

drop policy if exists "events_admin_all" on public.events;
create policy "events_admin_all"
  on public.events for all to authenticated
  using (admin_id = auth.uid())
  with check (admin_id = auth.uid());

-- -------------------------------------------------------------
-- 4) album_images / event_images
--    anon: solo SELECT si el evento está activo
--    authenticated: CRUD completo si el usuario es admin del evento
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- 5) invitations  (sin acceso anon; flujos públicos vía RPC)
--    authenticated: CRUD completo si el usuario es admin del evento
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- 6) rsvp_responses  (sin acceso anon; submit vía RPC)
--    authenticated: CRUD completo si el usuario es admin del evento
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- 7) Defense in depth: quitar acceso anon a tablas privadas
-- -------------------------------------------------------------
revoke all on table public.invitations from anon;
revoke all on table public.rsvp_responses from anon;
