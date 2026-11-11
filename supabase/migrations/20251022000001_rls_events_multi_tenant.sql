-- Ajustar RLS de events/invitations/album_images para multi-tenant + acceso público por token
-- Mantener acceso público por token para vista invitado

-- Events: miembros de la org pueden ver/gestionar; público puede ver evento activo vía token (se mantiene lógica existente + org)
DROP POLICY IF EXISTS "events_select_authenticated" ON public.events;
DROP POLICY IF EXISTS "events_insert_authenticated" ON public.events;
DROP POLICY IF EXISTS "events_update_authenticated" ON public.events;
DROP POLICY IF EXISTS "events_delete_authenticated" ON public.events;

CREATE POLICY events_select_members ON public.events FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM public.memberships m WHERE m.organization_id = events.organization_id AND m.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.memberships m WHERE m.user_id = auth.uid() AND m.role = 'platform_admin')
  )
);

CREATE POLICY events_manage ON public.events FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = events.organization_id AND m.user_id = auth.uid() AND m.role IN ('org_admin','event_admin','platform_admin')
  )
);

-- Mantener política pública para anon (ya existente) - no tocar
