# Cómo correr local con Supabase + datos seed

## 1) Instalar dependencias
```bash
npm install
```

## 2) Iniciar Supabase local (opcional pero recomendado)
```bash
supabase start
```
Usa las URLs/keys que te muestre.

## 3) Aplicar migraciones
```bash
supabase db reset  # aplica migraciones + seed si configuras
# o
supabase migration up
```

## 4) Ejecutar seed
Copia `supabase/seed/seed.sql` y ejecútalo en SQL Editor local o:
```bash
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/seed/seed.sql
```

## 5) Crear usuarios auth (para logins)
Necesitas crear usuarios en Auth con los UUIDs del seed:
- 00000000-0000-0000-0000-000000000001 (org_admin M&J)
- 00000000-0000-0000-0000-000000000002 (org_admin Luna)
- 00000000-0000-0000-0000-000000000003 (platform_admin)

Con Supabase Studio: Authentication > Users > Add user

## 6) Arrancar app
```bash
npm start
```

## URLs para probar
- Login: http://localhost:4200/login
- Platform Admin: http://localhost:4200/platform-admin
- Org Admin: http://localhost:4200/org-admin
- Plantillas: http://localhost:4200/templates
- Invitaciones:
  - http://localhost:4200/rsvp/mj-abc123xyz
  - http://localhost:4200/rsvp/mj-def456uvw
  - http://localhost:4200/rsvp/ac-ghi789rst
  - http://localhost:4200/rsvp/ld-jkl012opq
