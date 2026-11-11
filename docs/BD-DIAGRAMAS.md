# Diseño de BD y Componentes - RSVP SaaS

## Diagrama ER
```mermaid
erDiagram
    ORGANIZATIONS ||--o{ MEMBERSHIPS : "tiene"
    ORGANIZATIONS ||--o{ EVENTS : "propietaria"
    USERS_PROFILES ||--o{ MEMBERSHIPS : "pertenece"
    EVENTS ||--o{ INVITATIONS : "contiene"
    EVENTS ||--o{ RSVP_RESPONSES : "recibe"
    EVENTS ||--|| EVENT_THEMES : "personaliza"
    EVENTS ||--o{ EVENT_DOMAINS : "usa"
    EVENTS ||--o{ ALBUM_IMAGES : "muestra"
    EVENTS ||--o{ EVENT_IMAGES : "muestra"
    TEMPLATES ||--o{ EVENTS : "aplica"

    ORGANIZATIONS {
        UUID id PK
        TEXT name "Nombre de la organización"
        TEXT slug UK "Identificador único"
        TEXT logo_url "Logo"
        TEXT primary_color "Color principal"
        TEXT status "active | suspended"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    USERS_PROFILES {
        UUID id PK "FK auth.users"
        TEXT full_name "Nombre completo"
        TEXT phone "Teléfono"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    MEMBERSHIPS {
        UUID id PK
        UUID organization_id FK
        UUID user_id FK
        TEXT role "platform_admin | org_admin | event_admin | viewer"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    TEMPLATES {
        UUID id PK
        TEXT name "Nombre de plantilla"
        TEXT slug UK
        TEXT description "Descripción"
        TEXT preview_image_url "Vista previa"
        JSONB config "Configuración (secciones, fuentes)"
        BOOLEAN is_active "Activa"
        TIMESTAMPTZ created_at
    }

    EVENTS {
        UUID id PK
        UUID organization_id FK
        UUID template_id FK
        UUID admin_id "Responsable"
        TEXT title "Título del evento"
        TEXT slug "URL amigable"
        TEXT description "Descripción"
        TIMESTAMPTZ event_date "Fecha y hora"
        TEXT location "Lugar"
        TEXT adress "Dirección"
        TEXT adress_url "Link a mapa"
        INTEGER max_guests "Máximo de invitados"
        TEXT status "draft | active | closed | cancelled"
        TEXT primary_color "Color"
        TIMESTAMPTZ rsvp_deadline "Fecha límite RSVP"
        TEXT couple_logo_url
        TEXT adress_photo_url
        TEXT gif_table_url
        TEXT gif_qr_url
        TEXT music_url
        TEXT custom_domain "Dominio personalizado"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    EVENT_THEMES {
        UUID id PK
        UUID event_id FK UK
        TEXT primary_color
        TEXT secondary_color
        TEXT background_color
        TEXT text_color
        TEXT accent_color
        TEXT logo_url
        TEXT hero_image_url
        JSONB fonts "Fuentes personalizadas"
        JSONB sections "Secciones visibles"
        TEXT custom_css "CSS personalizado"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    EVENT_DOMAINS {
        UUID id PK
        UUID event_id FK
        TEXT domain UK
        BOOLEAN verified "Verificado"
        TEXT verification_token
        JSONB dns_config
        TIMESTAMPTZ created_at
        TIMESTAMPTZ verified_at
    }

    INVITATIONS {
        UUID id PK
        UUID event_id FK
        TEXT token UK "Token único"
        TEXT guest_name "Nombre del invitado"
        TEXT guest_email "Correo"
        TEXT guest_phone "Teléfono"
        TEXT group "Grupo"
        INTEGER plus_one_allowed "Pases extra"
        TEXT status "pending | opened | responded | expired | revoked"
        TIMESTAMPTZ sent_at
        TIMESTAMPTZ expires_at
        INTEGER opened_count "Veces abierto"
        TIMESTAMPTZ last_opened_at
        TIMESTAMPTZ created_at
    }

    RSVP_RESPONSES {
        UUID id PK
        UUID event_id FK
        UUID invitation_id FK
        TEXT guest_name
        INTEGER attendance "1=Sí 0=No"
        TEXT meal_preference
        TEXT dietary_notes
        INTEGER plus_ones "Acompañantes"
        TEXT message "Mensaje"
        TIMESTAMPTZ responded_at
    }

    ALBUM_IMAGES {
        UUID id PK
        UUID event_id FK
        TEXT image_url
        TEXT caption
        INTEGER display_order
        TIMESTAMPTZ created_at
    }

    EVENT_IMAGES {
        UUID id PK
        UUID event_id FK
        TEXT image_url
        TEXT type
        INTEGER display_order
        TIMESTAMPTZ created_at
    }
```
