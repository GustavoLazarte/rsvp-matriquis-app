# Changelog

## 26 de Julio, 2026

### Corrección — RSVP Count al eliminar invitación
**Problema**: Al eliminar una invitación desde el dashboard, la respuesta RSVP asociada no se eliminaba del signal `_responses`. Esto causaba que `totalGuests`, `confirmedCount`, `declinedCount` quedaran con valores incorrectos.

**Solución**:
- Agregado `removeByInvitationId()` en `RsvpResponseStateService` y `RsvpResponseService`
- `InvitationService.remove()` ahora también elimina la respuesta RSVP de la BD y el state
- Archivos modificados:
  - `src/app/core/services/rsvp-response-state.service.ts`
  - `src/app/services/rsvp-response.service.ts`
  - `src/app/services/invitation.service.ts`

---

### Feature — Soft Delete (status `revoked`)
**Problema**: Eliminar una invitación borraba los datos permanentemente. No había forma de recuperar una invitación eliminada.

**Solución**: Reemplazado hard delete por soft delete con nuevo estado `'revoked'` en `InvitationStatus`.

- Nuevo estado `revoked` agregado al tipo `InvitationStatus`
- Nuevos métodos en `InvitationService`:
  - `revoke(id)` — Cambia status a `revoked`
  - `restore(id)` — Restaura a `responded` si tenía RSVP, `pending` si no
- Botones de restaurar y eliminar permanentemente en la UI de invitados
- Filtro de estado "Revocadas" en el selector de filtros
- Badge visual `Revocado` en la tabla de invitados
- Stats excluyen invitaciones revocadas (total, confirmados, rechazados, pendientes, totalPersonas)
- Invitaciones revocadas muestran "Invitación no disponible" en la página pública de RSVP
- Archivos modificados:
  - `src/app/core/models/invitation.ts`
  - `src/app/services/invitation.service.ts`
  - `src/app/components/dashboard/guests/guests.component.ts`
  - `src/app/components/dashboard/guests/guests.component.html`
  - `src/app/components/dashboard/guests/guests.component.scss`
  - `src/app/pages/dashboard/dashboard.component.ts`
  - `src/app/components/invi/rsvp-form/rsvp-form.component.ts`
  - `src/app/components/invi/rsvp-form/rsvp-form.component.html`

**Nota**: Se requiere ejecutar SQL manual en Supabase para agregar `revoked` al check constraint:
```sql
ALTER TABLE invitations DROP CONSTRAINT invitations_status_check;
ALTER TABLE invitations ADD CONSTRAINT invitations_status_check CHECK (
  (status)::text = ANY (ARRAY[
    'pending'::character varying,
    'opened'::character varying,
    'responded'::character varying,
    'expired'::character varying,
    'revoked'::character varying
  ]::text[])
);
```

---

### Feature — Diseño Mobile Responsive
**Problema**: El dashboard y la invitación pública no estaban optimizados para dispositivos móviles.

**Solución**: Agregados estilos responsivos completos con breakpoints progresivos (768px → 400px → 380px).

**Dashboard**:
- Sidebar colapsable en móvil
- Stats cards en grid responsivo
- Tabla de invitados con scroll horizontal
- Formularios y filtros adaptados
- Botones y badges ajustados para touch (mín. 44px)

**Invitación Pública**:
- Hero, countdown, logistics, weather, dresscode, gifts, footer optimizados
- FAB buttons ajustados para móvil
- Botón de música con zonas táctiles correctas

- Archivos modificados:
  - `src/app/pages/dashboard/dashboard.component.scss`
  - `src/app/components/dashboard/overview/overview.component.scss`
  - `src/app/components/dashboard/guests/guests.component.scss`
  - `src/app/components/dashboard/settings/settings.component.scss`
  - `src/app/components/dashboard/gallery/gallery.component.scss`
  - `src/app/components/dashboard/album-manager/album-manager.component.scss`
  - `src/app/components/dashboard/general-photos/general-photos.component.scss`
  - `src/app/pages/login/login.component.scss`
  - `src/app/pages/event-select/event-select.component.scss`
  - `src/styles.scss`
  - `src/app/components/invi/hero/hero.component.scss`
  - `src/app/components/invi/countdown/countdown.component.scss`
  - `src/app/components/invi/logistics/logistics.component.scss`
  - `src/app/components/invi/weather/weather.component.scss`
  - `src/app/components/invi/dresscode/dresscode.component.scss`
  - `src/app/components/invi/gifts/gifts.component.scss`
  - `src/app/components/invi/footer/footer.component.scss`

---

### Feature — Dropdown de Calendario Rediseñado
**Problema**: El dropdown de calendar (agregar evento al calendario) tenía un diseño básico y difícil de usar en móvil.

**Solución**: Rediseñado con mejor visual, bordes redondeados, sombra, iconos SVG, y targets táctiles de 44px mínimo.

- Archivos modificados:
  - `src/app/components/invi/logistics/logistics.component.html`
  - `src/styles.scss`

---

### Fix — Música: Doble Click = Pausar (no destruir)
**Problema**: El doble click en el botón de música detenía el audio completamente y destruía el elemento `HTMLAudioElement`, perdiendo la posición de reproducción.

**Solución**: Ahora el doble click solo ejecuta `pause()`, manteniendo la posición de reproducción. Al volver a tocar, continúa desde donde quedó. El botón ya no detiene Spotify (solo oculta/muestra el iframe).

- Archivos modificados:
  - `src/app/components/invi/floating/floating.component.ts`

---

### Feature — Documentación
Creada carpeta `docs/` con documentación de la arquitectura de la app (`README.md`) y este changelog (`CHANGELOG.md`).
