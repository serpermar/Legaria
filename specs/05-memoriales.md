# Spec 05 — Memoriales

**Estado:** Borrador  
**Fase:** 5  
**Depende de:** Spec 01, Spec 03, Spec 04

---

## 1. Objetivo

Permitir la creación de un memorial digital asociado a un expediente, con contenido revisado, autorización verificable, niveles de privacidad y un espacio público seguro para condolencias.

---

## 2. Actores y permisos

| Acción | `FUNERAL_ADMIN` | `FUNERAL_EMPLOYEE` | `FAMILY_ADMIN` | `FAMILY_MEMBER` | `VISITOR` |
|---|---|---|---|---|---|
| Crear memorial | ✓ | Asignado | ✓ | — | — |
| Editar borrador | ✓ | Asignado | ✓ | ✓ | — |
| Editar publicado | ✓ | — | Solicitud | Solicitud | — |
| Subir medios | ✓ | Asignado | ✓ | ✓ | — |
| Añadir recuerdos | ✓ | Asignado | ✓ | ✓ | — |
| Añadir cronología | ✓ | Asignado | ✓ | ✓ | — |
| Enviar a revisión | ✓ | — | ✓ | — | — |
| Revisar/aprobar | ✓ | — | — | — | — |
| Publicar/despublicar | ✓ | — | — | — | — |
| Moderar condolencias | ✓ | Asignado | ✓ | — | — |
| Ver público | ✓ | ✓ | ✓ | ✓ | ✓ |
| Crear condolencia | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 3. Modelo implicado

- `memorials`
- `memorial_media`
- `memories`
- `timeline_events`
- `condolences`
- `publication_authorizations`
- `memorial_access_grants` (nueva entidad propuesta)
- `documents`
- `content_requests`
- `ai_generations`
- `audit_logs`

### `memorial_access_grants`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `organization_id` | uuid FK | |
| `memorial_id` | uuid FK | |
| `user_id` | uuid FK | Usuario autorizado. |
| `granted_by` | uuid FK | |
| `expires_at` | timestamptz null | Opcional. |
| `created_at` | timestamptz | |

---

## 4. Ciclo de vida

```text
DRAFT
  -> PENDING_REVIEW
      -> PUBLISHED
          -> UNPUBLISHED
              -> PENDING_REVIEW
          -> ARCHIVED
      -> REJECTED
          -> DRAFT
  -> ARCHIVED
PUBLISHED -> ARCHIVED
UNPUBLISHED -> ARCHIVED
```

Reglas:

- `DRAFT` no es visible fuera del ámbito autorizado.
- `PENDING_REVIEW` solo lo ven staff y familia administradora.
- `PUBLISHED` requiere autorización vigente.
- `REJECTED` incluye motivo obligatorio.
- `UNPUBLISHED` deja de resolver la URL pública.
- `ARCHIVED` conserva datos según retención.
- Las transiciones inválidas devuelven 409.

---

## 5. Visibilidad

| Nivel | Quién accede | Requiere publicación | Indexación |
|---|---|---|---|
| `PUBLIC` | Cualquiera | Sí | `noindex` por defecto. |
| `PRIVATE` | Miembros activos del grupo familiar | Sí o no, según estado | No. |
| `RESTRICTED` | Usuarios con `memorial_access_grant` | Sí o no, según estado | No. |

Reglas:

- `PUBLIC` sin `PUBLISHED` no resuelve.
- `PRIVATE` requiere sesión y membership activa.
- `RESTRICTED` requiere concesión explícita.
- Los visitantes nunca ven contenido no publicado.
- La familia no ve datos internos del expediente.
- La visibilidad se comprueba en cada petición; no se cachea en el cliente como autorización.

---

## 6. Autorización de publicación

### 6.1. Requisitos

Antes de publicar:

1. El memorial tiene contenido mínimo: nombre, fechas, fotografía principal o biografía.
2. Existe una `publication_authorization` vigente de tipo `PUBLICATION`.
3. La autorización fue otorgada por un `FAMILY_ADMIN`.
4. El `FUNERAL_ADMIN` ha revisado el contenido.
5. Se ha registrado la evidencia técnica (fecha, usuario, IP hash).

### 6.2. Autorización

