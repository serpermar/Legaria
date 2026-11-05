# Spec 03 — Expedientes, personas fallecidas y servicios

**Módulo**: `cases`
**Fase**: 3 (Expedientes y servicios)
**Depende de**: `01-autenticacion-rbac.md`, `02-organizaciones-empleados.md`, ADR 0004
**Habilita**: `04-invitaciones.md`, `05-ia.md`

---

## 1. Objetivo

Permitir que la funeraria registre y gestione el expediente funerario, la persona fallecida, los servicios, las salas, las ceremonias, las asignaciones de empleados y la documentación asociada.

---

## 2. Actores y permisos

| Acción | `FUNERAL_ADMIN` | `FUNERAL_EMPLOYEE` |
|---|---|---|
| Crear expediente | ✓ | ✓ |
| Leer expediente | ✓ (todos) | Solo asignados |
| Editar expediente | ✓ | Solo asignados |
| Cerrar/archivar | ✓ | — |
| Gestionar persona fallecida | ✓ | Solo asignados |
| Gestionar servicios | ✓ | Solo asignados |
| Gestionar salas | ✓ | — |
| Asignar empleados | ✓ | — |
| Subir documentos | ✓ | Solo asignados |
| Descargar documentos | ✓ | Solo asignados |
| Eliminar documentos | ✓ | — |

La familia accede a una vista limitada, definida en [04-familias-invitaciones.md](./04-familias-invitaciones.md).

---

## 3. Modelo implicado

- `cases`
- `deceased_persons`
- `funeral_services`
- `rooms`
- `ceremonies`
- `case_assignments`
- `documents`
- `audit_logs`

---

## 4. Reglas de negocio

### 4.1. Expediente

- La referencia es única por organización.
- Formato propuesto: `FUN-{AÑO}-{SECUENCIA}` (`FUN-2026-0001`).
- Se genera en servidor de forma atómica.
- No se puede reutilizar una referencia.
- El expediente nace en `DRAFT` o `ACTIVE` según configuración.
- `DRAFT` permite preparar datos antes de confirmar el servicio.
- `ACTIVE` habilita la operación y el acceso familiar.
- `CLOSED` indica servicio finalizado.
- `ARCHIVED` oculta de listados operativos y conserva datos según retención.

### 4.2. Transiciones

```text
DRAFT -> ACTIVE
DRAFT -> ARCHIVED
ACTIVE -> CLOSED
ACTIVE -> ARCHIVED (solo admin, con motivo)
CLOSED -> ACTIVE (solo admin, con motivo)
CLOSED -> ARCHIVED
ARCHIVED -> (sin retorno en el MVP)
```

- Una transición inválida devuelve 409.
- Cerrar un expediente requiere que no haya servicios `IN_PROGRESS`.
- Archivar requiere motivo.
- Reabrir requiere motivo y queda auditado.

### 4.3. Persona fallecida

- Un expediente tiene exactamente una persona fallecida en el MVP.
- Campos obligatorios: nombres, apellidos y fecha de fallecimiento.
- `deathDate >= birthDate` si ambas existen.
- No se permiten fechas futuras en `birthDate`.
- `deathDate` no puede ser futura salvo configuración expresa.
- No se almacenan DNI, salud, religión ni causa de fallecimiento en el MVP.
- Los datos se muestran a la familia solo si están autorizados.
- La edición de datos sensibles se audita.

### 4.4. Servicios funerarios

- Un expediente puede tener varios servicios.
- Tipos: `BURIAL`, `CREMATION`, `FUNERAL_MASS`, `CIVIL_CEREMONY`, `WAKE`, `OTHER`.
- Estados: `PLANNED`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
- `scheduledEnd >= scheduledStart`.
- Un servicio `COMPLETED` no se edita salvo admin con motivo.
- Un servicio `CANCELLED` no se elimina; se conserva para historial.
- La familia ve fecha, hora, tipo y ubicación del servicio.

### 4.5. Salas y ceremonias

- Las salas pertenecen a la organización.
- Una ceremonia pertenece a un servicio y puede tener sala.
- No se permiten solapamientos de la misma sala.
- `endsAt > startsAt`.
- Validar zona horaria de la organización.
- La familia ve la sala y el horario de la ceremonia.
- La dirección exacta se muestra solo si se autoriza.

