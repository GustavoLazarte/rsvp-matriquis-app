# RSVP App — Documentación

## Descripción General

Aplicación web para gestionar invitaciones de eventos (bodas, fiestas, etc.). Permite a los anfitriones crear eventos, enviar invitaciones personalizadas a sus invitados, y administrar las confirmaciones de asistencia (RSVP) desde un panel de control.

## Arquitectura

- **Framework**: Angular 15+ con NgModules
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: Angular Signals (no RxJS/BehaviorSubject)
- **Estilos**: SCSS con CSS custom properties
- **Fuentes**: Cormorant Garamond (serif) + DM Sans (sans-serif)

## Estructura de la App

### Rutas

| Ruta | Módulo | Auth | Descripción |
|------|--------|------|-------------|
| `/login` | LoginModule | No | Login del admin |
| `/select-event` | EventSelectModule | Sí | Seleccionar evento a administrar |
| `/dashboard` | DashboardModule | Sí | Panel de administración |
| `/invi/:inviId` | InviModule | No | Invitación pública del invitado |

### Módulos principales

#### Invitación Pública (`/invi/:inviId`)
Página que recibe el invitado con todas las secciones del evento:

1. **Ticker** — Barra superior con fecha en scroll infinito
2. **Hero** — Sección principal con nombres de la pareja y fecha
3. **Story** — Historia de la pareja
4. **Album** — Galería de fotos estilo polaroid con lightbox
5. **Timeline** — Cronograma del evento (desktop: eje central, mobile: lista vertical)
6. **Logistics** — Cuándo, dónde, y botón de calendar (Google Calendar + .ics)
7. **Weather** — Clima del día del evento (API Open-Meteo)
8. **Dresscode** — Colores de vestimenta
9. **Gifts** — Opciones de regalos
10. **Upload** — Zona para que los invitados suban fotos
11. **RSVP Form** — Formulario de confirmación con countdown
12. **Footer** — Pie de página
13. **Floating** — FAB buttons (RSVP + música)

#### Dashboard (`/dashboard`)
Panel de administración con sidebar:

- **Overview** — Stats (confirmados, pendientes, rechazados, total personas), countdown, progreso, RSVPs recientes
- **Guests** — Tabla de invitados con búsqueda, filtros, crear/revocar/restaurar/eliminar invitaciones
- **Gallery** — Subir y gestionar fotos del álbum y fotos generales
- **Settings** — Configurar fecha, hora, ubicación, títulos, logo, música, deadline RSVP

## Modelo de Datos

### Event
- `id`, `title`, `event_date`, `location`, `adress`, `adress_url`, `adress_photo_url`
- `couple_logo_url`, `music_url`, `rsvp_deadline`, `max_guests`, `user_id`

### Invitation
- `id`, `event_id`, `token` (UUID para el enlace público)
- `guest_name`, `guest_email`, `guest_phone`, `group`
- `plus_one_allowed` (0/1)
- `status`: `'pending' | 'opened' | 'responded' | 'expired' | 'revoked'`
- `sent_at`, `expires_at`, `opened_count`, `last_opened_at`, `created_at`

### RsvpResponse
- `id`, `invitation_id`, `attending` (`'yes' | 'no' | 'maybe'`)
- `guest_count` (1 o 2 con +1), `dietary_notes`, `message`
- `ip_address`, `responded_at`

## Flujo de Estados de una Invitación

```
pending → opened → responded
                       ↓
                    revoked → pending (restaurar)
                            → responded (restaurar si ya tenía RSVP)
                            → eliminación permanente
```

## Gestión de Estado (Signals)

| Service | Signal | Descripción |
|---------|--------|-------------|
| `EventStateService` | `_events`, `_currentId`, `currentEvent` | Lista de eventos y evento seleccionado |
| `InvitationStateService` | `_invitations`, `pendingCount`, `respondedCount` | Invitaciones del evento |
| `RsvpResponseStateService` | `_responses`, `confirmedCount`, `declinedCount`, `totalGuests` | Respuestas RSVP |
| `AlbumImageStateService` | `_images` | Fotos del álbum |
| `EventImageStateService` | `_images` | Fotos generales |

## Servicios

| Service | Responsabilidad |
|---------|-----------------|
| `AuthService` | Login/logout con Supabase Auth |
| `EventService` | CRUD de eventos |
| `InvitationService` | CRUD de invitaciones + revoke/restore |
| `RsvpResponseService` | CRUD de respuestas RSVP |
| `AlbumImageService` | Upload/gestión de fotos del álbum |
| `EventImageService` | Upload/gestión de fotos generales |
| `SupabaseService` | Cliente Supabase singleton |
| `SupabaseStorageService` | Upload a Supabase Storage |
| `I18nService` | Internacionalización ES/EN |

## Paleta de Colores

| Variable | Valor | Uso |
|----------|-------|-----|
| `--white` | `#fff` | Fondo principal |
| `--ow` | `#F7FAF8` | Fondo alternativo |
| `--mist` | `#E8F0EB` | Bordes suaves |
| `--sage` | `#B8D4BE` | Acentos secundarios |
| `--forest` | `#3A6B4A` | Botones, links, acento primario |
| `--deep` | `#264D35` | Hover states |
| `--ink` | `#1A2E22` | Texto principal |
| `--gold` | `#B89B6A` | Acentos especiales, badge |

## Breakpoints Mobile

| Breakpoint | Uso |
|------------|-----|
| `380px` | Teléfonos muy pequeños |
| `400px` | Teléfonos pequeños (countdown 2x2) |
| `500px` | Upload grid 4 columnas |
| `600px` | Album grid 3 columnas |
| `700px` | Weather widget 2 columnas |
| `768px` | **Breakpoint principal mobile** — sidebar, dashboard, etc. |
| `860px` | Timeline cambia a desktop |
| `900px` | Story grid 2 columnas |
| `1000px` | Weather widget layout expandido |
| `1100px` | Logistics 3 columnas |
| `1200px` | Padding máximo de secciones |

## Internacionalización

Soporte ES/EN con `I18nService`. Toggle en el hero de la invitación pública. Todas las cadenas de texto están en el servicio de i18n.