```text
POST /api/v1/memorials/:memorialId/authorizations
{
  "relationship": "Hija",
  "documentId": "uuid-opcional",
  "scope": "PUBLICATION",
  "declaration": true
}
```

Reglas:

- Solo `FAMILY_ADMIN`.
- La declaración debe ser explícita.
- Se puede adjuntar documento firmado.
- Se guarda `grantedAt`, `grantedBy`, `ipHash`.
- Se puede revocar.
- La revocación despublica el memorial de inmediato o en la siguiente operación programada.
- Si no hay autorización vigente, la publicación se bloquea.

### 6.3. Revisión

El `FUNERAL_ADMIN` revisa:

- Biografía.
- Fotografías y vídeos.
- Recuerdos y cronología.
- Ausencia de datos de personas vivas sin consentimiento.
- Ausencia de contenido ofensivo.
- Coherencia con la autorización.

Puede:

- Aprobar y publicar.
- Rechazar con motivo.
- Solicitar cambios.

---

## 7. Contenido

### 7.1. Biografía

- Texto plano.
- Máximo 20.000 caracteres.
- Editable en borrador por `FAMILY_ADMIN` y `FAMILY_MEMBER`.
- Tras la publicación, solo `FUNERAL_ADMIN` edita directamente.
- La familia solicita cambios mediante `content_requests`.
- No se permite HTML.
- Si se genera con IA, se etiqueta y requiere aprobación humana.

### 7.2. Medios

- Imagen principal y galería.
- Imágenes: JPEG, PNG, WebP; máximo 10 MB.
- Vídeos: MP4, WebM; máximo 200 MB y 5 minutos en el MVP.
- Audio: opcional, fase posterior.
- Procesamiento de imágenes: redimensionado, WebP y eliminación de EXIF.
- `altText` obligatorio en imágenes publicadas.
- Orden manual.
- Estado `PENDING` hasta aprobación si lo sube la familia tras publicación.
- Borrado lógico y eliminación del derivado público.

### 7.3. Recuerdos

- Título opcional y contenido obligatorio.
- Máximo 5.000 caracteres.
- Puede asociarse a una fecha y a un medio.
- Visibilidad `PUBLIC`, `FAMILY` o `RESTRICTED`.
- Estado `PENDING` o `APPROVED` según quién lo cree.
- La familia puede editar sus propios recuerdos.
- La funeraria puede ocultar o rechazar.

### 7.4. Cronología

- Título, descripción y fecha.
- `datePrecision`: año, mes o día.
- Orden cronológico.
- Origen `FAMILY`, `FUNERAL_HOME` o `AI_DRAFT`.
- Los eventos `AI_DRAFT` requieren revisión.

### 7.5. Condolencias

- Cualquier visitante puede enviar en memorial público.
- Nombre y mensaje obligatorios.
- Email opcional, nunca público.
- Máximo 1.000 caracteres.
- Sin HTML.
- Estado inicial `PENDING`.
- Solo las `APPROVED` se muestran.
- Moderación por familia o funeraria.
- Límite por IP y memorial.
- CAPTCHA o prueba de trabajo.
- Honeypot.
- Reporte de contenido.

---

## 8. Publicación y cambios posteriores

- La publicación inicial requiere autorización y revisión.
- Los medios y recuerdos añadidos por la familia después de publicar quedan `PENDING` hasta moderación.
- La biografía publicada solo la edita el staff; la familia solicita cambios.
- Cualquier cambio sensible se audita.
- Despublicar oculta el memorial y su URL.
- Se puede volver a publicar tras revisión.
- La autorización revocada impide publicar.

---

## 9. Página pública

### 9.1. Contenido

- Nombre y apellidos.
- Fechas de nacimiento y fallecimiento.
- Fotografía principal.
- Biografía aprobada.
- Galería aprobada.
- Recuerdos públicos aprobados.
- Cronología pública aprobada.
- Condolencias aprobadas.
- Enlace para compartir.
- Formulario de condolencia.
- Botón de reporte.

### 9.2. No mostrar

- Documentos.
- Datos de familiares vivos.
- Emails o teléfonos.
- Condolencias pendientes.
- Notas internas.
- Identificadores internos.
- Datos de salud o creencias.
- Ubicación exacta salvo autorización.

