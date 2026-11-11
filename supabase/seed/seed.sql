-- Seed para desarrollo local con varios novios + admin
INSERT INTO public.organizations (id, name, slug, primary_color) VALUES
('11111111-1111-1111-1111-111111111111', 'Bodas M&J', 'bodas-myj', '#b89b5b'),
('22222222-2222-2222-2222-222222222222', 'Eventos Luna', 'eventos-luna', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, organization_id, admin_id, title, slug, description, event_date, location, adress, adress_url, max_guests, status, primary_color) VALUES
('aaaa1111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Boda María & José', 'maria-jose', 'Celebración de nuestra boda', '2026-12-12T18:00:00Z', 'Hacienda Los Pinos', 'Camino Los Pinos 123', 'https://maps.google.com', 150, 'active', '#b89b5b'),
('aaaa2222-aaaa-2222-aaaa-222222222222', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Boda Ana & Carlos', 'ana-carlos', '¡Nos casamos!', '2027-03-20T17:00:00Z', 'Salón El Jardín', 'Av. Jardín 456', 'https://maps.google.com', 100, 'active', '#d97757'),
('bbbb1111-bbbb-1111-bbbb-111111111111', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Boda Lucía & Diego', 'lucia-diego', 'Te esperamos para celebrar', '2027-06-05T16:00:00Z', 'Finca La Paz', 'Ruta 9 Km 45', 'https://maps.google.com', 80, 'active', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

UPDATE public.events SET template_id = (SELECT id FROM public.templates WHERE slug='classic' LIMIT 1) WHERE id IN ('aaaa1111-aaaa-1111-aaaa-111111111111','aaaa2222-aaaa-2222-aaaa-222222222222');
UPDATE public.events SET template_id = (SELECT id FROM public.templates WHERE slug='floral' LIMIT 1) WHERE id = 'bbbb1111-bbbb-1111-bbbb-111111111111';

INSERT INTO public.invitations (id, event_id, token, guest_name, guest_email, plus_one_allowed, status) VALUES
('inv-1111-0001', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'mj-abc123xyz', 'Familia López', 'lopez@test.com', 2, 'pending'),
('inv-1111-0002', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'mj-def456uvw', 'Juan Pérez', 'juan@test.com', 1, 'pending'),
('inv-2222-0001', 'aaaa2222-aaaa-2222-aaaa-222222222222', 'ac-ghi789rst', 'María González', 'maria@test.com', 1, 'pending'),
('inv-3333-0001', 'bbbb1111-bbbb-1111-bbbb-111111111111', 'ld-jkl012opq', 'Pedro Martínez', 'pedro@test.com', 2, 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.event_themes (event_id, primary_color, secondary_color, logo_url) VALUES
('aaaa1111-aaaa-1111-aaaa-111111111111', '#b89b5b', '#f5f3f0', 'https://placehold.co/200x80?text=M%26J'),
('aaaa2222-aaaa-2222-aaaa-222222222222', '#d97757', '#fff7ed', 'https://placehold.co/200x80?text=A%26C'),
('bbbb1111-bbbb-1111-bbbb-111111111111', '#8b5cf6', '#f3f0ff', 'https://placehold.co/200x80?text=L%26D')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO public.memberships (organization_id, user_id, role) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'org_admin'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'org_admin'),
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'platform_admin')
ON CONFLICT (organization_id, user_id) DO NOTHING;

INSERT INTO public.users_profiles (id, full_name) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin M&J'),
('00000000-0000-0000-0000-000000000002', 'Admin Luna'),
('00000000-0000-0000-0000-000000000003', 'Platform Admin')
ON CONFLICT (id) DO NOTHING;