### 4.6. Asignaciones

- Solo miembros activos de la organización.
- Un empleado puede estar asignado a varios expedientes.
- `UNIQUE (case_id, organization_member_id)` para asignaciones activas.
- Retirar una asignación no elimina el historial.
- Un empleado sin asignación no puede acceder al expediente.
- Se recomienda al menos un `LEAD` por expediente activo.

### 4.7. Documentos

- Metadatos en base de datos; archivo en Storage privado.
- `access_level`: `ORGANIZATION` o `FAMILY`.
- La familia solo descarga documentos `FAMILY`.
- Descarga mediante URL firmada de corta duración.
- Validar MIME, tamaño y extensión.
- No se permite SVG.
- El nombre original no se usa como ruta.
- Borrado lógico y purga posterior.
- La subida y descarga sensible se audita.

### 4.8. Visibilidad para la familia

La familia puede ver:

- Nombre de la funeraria y contacto.
- Tipo, fecha, hora y ubicación del servicio.
- Sala y ceremonias.
- Nombre y fechas de la persona fallecida.
- Documentos marcados como `FAMILY`.
- Memorial, si existe.

No puede ver:

- Notas internas.
- Empleados asignados.
- Historial de auditoría.
- Documentos internos.
- Datos de otras familias.
- Precios o facturación (fase 7).

---

## 5. Endpoints

### Expedientes

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/organizations/:organizationId/cases` | `case:read` |
| POST | `/api/v1/organizations/:organizationId/cases` | `case:create` |
| GET | `/api/v1/organizations/:organizationId/cases/:caseId` | `case:read` |
| PATCH | `/api/v1/organizations/:organizationId/cases/:caseId` | `case:update` |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/close` | `case:close` |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/reopen` | `case:close` |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/archive` | `case:archive` |
| GET | `/api/v1/organizations/:organizationId/cases/:caseId/activity` | `case:read` |

### Persona fallecida

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/organizations/:organizationId/cases/:caseId/deceased` | `deceased:read` |
| PUT | `/api/v1/organizations/:organizationId/cases/:caseId/deceased` | `deceased:update` |
| PATCH | `/api/v1/organizations/:organizationId/cases/:caseId/deceased` | `deceased:update` |

### Servicios y ceremonias

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/organizations/:organizationId/cases/:caseId/services` | `service:read` |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/services` | `service:manage` |
| PATCH | `/api/v1/organizations/:organizationId/cases/:caseId/services/:serviceId` | `service:manage` |
| DELETE | `/api/v1/organizations/:organizationId/cases/:caseId/services/:serviceId` | `service:manage` |
| GET | `/api/v1/organizations/:organizationId/rooms` | `service:read` |
| POST | `/api/v1/organizations/:organizationId/rooms` | `service:manage` |
| PATCH | `/api/v1/organizations/:organizationId/rooms/:roomId` | `service:manage` |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/services/:serviceId/ceremonies` | `service:manage` |
| PATCH | `/api/v1/organizations/:organizationId/cases/:caseId/services/:serviceId/ceremonies/:ceremonyId` | `service:manage` |

### Asignaciones

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/organizations/:organizationId/cases/:caseId/assignments` | `assignment:manage` |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/assignments` | `assignment:manage` |
| DELETE | `/api/v1/organizations/:organizationId/cases/:caseId/assignments/:assignmentId` | `assignment:manage` |

