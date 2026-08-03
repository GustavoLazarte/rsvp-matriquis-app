# Changelog

## 3 de Agosto, 2026

### Feature — Meta tags para compartir en redes (Open Graph / Twitter)
**Problema**: Al compartir el link de invitación en WhatsApp/redes no había preview (card) ni información del sitio.

**Solución**: `src/index.html` ahora incluye:
- Open Graph completo (`og:site_name`, `og:title`, `og:description`, `og:image`, `og:url`, `og:locale`)
- Twitter Card (`summary_large_image`)
- Meta tags SEO (`keywords`, `author`, `canonical`, `robots`)
- Meta tags de app móvil (`apple-mobile-web-app-*`, `application-name`, `mobile-web-app-capable`)
- `theme-color`, `format-detection`, `X-UA-Compatible`

> ⚠️ **Pendiente**: el preview de WhatsApp no renderiza SVG. Para que la card se vea, subir la imagen en PNG/JPG y actualizar `og:image`, `og:image:type` y `twitter:image`.

- Archivos modificados: `src/index.html`

---

### Feature — Assets del sitio (favicon, PWA icons, manifest)
**Problema**: El favicon referenciado no existía y no había iconos para PWA/app móvil.

**Solución**: Creada carpeta `src/assets/`:
- `favicon.svg` + `favicon.ico` — monograma J&M con fondo navy `#0f172a`
- `icon.svg`, `icon-192.png`, `icon-512.png` — iconos para PWA
- `apple-touch-icon.png` (180x180) — icono iOS
- `manifest.webmanifest` — PWA manifest con theme color y start_url
- `logo-moniyjose.svg` — logo oficial (subido por el cliente)
- `rsvp-code.jpeg` — QR de transferencia bancaria

- `angular.json`: `assets` ahora incluye `src/assets` y `src/manifest.webmanifest`
- `src/index.html`: referencias a favicon SVG/ICO, apple-touch-icon y manifest

---

### Feature — Rediseño sección Logistics
Componente `app-invi-logistics` rediseñado según mockup del maquetador:
- Fondo `#fafbf9`, título serif 52px, línea dorada
- Tarjetas blancas con iconos en círculo (dorado/verde), bordes redondeados
- **Cuándo**: día de semana + fecha completa, agenda con puntos verdes (usa primeros 3 eventos de `tl_events`), botón "Agregar al Calendario" outline
- **Dónde**: botón sólido "Abrir en Google Maps" + caja del venue con icono
- **Adults Only**: mensaje + deadline con reloj
- Estilos movidos de `styles.scss` a `logistics.component.scss`
- Eliminada la foto del venue (`adress_photo_url`) del diseño

- Archivos: `src/app/components/invi/logistics/*`

---

### Feature — Rediseño sección Gifts + Modal QR
Componente `app-invi-gifts` rediseñado según mockup:
- Fondo blanco, eyebrow + título serif + línea dorada
- Card "Mesa de Regalos" (Casa Ideas) siempre visible, con icono 🎁 y external-link
- Tarjetas "Lluvia de Sobres" y "Transferencia vía QR" con iconos en círculo
- Botón "Ver Código QR" abre **overlay opaco** (modal) con:
  - Título serif con el nombre del evento, QR (`rsvp-code.jpeg` o `gif_qr_url`), datos bancarios y botón cerrar
  - **Precarga** del QR al montar el componente (`new Image()`) + spinner mientras carga
- Nuevo campo `gif_qr_url` en `Event` (pendiente de agregar columna en Supabase)
- Nuevas claves i18n ES/EN: `gifts_qr_btn`, `gifts_qr_hide`, `gifts_qr_modal_label`, `gifts_qr_bank1`, `gifts_qr_bank2`

- Archivos:
  - `src/app/components/invi/gifts/*`
  - `src/app/core/models/event.ts`
  - `src/app/core/services/i18n.service.ts`

---

### Feature — Hero: render inmediato sin esperar Supabase
**Problema**: El hero esperaba el fetch de Supabase para mostrar nombres y logo, causando una vista incompleta/fea.

**Solución**:
- Nombres por defecto **"Moni" / "Jose"** (se reemplazan cuando llega `event.title`)
- Logo local `assets/logo-moniyjose.svg` en vez de `couple_logo_url`

- Archivos:
  - `src/app/components/invi/hero/hero.component.ts`
  - `src/app/components/invi/hero/hero.component.html`

---

## 26 de Julio, 2026

### Fix — Enlaces de invitación sin prefijo www
**Problema**: Los enlaces generados para copiar invitaciones y para exportar CSV estaban tomando el host actual del navegador. Cuando la app se abría con `www`, el link resultante también incluía `www`, lo que rompía la consistencia del dominio personalizado.

**Solución**:
- Se normalizó la base de la URL para quitar el prefijo `www` automáticamente.
- El mismo comportamiento se aplicó a los enlaces incluidos en el CSV exportado.

**Archivos modificados**:
- `src/app/components/dashboard/guests/guests.component.ts`
- `src/app/services/export.service.ts`

---

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

✅ SQL ejecutado en Supabase — constraint `invitations_status_check` actualizado con estado `revoked`.

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

---

### Fix — tsconfig.json: Eliminada opción `downlevelIteration` obsoleta
**Problema**: TypeScript mostraba error de deprecación para `downlevelIteration` ya que el `target` es `ES2022` y no se necesita.

**Solución**: Eliminado `downlevelIteration` del `tsconfig.json`.

---

### Feature — Ruta pública cambiada de `/invi` a `/rsvp`
**Problema**: La ruta de la invitación pública era `/invi/:inviId`, poco clara para los invitados.

**Solución**: Ruta renombrada a `/rsvp/:token` en todo el proyecto.

