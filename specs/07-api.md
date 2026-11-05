# Spec 07 — API REST

**Estado:** Borrador  
**Versión:** `/api/v1`  
**Autenticación:** cookie de sesión (web) o Bearer (clientes autorizados)

---

## 1. Convenciones generales

- Base: `https://api.legaria.es/api/v1`
- JSON en `UTF-8`.
- Fechas ISO 8601 en UTC.
- Identificadores UUID.
- Recursos en plural y `kebab-case`.
- Sin verbos en las rutas salvo acciones de estado explícitas (`/publish`, `/close`).
- Tenant siempre en la ruta: `/organizations/:organizationId/...`.
- Recursos familiares: `/family-groups/:familyGroupId/...`.
- Recursos públicos: `/public/...`.

---

## 2. Cabeceras

| Cabecera | Uso |
|---|---|
| `Content-Type: application/json` | Peticiones JSON. |
| `Accept: application/json` | Respuestas JSON. |
| `Cookie` | Sesión web. |
| `Authorization: Bearer <token>` | Clientes autorizados; no usado por la SPA. |
| `X-CSRF-Token` | Obligatorio en métodos mutables con cookie. |
| `Idempotency-Key` | Creación de recursos sensibles. |
| `X-Request-Id` | Opcional; se devuelve siempre. |
| `Accept-Language` | Idioma de mensajes. |

---

## 3. Respuestas

### Recurso individual

```json
{
  "id": "uuid",
  "reference": "FUN-2026-0001",
  "status": "ACTIVE",
  "createdAt": "2026-11-05T10:00:00.000Z"
}
```

### Lista

```json
{
  "data": [],
  "pageInfo": {
    "nextCursor": "opaque",
    "hasNextPage": false
  }
}
```

### Acción sin contenido

- `204 No Content`.

### Creación

- `201 Created` + `Location`.

---

## 4. Errores

Formato RFC 9457:

```json
{
  "type": "https://api.legaria.es/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "code": "FORBIDDEN",
  "detail": "No tienes permiso para realizar esta acción.",
  "instance": "/api/v1/organizations/uuid/cases",
  "requestId": "req_01J..."
}
```

Validación:

```json
{
  "type": "https://api.legaria.es/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "detail": "Hay campos inválidos.",
  "instance": "/api/v1/organizations/uuid/cases",
  "requestId": "req_01J...",
  "errors": [
    { "path": "body.reference", "message": "La referencia es obligatoria." }
  ]
}
```

Reglas:

- No exponer stack traces.
- No revelar la existencia de recursos privados.
- Usar 404 en lugar de 403 cuando revelar el recurso sea un riesgo.
- Incluir `requestId`.

---

## 5. Códigos de estado

| Código | Uso |
|---|---|
| 200 | Lectura o actualización correcta. |
| 201 | Recurso creado. |
| 202 | Acción aceptada para proceso asíncrono. |
| 204 | Acción sin cuerpo. |
| 400 | Petición malformada. |
| 401 | No autenticado. |
| 403 | Sin permiso o reautenticación requerida. |
| 404 | No encontrado o no visible. |
| 409 | Conflicto de estado o duplicado. |
| 410 | Recurso caducado (invitación). |
| 413 | Archivo demasiado grande. |
| 415 | Tipo de contenido no soportado. |
| 422 | Validación fallida. |
| 429 | Límite de peticiones. |
| 500 | Error interno. |
| 503 | Servicio no disponible. |

---

## 6. Paginación

Cursor opaco:

```http
GET /api/v1/organizations/:organizationId/cases?limit=20&cursor=...
```

- `limit`: 1–100, por defecto 20.
- `cursor`: opaco, generado por servidor.
- Respuesta con `pageInfo.nextCursor`.
- Orden estable obligatorio.
- No se permite offset en listados grandes.

---

## 7. Filtros y ordenación

```http
GET /cases?status=ACTIVE&search=garcia&sort=-openedAt&openedFrom=2026-01-01
```

- Lista blanca por endpoint.
- `-` para descendente.
- Búsqueda con límite de longitud.
- Filtros inválidos → 422.

---

## 8. Idempotencia

Obligatoria en:

- Creación de invitaciones.
- Canje de invitaciones.
- Envío de condolencias.
- Generaciones de IA.
- Publicación de memoriales.
- Creación de expedientes (opcional).

