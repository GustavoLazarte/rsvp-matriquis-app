# Changelog

## [2026-08-09]

### Seguridad / Backend
- **RLS habilitado (fases 1 y 2, aplicado en prod)**:
  - RPCs con `security definer`: `get_invitation`, `track_open`, `respond_invitation`.
  - RLS activo en `events`, `album_images`, `event_images`, `invitations`, `rsvp_responses`.
  - Políticas anónimas de solo lectura para `events`/`album_images`/`event_images`; admin autenticado con acceso total.
  - `anon` revocado por completo en `invitations` y `rsvp_responses` (datos sensibles protegidos; el invitado accede solo vía token con las RPCs).
- **Fix galería pública (aplicado en prod)**: la política anónima exigía `events.status = 'active'` y el evento estaba en `draft`, así que un invitado anónimo veía el álbum vacío (fallaba solo en mobile, porque en desktop suele haber sesión de dashboard activa). Se quitaron los filtros de status para lectura anónima de `events`, `album_images` y `event_images`. Script: `fix_rls_public_tables.sql`.

### Formulario RSVP (público)
- **Preferencia alimentaria "Otros" como campo inline**: al seleccionar el chip "Otros" aparece un input debajo de los chips para escribir la preferencia; se envía en `dietary_notes` (antes se había intentado con un popup y se descartó).
- **Token inválido**: si `/rsvp/:token` no corresponde a ninguna invitación, se muestra "Invitación no encontrada" y no se carga el contenido del evento (la página ya no se rompe ni renderiza el formulario).
- Se quitó el botón "Volver al inicio" de las pantallas de "no encontrada" (no es necesario para el invitado).
- Nuevas claves i18n ES/EN (`rsvp_food_other_*`, `rsvp_not_found_*`).

### Dashboard
- **Edición de datos de invitación**: nuevo botón lápiz por fila en Invitados que abre un modal para editar `guest_name`, `guest_email`, `guest_phone`, `group` y `plus_one_allowed` (no toca la respuesta RSVP). Guarda vía `InvitationService.update`.

### Contenido
- **Dress code**: se removió "blanco hueso / bone white" del texto descriptivo (ES/EN).

### Archivos relacionados
- `fix_rls.sql`, `fix_rls_phase1.sql`, `fix_rls_phase2.sql`, `fix_rls_public_tables.sql`, `fix_rls_rollback.sql`