### 9.3. SEO y compartición

- `noindex, nofollow` por defecto.
- Título y descripción generados con datos mínimos.
- Open Graph con imagen pública.
- Sin nombre en la URL por defecto.
- `sitemap` solo con memoriales públicos e indexables.
- Al despublicar: 404/410 y eliminación del sitemap.

### 9.4. Caché

- Contenido público: caché corta con invalidación al publicar/despublicar.
- Contenido privado/restringido: `Cache-Control: no-store`.
- Condolencias: sin caché o caché muy corta.

### 9.5. Aniversarios

- Fase 6.
- Opt-in de la familia.
- Recordatorio por email.
- No enviar a visitantes.

---

## 10. Endpoints

### Memorial

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/organizations/:organizationId/cases/:caseId/memorial` | `memorial:read` |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/memorial` | `memorial:create` |
| GET | `/api/v1/memorials/:memorialId` | `memorial:read` |
| PATCH | `/api/v1/memorials/:memorialId` | `memorial:update` |
| POST | `/api/v1/memorials/:memorialId/submit` | `memorial:submit` |
| POST | `/api/v1/memorials/:memorialId/approve` | `memorial:review` |
| POST | `/api/v1/memorials/:memorialId/reject` | `memorial:review` |
| POST | `/api/v1/memorials/:memorialId/publish` | `memorial:publish` |
| POST | `/api/v1/memorials/:memorialId/unpublish` | `memorial:publish` |
| POST | `/api/v1/memorials/:memorialId/archive` | `memorial:publish` |

### Autorizaciones y accesos

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/api/v1/memorials/:memorialId/authorizations` | `memorial:update` |
| DELETE | `/api/v1/memorials/:memorialId/authorizations/:authorizationId` | `memorial:update` |
| GET | `/api/v1/memorials/:memorialId/access-grants` | `memorial:update` |
| POST | `/api/v1/memorials/:memorialId/access-grants` | `memorial:update` |
| DELETE | `/api/v1/memorials/:memorialId/access-grants/:grantId` | `memorial:update` |

### Medios

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/api/v1/memorials/:memorialId/media/upload-url` | `memorial:update` |
| POST | `/api/v1/memorials/:memorialId/media/:mediaId/complete` | `memorial:update` |
| PATCH | `/api/v1/memorials/:memorialId/media/:mediaId` | `memorial:update` |
| DELETE | `/api/v1/memorials/:memorialId/media/:mediaId` | `memorial:update` |

### Recuerdos y cronología

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/api/v1/memorials/:memorialId/memories` | `memory:create` |
| PATCH | `/api/v1/memorials/:memorialId/memories/:memoryId` | `memory:create` |
| DELETE | `/api/v1/memorials/:memorialId/memories/:memoryId` | `memory:create` |
| POST | `/api/v1/memorials/:memorialId/timeline` | `memorial:update` |
| PATCH | `/api/v1/memorials/:memorialId/timeline/:eventId` | `memorial:update` |
| DELETE | `/api/v1/memorials/:memorialId/timeline/:eventId` | `memorial:update` |

### Condolencias

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/memorials/:memorialId/condolences` | `condolence:read` |
| PATCH | `/api/v1/memorials/:memorialId/condolences/:condolenceId` | `condolence:moderate` |
| GET | `/api/v1/public/memorials/:slug` | Público |
| POST | `/api/v1/public/memorials/:slug/condolences` | Público |
| POST | `/api/v1/public/memorials/:slug/report` | Público |

---

## 11. Validaciones

- `biography` máximo 20.000 caracteres.
- `condolence.message` 2–1.000 caracteres.
- `memory.content` 2–5.000 caracteres.
- `title` máximo 120.
- `caption` máximo 300.
- `altText` máximo 300 y obligatorio en imágenes publicadas.
- `slug` generado por servidor, opaco, único.
- `visibility` y `status` válidos.
- Transiciones válidas.
- Autorización vigente antes de publicar.
- MIME, tamaño y extensión de medios.
- Sin HTML.
- Sin enlaces sospechosos en condolencias (o moderación).
- Fechas coherentes.

---

## 12. Errores