Comportamiento:

- `Idempotency-Key` único por usuario y endpoint.
- Misma clave + mismo cuerpo → misma respuesta.
- Misma clave + cuerpo distinto → 409.
- Retención de 24 horas.

---

## 9. Rate limits

| Ámbito | Límite propuesto |
|---|---|
| Login | 5/minuto/IP + 20/hora/email. |
| Refresh | 30/minuto/sesión. |
| Invitaciones (crear) | 20/hora/organización. |
| Invitaciones (validar) | 10/minuto/IP. |
| Invitaciones (canjear) | 5/hora/IP. |
| Condolencias | 5/hora/IP/memorial. |
| IA | Según plan y usuario. |
| API general | 120/minuto/usuario. |
| Público | 60/minuto/IP. |

Respuesta `429` con `Retry-After`.

---

## 10. Catálogo de endpoints

### 10.1. Autenticación y sesión

| Método | Ruta | Auth | Permiso |
|---|---|---|---|
| POST | `/auth/login` | No | — |
| POST | `/auth/refresh` | Cookie | — |
| POST | `/auth/logout` | Sí | — |
| POST | `/auth/logout-all` | Sí | — |
| POST | `/auth/forgot-password` | No | — |
| POST | `/auth/reset-password` | No | — |
| POST | `/auth/mfa/enroll` | Sí | — |
| POST | `/auth/mfa/verify` | Sí | — |
| POST | `/auth/step-up` | Sí | — |

### 10.2. Usuario actual

| Método | Ruta | Auth | Permiso |
|---|---|---|---|
| GET | `/me` | Sí | — |
| PATCH | `/me` | Sí | — |
| GET | `/me/organizations` | Sí | — |
| GET | `/me/family-groups` | Sí | — |

### 10.3. Invitaciones públicas

| Método | Ruta | Auth | Permiso |
|---|---|---|---|
| POST | `/invitations/validate` | No | — |
| POST | `/invitations/redeem` | No | — |

### 10.4. Organizaciones

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/organizations` | `admin:manage_organizations` |
| GET | `/organizations` | `admin:manage_organizations` |
| GET | `/organizations/:organizationId` | `organization:read` |
| PATCH | `/organizations/:organizationId` | `organization:update` |
| PATCH | `/organizations/:organizationId/status` | `admin:manage_organizations` |
| GET | `/organizations/:organizationId/metrics` | `organization:read` |
| GET | `/organizations/:organizationId/audit-logs` | `organization:read_audit` |

### 10.5. Miembros de organización

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/organizations/:organizationId/members` | `organization:manage_members` |
| POST | `/organizations/:organizationId/members/invitations` | `organization:manage_members` |
| POST | `/organizations/:organizationId/members/invitations/:invitationId/resend` | `organization:manage_members` |
| DELETE | `/organizations/:organizationId/members/invitations/:invitationId` | `organization:manage_members` |
| PATCH | `/organizations/:organizationId/members/:memberId` | `organization:manage_members` |
| DELETE | `/organizations/:organizationId/members/:memberId` | `organization:manage_members` |

### 10.6. Soporte

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/organizations/:organizationId/support-access` | `admin:manage_organizations` |
| DELETE | `/organizations/:organizationId/support-access/:grantId` | `admin:manage_organizations` |

### 10.7. Expedientes

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/organizations/:organizationId/cases` | `case:read` |
| POST | `/organizations/:organizationId/cases` | `case:create` |
| GET | `/organizations/:organizationId/cases/:caseId` | `case:read` |
| PATCH | `/organizations/:organizationId/cases/:caseId` | `case:update` |
| POST | `/organizations/:organizationId/cases/:caseId/close` | `case:close` |
| POST | `/organizations/:organizationId/cases/:caseId/reopen` | `case:close` |
| POST | `/organizations/:organizationId/cases/:caseId/archive` | `case:archive` |
| GET | `/organizations/:organizationId/cases/:caseId/activity` | `case:read` |

