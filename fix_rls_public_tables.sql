-- =============================================================
-- RSVP App - Fix galería pública (anon)
-- La RLS de fase 2 dejó events / album_images / event_images
-- visibles para anon solo si events.status = 'active'.
-- El evento actual no tiene ese status (no hay UI para marcarlo),
-- por lo que un invitado anónimo ve el álbum/galeña vacío
-- (parece fallar solo en mobile porque en desktop suele haber
-- sesión de dashboard autenticada).
-- Estas 3 tablas son contenido público del sitio (no sensibles);
-- invitations y rsvp_responses siguen bloqueadas para anon.
-- =============================================================

drop policy if exists "events_anon_select_active" on public.events;
create policy "events_anon_select_active"
  on public.events for select to anon
  using (true);

drop policy if exists "album_images_anon_select_active" on public.album_images;
create policy "album_images_anon_select_active"
  on public.album_images for select to anon
  using (true);

drop policy if exists "event_images_anon_select_active" on public.event_images;
create policy "event_images_anon_select_active"
  on public.event_images for select to anon
  using (true);
