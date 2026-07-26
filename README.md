# RSVP App - Contexto del Proyecto

## 📋 Descripción General
Aplicación Angular para gestionar invitaciones de eventos (bodas, cumpleaños, etc.) con sistema de RSVP, galería de imágenes, y dashboard de administración.

## 🏗️ Estructura del Proyecto

```
src/
├── index.html                    # Punto de entrada HTML
├── main.ts                       # Bootstrap de la app
├── styles.scss                   # Estilos globales
├── app/
│   ├── app-routing.module.ts    # Rutas principales
│   ├── app.component.ts         # Componente raíz
│   ├── app.module.ts            # Módulo principal
│   ├── auth/
│   │   └── guards/
│   │       └── auth.guard.ts    # Guard de autenticación
│   ├── components/              # Componentes reutilizables
│   │   ├── shared.module.ts     # Módulo compartido
│   │   ├── dashboard/           # Componentes del dashboard
│   │   │   ├── gallery/         # Galería de imágenes
│   │   │   ├── guests/          # Lista de invitados
│   │   │   ├── overview/        # Resumen general
│   │   │   ├── settings/        # Configuración
│   │   │   ├── sidebar/         # Menú lateral
│   │   │   └── topbar/          # Barra superior
│   │   ├── header/              # Encabezado
│   │   └── invi/                # Componentes de invitación
│   │       ├── album/           # Álbum de fotos
│   │       ├── dresscode/       # Código de vestimenta
│   │       ├── footer/          # Pie de página
│   │       ├── gifts/           # Lista de regalos
│   │       ├── hero/            # Sección héroe
│   │       ├── logistics/       # Logística del evento
│   │       ├── rsvp-form/       # Formulario RSVP
│   │       ├── story/           # Historia del evento
│   │       ├── ticker/          # Contador regresivo
│   │       ├── timeline/        # Línea de tiempo
│   │       ├── upload/          # Carga de fotos
│   │       └── weather/         # Clima
│   ├── core/                    # Servicios y modelos core
│   │   ├── models/
│   │   │   ├── event.ts         # Modelo de evento
│   │   │   ├── event-image.ts   # Modelo de imagen
│   │   │   ├── invitation.ts    # Modelo de invitación
│   │   │   ├── rsvp-response.ts # Modelo de respuesta RSVP
│   │   │   └── index.ts         # Barrel file
│   │   └── services/
│   │       ├── event-state.service.ts           # State de evento
│   │       ├── event-image-state.service.ts     # State de imágenes
│   │       ├── invitation-state.service.ts      # State de invitaciones
│   │       ├── rsvp-response-state.service.ts   # State de respuestas RSVP
│   │       ├── user-state.service.ts            # State de usuario
│   │       ├── supabase.service.ts              # Conexión Supabase
│   │       ├── supabase-storage.service.ts      # Storage Supabase
│   │       └── i18n.service.ts                  # Internacionalización
│   ├── pages/                   # Páginas/containers
│   │   ├── dashboard/           # Dashboard admin
│   │   ├── invi/                # Página de invitación
│   │   └── login/               # Página de login
│   └── services/                # Servicios HTTP
│       ├── auth.service.ts      # Autenticación
│       ├── event.service.ts     # Eventos API
│       ├── event-image.service.ts   # Imágenes API
│       ├── invitation.service.ts    # Invitaciones API
│       └── rsvp-response.service.ts # Respuestas RSVP API
├── environments/
│   ├── environment.ts           # Config desarrollo
│   └── environment.prod.ts      # Config producción
├── angular.json                 # Config Angular
├── tsconfig.json                # Config TypeScript
├── tsconfig.app.json            # Config TS para app
└── package.json                 # Dependencias
```

## 🔑 Reglas de Arquitectura

### 1. **Organización por Capas**
- **Components**: UI puro, lógica de presentación
- **Services**: Lógica de negocio, HTTP, estado
- **Models**: Tipos y interfaces TypeScript
- **Guards**: Protección de rutas

### 2. **Naming Convention**
```
- Componentes: *.component.ts
- Servicios: *.service.ts
- Modelos: *.ts (plural o singular según contexto)
- Guards: *.guard.ts
- Módulos: *.module.ts
- Routing: *-routing.module.ts
```