### 10.8. Persona fallecida

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/organizations/:organizationId/cases/:caseId/deceased` | `deceased:read` |
| PUT | `/organizations/:organizationId/cases/:caseId/deceased` | `deceased:update` |
| PATCH | `/organizations/:organizationId/cases/:caseId/deceased` | `deceased:update` |

### 10.9. Servicios, salas y ceremonias

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/organizations/:organizationId/cases/:caseId/services` | `service:read` |
| POST | `/organizations/:organizationId/cases/:caseId/services` | `service:manage` |
| PATCH | `/organizations/:organizationId/cases/:caseId/services/:serviceId` | `service:manage` |
| DELETE | `/organizations/:organizationId/cases/:caseId/services/:serviceId` | `service:manage` |
| GET | `/organizations/:organizationId/rooms` | `service:read` |
| POST | `/organizations/:organizationId/rooms` | `service:manage` |
| PATCH | `/organizations/:organizationId/rooms/:roomId` | `service:manage` |
| POST | `/organizations/:organizationId/cases/:caseId/services/:serviceId/ceremonies` | `service:manage` |
| PATCH | `/organizations/:organizationId/cases/:caseId/services/:serviceId/ceremonies/:ceremonyId` | `service:manage` |

### 10.10. Asignaciones

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/organizations/:organizationId/cases/:caseId/assignments` | `assignment:manage` |
| POST | `/organizations/:organizationId/cases/:caseId/assignments` | `assignment:manage` |
| DELETE | `/organizations/:organizationId/cases/:caseId/assignments/:assignmentId` | `assignment:manage` |

### 10.11. Documentos

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/organizations/:organizationId/cases/:caseId/documents` | `document:read` |
| POST | `/organizations/:organizationId/cases/:caseId/documents/upload-url` | `document:upload` |
| POST | `/organizations/:organizationId/cases/:caseId/documents/:documentId/complete` | `document:upload` |
| GET | `/organizations/:organizationId/cases/:caseId/documents/:documentId/download-url` | `document:read` |
| DELETE | `/organizations/:organizationId/cases/:caseId/documents/:documentId` | `document:delete` |

### 10.12. Familias

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/organizations/:organizationId/cases/:caseId/family-group` | `family:read` |
| POST | `/organizations/:organizationId/cases/:caseId/family-group` | `family:manage` |
| GET | `/family-groups/:familyGroupId` | `family:read` |
| GET | `/family-groups/:familyGroupId/case` | `family:read` |
| GET | `/family-groups/:familyGroupId/members` | `family:read` |
| PATCH | `/family-groups/:familyGroupId/members/:memberId` | `family:manage` |
| DELETE | `/family-groups/:familyGroupId/members/:memberId` | `family:manage` |
| POST | `/family-groups/:familyGroupId/leave` | — |
| POST | `/family-groups/:familyGroupId/transfer-admin` | `family:manage` |

### 10.13. Invitaciones familiares

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/organizations/:organizationId/cases/:caseId/family-group/invitations` | `invitation:create` |
| GET | `/organizations/:organizationId/family-groups/:familyGroupId/invitations` | `invitation:create` |
| POST | `/family-groups/:familyGroupId/invitations` | `invitation:create` |
| POST | `/organizations/:organizationId/invitations/:invitationId/resend` | `invitation:create` |
| DELETE | `/organizations/:organizationId/invitations/:invitationId` | `invitation:revoke` |
| DELETE | `/family-groups/:familyGroupId/invitations/:invitationId` | `invitation:revoke` |

### 10.14. Documentos y solicitudes familiares

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/family-groups/:familyGroupId/documents` | `document:read` |
| GET | `/family-groups/:familyGroupId/documents/:documentId/download-url` | `document:read` |
| POST | `/family-groups/:familyGroupId/requests` | `family:read` |
| GET | `/family-groups/:familyGroupId/requests` | `family:read` |

### 10.15. Memoriales

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/organizations/:organizationId/cases/:caseId/memorial` | `memorial:read` |
| POST | `/organizations/:organizationId/cases/:caseId/memorial` | `memorial:create` |
| GET | `/memorials/:memorialId` | `memorial:read` |
| PATCH | `/memorials/:memorialId` | `memorial:update` |
| POST | `/memorials/:memorialId/submit` | `memorial:submit` |
| POST | `/memorials/:memorialId/approve` | `memorial:review` |
| POST | `/memorials/:memorialId/reject` | `memorial:review` |
| POST | `/memorials/:memorialId/publish` | `memorial:publish` |
| POST | `/memorials/:memorialId/unpublish` | `memorial:publish` |
| POST | `/memorials/:memorialId/archive` | `memorial:publish` |