### Documentos

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/organizations/:organizationId/cases/:caseId/documents` | `document:read` |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/documents/upload-url` | `document:upload` |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/documents/:documentId/complete` | `document:upload` |
| GET | `/api/v1/organizations/:organizationId/cases/:caseId/documents/:documentId/download-url` | `document:read` |
| DELETE | `/api/v1/organizations/:organizationId/cases/:caseId/documents/:documentId` | `document:delete` |

---

## 6. Validaciones

### Expediente

- `reference` generada por servidor; no editable por el cliente.
- `status` solo cambia por endpoints específicos.
- `openedAt` no futura.
- `notes` máximo 5.000 caracteres.
- `search` máximo 100 caracteres.

### Persona fallecida

- `firstNames` 1–120.
- `lastNames` 1–160.
- `birthDate` y `deathDate` en formato `YYYY-MM-DD`.
- `deathDate` obligatoria.
- Coherencia de fechas.
- `birthPlace` y `deathPlace` máximo 160.
- Sin campos de salud, religión o DNI en el MVP.

### Servicio

- Tipo válido.
- `scheduledStart` y `scheduledEnd` coherentes.
- `roomId` pertenece a la organización.
- `caseId` pertenece a la organización.
- `status` con transición válida.

### Ceremonia

- `startsAt < endsAt`.
- Sin solapamiento de sala.
- `roomId` de la organización.
- Zona horaria válida.

### Documento

- Tamaño máximo: 10 MB en MVP.
- Tipos permitidos: PDF, JPEG, PNG, WebP, DOCX.
- MIME real verificado.
- `accessLevel` válido.
- `kind` válido.

---

## 7. Errores

| Código | HTTP | Descripción |
|---|---|---|
| `CASE_NOT_FOUND` | 404 | Expediente inexistente o sin acceso. |
| `CASE_REFERENCE_TAKEN` | 409 | Referencia duplicada. |
| `INVALID_CASE_TRANSITION` | 409 | Transición no permitida. |
| `CASE_HAS_ACTIVE_SERVICES` | 409 | No se puede cerrar con servicios en curso. |
| `DECEASED_ALREADY_EXISTS` | 409 | Ya existe persona fallecida. |
| `INVALID_DATE_RANGE` | 422 | Fechas incoherentes. |
| `ROOM_NOT_FOUND` | 404 | Sala inexistente. |
| `ROOM_OVERLAP` | 409 | Solapamiento de sala. |
| `SERVICE_NOT_FOUND` | 404 | Servicio inexistente. |
| `ASSIGNMENT_ALREADY_EXISTS` | 409 | Empleado ya asignado. |
| `DOCUMENT_TOO_LARGE` | 413 | Archivo demasiado grande. |
| `DOCUMENT_TYPE_NOT_ALLOWED` | 422 | Tipo no permitido. |

---

## 8. Auditoría

- `case.created`
- `case.updated`
- `case.closed`
- `case.reopened`
- `case.archived`
- `deceased.created`
- `deceased.updated`
- `service.created`
- `service.updated`
- `service.cancelled`
- `ceremony.created`
- `ceremony.updated`
- `assignment.added`
- `assignment.removed`
- `document.uploaded`
- `document.downloaded`
- `document.deleted`

---

## 9. Casos límite

1. Dos usuarios crean expedientes a la vez: la secuencia debe ser atómica.
2. Empleado asignado a un expediente archivado: solo lectura histórica.
3. Servicio sin sala: permitido.
4. Ceremonia sin hora de fin: no permitido en el MVP.
5. Documento de otra organización: 404.
6. Documento marcado `FAMILY` pero sin familia creada: visible cuando exista.
7. Cierre con servicio `IN_PROGRESS`: 409.
8. Reapertura sin motivo: 422.
9. Fecha de fallecimiento futura: 422.
10. Sala solapada: 409.

---

## 10. Criterios de aceptación

- [ ] Se crea un expediente con referencia única.
- [ ] Se registra y edita la persona fallecida.
- [ ] Se crean servicios y ceremonias.
- [ ] Se detectan solapamientos de sala.
- [ ] Se asignan y retiran empleados.
- [ ] Un empleado no asignado no accede.
- [ ] Un empleado de otra organización no accede.
- [ ] Se suben y descargan documentos con URL firmada.
- [ ] La familia ve solo la información autorizada.
- [ ] Las transiciones inválidas se bloquean.
- [ ] Las acciones se auditan.
- [ ] Existen pruebas cross-tenant.

---

## 11. Preguntas abiertas

1. ¿Puede haber más de una persona fallecida por expediente?
2. ¿Se almacena DNI/NIE? (Recomendado: no en MVP.)
3. ¿Formato definitivo de referencia?
4. ¿Se permite crear un expediente sin persona fallecida?
5. ¿Se gestionan precios o presupuestos en el MVP?
6. ¿Se permite adjuntar documentos a la familia directamente?
7. ¿Qué documentos son obligatorios antes de cerrar un expediente?
8. ¿Se integra con un sistema externo de gestión funeraria?
