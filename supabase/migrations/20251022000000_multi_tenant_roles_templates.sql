-- Multi-tenant + roles + plantillas para convertir POC en SaaS
-- Mantener compatibilidad: se añaden columnas nullable + backfill

-- 1) Organizaciones
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#b89b5b',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Perfiles de usuario
CREATE TABLE IF NOT EXISTS public.users_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Membresías (roles por organización)
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('platform_admin','org_admin','event_admin','viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 4) Plantillas
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.templates (name, slug, description, config) VALUES
('Clásica', 'classic', 'Elegante y minimal con tipografías serif', '{"sections":["hero","countdown","story","gallery","rsvp","logistics","music"],"fonts":{"heading":"Cormorant","body":"Inter"}}'),
('Minimal', 'minimal', 'Limpio, moderno y enfocado al RSVP', '{"sections":["hero","rsvp","logistics","gallery"],"fonts":{"heading":"Jost","body":"Inter"}}'),
('Floral', 'floral', 'Romántico con detalles florales', '{"sections":["hero","story","gallery","rsvp","logistics","gifts"],"fonts":{"heading":"Great Vibes","body":"Lora"}}'),
('Moderna', 'moderna', 'Contemporáneo con mucho aire', '{"sections":["hero","countdown","gallery","rsvp","logistics"],"fonts":{"heading":"Satoshi","body":"Inter"}}')
ON CONFLICT (slug) DO NOTHING;

-- 5) Añadir organization_id a events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.templates(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS custom_domain TEXT;

-- 6) Temas por evento (personalización cliente)
CREATE TABLE IF NOT EXISTS public.event_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE UNIQUE,
  primary_color TEXT,
  secondary_color TEXT,
  background_color TEXT,
  text_color TEXT,
  accent_color TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  fonts JSONB DEFAULT '{}'::jsonb,
  sections JSONB DEFAULT '{"hero":true,"countdown":true,"story":true,"gallery":true,"rsvp":true,"logistics":true,"music":true,"gifts":true}'::jsonb,
  custom_css TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7) Dominios personalizados
CREATE TABLE IF NOT EXISTS public.event_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT,
  dns_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ
);

-- 8) Backfill: crear org para evento existente si no hay
DO $$
DECLARE
  v_org_id UUID;
  v_event_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.organizations) AND EXISTS (SELECT 1 FROM public.events) THEN
    INSERT INTO public.organizations (name, slug) VALUES ('Default Org', 'default-org') RETURNING id INTO v_org_id;
    FOR v_event_id IN SELECT id FROM public.events WHERE organization_id IS NULL LOOP
      UPDATE public.events SET organization_id = v_org_id WHERE id = v_event_id;
    END LOOP;
  END IF;
END $$;

-- 9) Índices
CREATE INDEX IF NOT EXISTS idx_events_org ON public.events(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON public.memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_event ON public.invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_album_images_event ON public.album_images(event_id);

-- 10) RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_domains ENABLE ROW LEVEL SECURITY;

-- Platform admin ve todo (vía membership)
CREATE POLICY org_select ON public.organizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.memberships m WHERE m.organization_id = organizations.id AND m.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.memberships m WHERE m.user_id = auth.uid() AND m.role = 'platform_admin')
);

CREATE POLICY org_admin_all ON public.organizations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.memberships m WHERE m.organization_id = organizations.id AND m.user_id = auth.uid() AND m.role IN ('org_admin','platform_admin'))
);

CREATE POLICY profile_self ON public.users_profiles FOR ALL USING (id = auth.uid());

CREATE POLICY memberships_select ON public.memberships FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.memberships m WHERE m.organization_id = memberships.organization_id AND m.user_id = auth.uid() AND m.role IN ('org_admin','platform_admin'))
);

CREATE POLICY memberships_manage ON public.memberships FOR ALL USING (
  EXISTS (SELECT 1 FROM public.memberships m WHERE m.organization_id = memberships.organization_id AND m.user_id = auth.uid() AND m.role IN ('org_admin','platform_admin'))
);

CREATE POLICY templates_read ON public.templates FOR SELECT USING (true);

CREATE POLICY themes_org ON public.event_themes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.memberships m ON m.organization_id = e.organization_id
    WHERE e.id = event_themes.event_id AND m.user_id = auth.uid() AND m.role IN ('org_admin','event_admin','platform_admin')
  )
);

CREATE POLICY domains_org ON public.event_domains FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.memberships m ON m.organization_id = e.organization_id
    WHERE e.id = event_domains.event_id AND m.user_id = auth.uid() AND m.role IN ('org_admin','event_admin','platform_admin')
  )
);