- `app-routing.module.ts`: Ruta cambiada
- `pages/invi/invi.component.ts`: Param renombrado de `inviId` a `token`
- `pages/invi/invi.component.html`: Binding actualizado
- `components/dashboard/guests/guests.component.ts`: Links generados con `/rsvp/`
- `services/export.service.ts`: Links en CSV con `/rsvp/`
- `components/dashboard/overview/overview.component.html`: RouterLink actualizado
- `pages/login/login.component.html`: RouterLink actualizado

---

### Feature — Token corto (8 caracteres)
**Problema**: Los tokens de invitación eran UUIDs de 36 caracteres, poco prácticos para compartir.

**Solución**: Tokens generados con 8 caracteres alfanuméricos (sin I, l, O, 0, 1 para evitar confusión visual). ~218 billones de combinaciones posibles.

- `components/dashboard/guests/guests.component.ts`: Método `generateToken()` que reemplaza `crypto.randomUUID()`

---

### Feature — Filtro "Todas" incluye invitaciones revocadas
**Problema**: Al revocar una invitación, desaparecía del filtro "Todas" en la tabla de invitados.

**Solución**: El filtro "Todas" ahora muestra todas las invitaciones incluyendo las revocadas. El badge `Revocado` indica visualmente cuáles lo están.

- `components/dashboard/guests/guests.component.ts`: Eliminada exclusión de revoked del filtro `all`

---

### Feature — Exportar a Excel (.xlsx) profesional
**Problema**: El export CSV se veía feo y desformateado en Excel.

**Solución**: Generación de archivos `.xlsx` nativos de Excel usando la librería SheetJS (`xlsx`). Incluye:

- **Hoja "Reporte"** con sección de resumen y tabla detallada
- **Colores corporativos**: Headers verdes (#3A6B4A), filas alternadas (#F7FAF8 / #FFFFFF)
- **Estados RSVP con colores**: Verde (Asistirá), Rojo (No asistirá), Dorado (Tal vez)
- **Columnas auto-resizeadas** con anchos optimizados
- **Freeze panes** en headers para scroll
- **Datos del evento** en encabezado (fecha, lugar, fecha de generación)

- `services/export.service.ts`: Reescrito completamente
- `package.json`: Agregada dependencia `xlsx@^0.18.5`

---

### Feature — Dashboard Overview: Stats "Enviadas" y "Revocadas"
**Problema**: El overview no mostraba cuántas invitaciones se habían creado ni cuántas se habían revocado.

**Solución**: Agregadas dos tarjetas de stats en el panel de overview:

- **Enviadas**: Total de invitaciones creadas (incluyendo revocadas)
- **Revocadas**: Invitaciones con status `revoked`

- `pages/dashboard/dashboard.component.ts`: Agregado `sent` al getter `stats`
- `components/dashboard/overview/overview.component.ts`: Interface `Stats` actualizada
- `components/dashboard/overview/overview.component.html`: Dos nuevas tarjetas de stats

---

### Fix — Botón flotante "Confirmar Asistencia": ocultar al responder y al estar en la sección
**Problema**: El botón FAB de "Confirmar Asistencia" se mostraba incluso después de haber respondido al RSVP, y permanecía visible cuando el usuario ya estaba en la sección RSVP.

**Solución**:
- **Al responder**: `RsvpFormComponent` emite `@Output() rsvpConfirmed` al cargar RSVP existente o al enviar uno nuevo
- **Al estar en la sección**: `FloatingComponent` verifica periódicamente si `.rsvp-ok` aparece en el DOM y si la sección `#rsvp` es visible en el viewport
- Triple mecanismo: `@Input() rsvpSubmitted`, polling DOM cada 500ms con `cdr.detectChanges()`, y verificación de visibilidad del elemento

- `components/invi/rsvp-form/rsvp-form.component.ts`: Agregado `@Output() rsvpConfirmed`
- `pages/invi/invi.component.ts`: Track `rsvpSubmitted`
- `pages/invi/invi.component.html`: Binding `(rsvpConfirmed)` y `[rsvpSubmitted]`
- `components/invi/floating/floating.component.ts`: Getter `hideRsvpButton` con triple verificación

---

### Fix — Música: Tooltip, pausa y auto-dismiss
**Problema**: No había indicación visual de que doble click pausaba la música, y el mensaje de "Toca para activar" permanecía visible indefinidamente.

**Solución**:
- **Tooltip hover**: Aparece arriba del botón con "Doble clic para pausar la música" (fade-in con CSS)
- **Doble click = pausa**: `pause()` ejecuta solo `audio.pause()`, sin resetear posición ni destruir el audio. Loop infinito mantenido (`audio.loop = true`)
- **Auto-dismiss**: El mensaje "Toca para activar" se oculta automáticamente después de 3 segundos

- `components/invi/floating/floating.component.html`: Agregado `title` attribute para tooltip
- `components/invi/floating/floating.component.ts`: `stop()` renombrado a `pause()`, `setTimeout` para auto-dismiss
- `components/invi/floating/floating.component.scss`: Tooltip con `::after` y fade-in

---

### Fix — Calendario: stopPropagation en dropdown
**Problema**: En móvil, al tocar las opciones del dropdown de calendario, el evento se propagaba al botón padre y cerraba el dropdown antes de navegar.

**Solución**: Agregado `$event.stopPropagation()` en los links del dropdown.

- `components/invi/logistics/logistics.component.html`

---

### Fix — tsconfig.json: outDir obsoleto
**Problema**: `outDir` en `tsconfig.json` no tiene efecto real ya que Angular CLI maneja su propio output.

**Solución**: Eliminado `outDir` del `tsconfig.json`.