### 10.16. Autorizaciones y accesos

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/memorials/:memorialId/authorizations` | `memorial:update` |
| DELETE | `/memorials/:memorialId/authorizations/:authorizationId` | `memorial:update` |
| GET | `/memorials/:memorialId/access-grants` | `memorial:update` |
| POST | `/memorials/:memorialId/access-grants` | `memorial:update` |
| DELETE | `/memorials/:memorialId/access-grants/:grantId` | `memorial:update` |

### 10.17. Medios, recuerdos y cronología

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/memorials/:memorialId/media/upload-url` | `memorial:update` |
| POST | `/memorials/:memorialId/media/:mediaId/complete` | `memorial:update` |
| PATCH | `/memorials/:memorialId/media/:mediaId` | `memorial:update` |
| DELETE | `/memorials/:memorialId/media/:mediaId` | `memorial:update` |
| POST | `/memorials/:memorialId/memories` | `memory:create` |
| PATCH | `/memorials/:memorialId/memories/:memoryId` | `memory:create` |
| DELETE | `/memorials/:memorialId/memories/:memoryId` | `memory:create` |
| POST | `/memorials/:memorialId/timeline` | `memorial:update` |
| PATCH | `/memorials/:memorialId/timeline/:eventId` | `memorial:update` |
| DELETE | `/memorials/:memorialId/timeline/:eventId` | `memorial:update` |

### 10.18. Condolencias

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/memorials/:memorialId/condolences` | `condolence:read` |
| PATCH | `/memorials/:memorialId/condolences/:condolenceId` | `condolence:moderate` |
| GET | `/public/memorials/:slug` | Público |
| POST | `/public/memorials/:slug/condolences` | Público |
| POST | `/public/memorials/:slug/report` | Público |

### 10.19. IA

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/organizations/:organizationId/ai/biography` | `ai:generate` |
| POST | `/organizations/:organizationId/ai/tribute` | `ai:generate` |
| POST | `/organizations/:organizationId/ai/timeline` | `ai:generate` |
| GET | `/organizations/:organizationId/ai/generations` | `ai:generate` |
| GET | `/ai/generations/:generationId` | `ai:generate` |
| POST | `/ai/generations/:generationId/approve` | `ai:review` |
| POST | `/ai/generations/:generationId/reject` | `ai:review` |
| DELETE | `/ai/generations/:generationId` | `ai:review` |

### 10.20. Administración

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/admin/organizations` | `admin:manage_organizations` |
| GET | `/admin/users` | `admin:manage_users` |
| PATCH | `/admin/users/:userId/status` | `admin:manage_users` |
| PATCH | `/admin/users/:userId/platform-role` | `admin:manage_users` |
| GET | `/admin/settings` | `admin:access` |
| PATCH | `/admin/settings` | `admin:access` |
| GET | `/admin/audit-logs` | `admin:read_audit` |
| GET | `/admin/metrics` | `admin:read_metrics` |

### 10.21. Salud

| Método | Ruta | Auth |
|---|---|---|
| GET | `/health` | No |
| GET | `/ready` | No |

---

## 11. Ejemplos

### 11.1. Crear expediente

```http
POST /api/v1/organizations/7b.../cases
Content-Type: application/json
X-CSRF-Token: ...

{
  "notes": "Servicio previsto para el viernes."
}
```

```json
{
  "id": "3f...",
  "reference": "FUN-2026-0001",
  "status": "DRAFT",
  "openedAt": "2026-11-05T10:00:00.000Z",
  "createdAt": "2026-11-05T10:00:00.000Z"
}
```

### 11.2. Listar expedientes

```http
GET /api/v1/organizations/7b.../cases?status=ACTIVE&limit=20&sort=-openedAt
```

```json
{
  "data": [
    {
      "id": "3f...",
      "reference": "FUN-2026-0001",
      "status": "ACTIVE",
      "deceased": {
        "firstNames": "María",
        "lastNames": "López Ruiz"
      },
      "openedAt": "2026-11-05T10:00:00.000Z"
    }
  ],
  "pageInfo": {
    "nextCursor": null,
    "hasNextPage": false
  }
}
```

### 11.3. Crear invitación familiar

```http
POST /api/v1/organizations/7b.../cases/3f.../family-group/invitations
Content-Type: application/json
Idempotency-Key: 01J...

