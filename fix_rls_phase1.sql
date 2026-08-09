-- =============================================================
-- RSVP App - FASE 1 (pre-deploy del bundle): RPCs seguras por token
-- Seguro de aplicar con el bundle ACTUAL en producción (no rompe nada).
-- =============================================================

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