### 3. **Estructura de Módulos**
- `app.module.ts`: Módulo raíz
- `dashboard.module.ts`: Módulo dashboard
- `invi.module.ts`: Módulo invitación
- `login.module.ts`: Módulo login
- `shared.module.ts`: Módulo compartido de componentes

### 4. **State Management**
- Servicios terminados en `-state.service.ts` manejan estado global
- Usar `RxJS BehaviorSubject` para observable state
- Ejemplo: `event-state.service.ts` → maneja estado de eventos

### 5. **Servicios HTTP**
- Servicios terminados en `.service.ts` en `services/`
- Interactúan con APIs (Supabase, etc.)
- No deben manejar UI

## 🚀 Levantar el Proyecto

### Requisitos
- Node.js 16+
- npm o yarn
- Acceso a Supabase (credenciales en `.env`)

### Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con credenciales Supabase
```

### Desarrollo
```bash
# Levantar servidor de desarrollo
npm start
# o
ng serve

# Acceder en http://localhost:4200
```

### Build
```bash
# Build para producción
npm run build
# o
ng build --configuration production

# Archivos generados en dist/
```

### Testing
```bash
# Ejecutar tests unitarios
npm test

# Ejecutar e2e tests
npm run e2e
```

## 🌐 Deploy y dominio personalizado
- La app está preparada para desplegarse en Vercel con un dominio personalizado.
- Los enlaces de invitación se generan usando el host principal del dominio, sin agregar `www` automáticamente.
- Esto evita inconsistencias cuando el sitio se accede desde `www.tudominio.com` o desde el dominio raíz.

## 📱 Flujo de la Aplicación

1. **Login** (`login/`) - Autenticación de usuario
2. **Dashboard** (`dashboard/`) - Admin panel
   - Overview: Resumen del evento
   - Guests: Lista de invitados
   - Gallery: Galería de fotos
   - Settings: Configuración
3. **Invitación** (`invi/`) - Página pública
   - Hero: Presentación del evento
   - Story: Historia de la pareja
   - Album: Fotos
   - RSVP Form: Formulario de confirmación
   - Logistics: Info del evento
   - Weather: Clima
   - Gifts: Lista de regalos
   - Timeline: Línea de tiempo
   - Dresscode: Código de vestimenta

## 🔐 Autenticación

- **Guard**: `auth.guard.ts` protege rutas
- **Service**: `auth.service.ts` maneja login/logout
- **Provider**: Supabase Auth
- **Token**: Almacenado en localStorage

## 💾 Base de Datos (Supabase)

### Tablas principales
- `events`: Información del evento
- `guests`: Invitados
- `rsvp_responses`: Respuestas RSVP
- `invitations`: Invitaciones
- `event_images`: Imágenes del evento

### Storage
- `event-photos/`: Fotos del evento
- `guest-uploads/`: Fotos subidas por invitados

## 📦 Dependencias Principales

```json
{
  "@angular/core": "^15.0.0",
  "@angular/router": "^15.0.0",
  "@supabase/supabase-js": "^2.0.0",
  "rxjs": "^7.0.0",
  "scss": "Estilos"
}
```

## 🎨 Estilos

- **Preprocessor**: SCSS
- **Archivo global**: `src/styles.scss`
- **Componentes**: Estilos encapsulados en `.component.scss`
- **Variables**: Definidas en `styles.scss`

## 🌍 Internacionalización

- **Service**: `i18n.service.ts`
- **Idiomas soportados**: Es, En, etc.
- **Cambiar idioma**: A través del servicio i18n

## ✅ Buenas Prácticas

1. **Componentes**: Presentación solo, lógica en servicios
2. **Servicios**: Una responsabilidad por servicio
3. **Modelos**: Tipos TypeScript siempre
4. **RxJS**: Unsubscribe en ngOnDestroy
5. **Templates**: Usar async pipe para observables
6. **Naming**: Claro y descriptivo
7. **Comments**: Docstring para métodos públicos
8. **Testing**: Al menos componentes principales

## 🔗 Recursos

- [Documentación Angular](https://angular.io/)
- [Supabase Docs](https://supabase.com/docs)
- [RxJS Guide](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📝 Notas de Desarrollo

- Token Supabase corto: `encode(gen_random_bytes(12), 'hex'::text)` = 24 caracteres
- Usar guards para proteger rutas autenticadas
- State services para compartir data entre componentes
- localStorage para sesión persistente

---

**Último actualizado**: Mayo 2026