{
  "email": "familiar@example.com",
  "role": "FAMILY_MEMBER",
  "relationship": "Sobrina"
}
```

```json
{
  "id": "9a...",
  "email": "familiar@example.com",
  "role": "FAMILY_MEMBER",
  "status": "PENDING",
  "expiresAt": "2026-11-12T10:00:00.000Z",
  "createdAt": "2026-11-05T10:00:00.000Z"
}
```

### 11.4. Publicar memorial

```http
POST /api/v1/memorials/5c.../publish
Content-Type: application/json
X-CSRF-Token: ...

{
  "reviewNotes": "Contenido revisado y autorización verificada."
}
```

```json
{
  "id": "5c...",
  "status": "PUBLISHED",
  "visibility": "PUBLIC",
  "publishedAt": "2026-11-05T10:00:00.000Z",
  "publicUrl": "https://legaria.es/memorial/a1b2c3d4e5f6"
}
```

### 11.5. Memorial público

```http
GET /api/v1/public/memorials/a1b2c3d4e5f6
```

```json
{
  "slug": "a1b2c3d4e5f6",
  "firstNames": "María",
  "lastNames": "López Ruiz",
  "birthDate": "1948-03-12",
  "deathDate": "2026-10-28",
  "biography": "María nació en Segovia...",
  "cover": {
    "url": "https://cdn.legaria.es/...",
    "alt": "María sonriendo en el jardín"
  },
  "memories": [],
  "condolences": []
}
```

### 11.6. Enviar condolencia

```http
POST /api/v1/public/memorials/a1b2c3d4e5f6/condolences
Content-Type: application/json
Idempotency-Key: 01J...

{
  "authorName": "Lucía",
  "message": "Un abrazo enorme para toda la familia.",
  "email": "lucia@example.com"
}
```

```json
{
  "id": "c1...",
  "status": "PENDING",
  "createdAt": "2026-11-05T10:00:00.000Z"
}
```

### 11.7. Generar biografía con IA

```http
POST /api/v1/organizations/7b.../ai/biography
Content-Type: application/json
Idempotency-Key: 01J...

{
  "memorialId": "5c...",
  "facts": {
    "firstNames": "María",
    "lastNames": "López Ruiz",
    "birthDate": "1948-03-12",
    "deathDate": "2026-10-28",
    "birthPlace": "Segovia",
    "profession": "Maestra",
    "hobbies": ["Jardinería", "Lectura"],
    "anecdotes": ["Pasaba los veranos en la casa familiar de la sierra."]
  },
  "tone": "WARM",
  "length": "MEDIUM"
}
```

---

## 12. Reglas de rutas públicas

- Solo devuelven contenido expresamente publicado.
- No aceptan cookies de sesión para ampliar información.
- No incluyen datos de familiares vivos.
- No incluyen documentos.
- No permiten enumerar memoriales privados.
- Rate limit por IP.
- Caché corta e invalidación al publicar/despublicar.
- `noindex` por defecto.
- Los errores no distinguen entre inexistente, privado o no publicado: 404.

---

## 13. OpenAPI

- Generado desde Zod con `zod-to-openapi`.
- Disponible en `/api/v1/openapi.json` en desarrollo y staging.
- En producción, solo para clientes autorizados o deshabilitado.
- CI compara el esquema generado y falla si hay cambios no documentados.
- El frontend puede generar tipos desde el esquema.

---

## 14. Versionado y deprecación

- Versión mayor en la ruta (`/v1`).
- Cambios incompatibles requieren `/v2`.
- Cabecera `Deprecation` y `Sunset` para recursos obsoletos.
- Documentar migración.

---

## 15. Seguridad de la API

- HTTPS obligatorio.
- CORS con lista blanca.
- CSRF en cookies.
- Rate limiting.
- Validación de tamaño de cuerpo.
- Timeouts.
- Sin secretos en query strings.
- Sin tokens en logs.
- Sin datos personales en logs.
- Errores genéricos.
- Cabeceras de seguridad.