| Código | HTTP | Descripción |
|---|---|---|
| `MEMORIAL_NOT_FOUND` | 404 | Inexistente o sin acceso. |
| `MEMORIAL_ALREADY_EXISTS` | 409 | Ya existe memorial para el expediente. |
| `INVALID_MEMORIAL_TRANSITION` | 409 | Transición no permitida. |
| `PUBLICATION_AUTHORIZATION_REQUIRED` | 409 | Falta autorización. |
| `PUBLICATION_AUTHORIZATION_REVOKED` | 409 | Autorización revocada. |
| `MEMORIAL_NOT_PUBLISHED` | 404 | No publicado. |
| `MEMORIAL_NOT_PUBLIC` | 404 | No es público. |
| `MEDIA_TYPE_NOT_ALLOWED` | 422 | Tipo no permitido. |
| `MEDIA_TOO_LARGE` | 413 | Archivo demasiado grande. |
| `ALT_TEXT_REQUIRED` | 422 | Falta texto alternativo. |
| `CONDOLENCE_RATE_LIMITED` | 429 | Demasiadas condolencias. |
| `CONDOLENCE_NOT_FOUND` | 404 | Condolencia inexistente. |
| `CONTENT_REPORTED` | 202 | Reporte recibido. |

---

## 13. Auditoría

- `memorial.created`
- `memorial.updated`
- `memorial.submitted`
- `memorial.approved`
- `memorial.rejected`
- `memorial.published`
- `memorial.unpublished`
- `memorial.archived`
- `memorial.authorization.granted`
- `memorial.authorization.revoked`
- `memorial.media.uploaded`
- `memorial.media.approved`
- `memorial.media.deleted`
- `memorial.memory.created`
- `memorial.memory.moderated`
- `memorial.condolence.created`
- `memorial.condolence.approved`
- `memorial.condolence.rejected`
- `memorial.condolence.hidden`
- `memorial.reported`
- `memorial.access.granted`
- `memorial.access.revoked`

---

## 14. Casos límite

1. Memorial sin autorización: no se publica.
2. Autorización revocada tras publicar: se despublica.
3. Memorial público sin foto: se permite si hay biografía.
4. Imagen sin `altText`: no se publica.
5. Condolencia duplicada: se detecta o modera.
6. Condolencia con enlaces: se modera.
7. Visibilidad cambiada de público a privado: la URL deja de ser pública.
8. Slug ya existente: se regenera.
9. Expediente archivado: memorial en solo lectura.
10. Organización suspendida: memorial despublicado o no accesible.
11. Cambio de biografía tras publicación: solo staff o solicitud.
12. Eliminación de un medio: se elimina el derivado público.
13. Reporte de contenido: se registra y se notifica.
14. Acceso restringido sin concesión: 404.
15. Intento de publicar sin revisión: 409.

---

## 15. Criterios de aceptación

- [ ] Se crea un memorial en borrador.
- [ ] Se edita la biografía y se suben imágenes.
- [ ] Se registra la autorización del `FAMILY_ADMIN`.
- [ ] El `FUNERAL_ADMIN` revisa y publica.
- [ ] Sin autorización no se publica.
- [ ] El memorial público resuelve por URL.
- [ ] El privado no resuelve públicamente.
- [ ] El restringido solo accede el usuario autorizado.
- [ ] Las condolencias quedan pendientes hasta moderación.
- [ ] Las imágenes públicas no tienen EXIF.
- [ ] `noindex` está activo por defecto.
- [ ] Despublicar oculta el contenido.
- [ ] Se auditan publicación, cambios y moderación.
- [ ] Existen pruebas de acceso público/privado/restringido.

---

## 16. Preguntas abiertas

1. ¿Quién puede ser `FAMILY_ADMIN` a efectos de autorización?
2. ¿Se exige documento firmado o basta consentimiento digital?
3. ¿Se permite memorial sin fotografía?
4. ¿Se permite biografía generada por IA en la versión pública?
5. ¿Qué cambios posteriores requieren nueva revisión?
6. ¿Se permite indexación en buscadores?
7. ¿Se permite compartir un memorial privado mediante enlace sin cuenta?
8. ¿Se permite moderación posterior en familias verificadas?
9. ¿Se muestran condolencias con nombre completo o solo nombre?
10. ¿Qué ocurre con el memorial al cancelar la organización?
