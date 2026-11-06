# Spec 04 — Familias, invitaciones y portal privado

**Estado:** Borrador  
**Fase:** 4  
**Depende de:** Spec 01, Spec 03

---

## 1. Objetivo

Permitir que la funeraria incorpore a la familia a un espacio privado asociado al expediente, con invitaciones seguras, roles diferenciados y acceso limitado a la información autorizada.

---

## 2. Actores y permisos

| Acción | `FUNERAL_ADMIN` | `FUNERAL_EMPLOYEE` | `FAMILY_ADMIN` | `FAMILY_MEMBER` |
|---|---|---|---|---|
| Crear grupo familiar | ✓ | — | — | — |
| Ver grupo familiar | ✓ | Asignado | ✓ | ✓ |
| Invitar familiar | ✓ | Asignado | ✓ | — |
| Revocar invitación | ✓ | — | ✓ | — |
| Cambiar rol familiar | ✓ | — | ✓ | — |
| Retirar familiar | ✓ | — | ✓ | — |
| Abandonar grupo | — | — | ✓ | ✓ |
| Transferir administración | — | — | ✓ | — |
| Ver expediente limitado | ✓ | Asignado | ✓ | ✓ |
| Descargar documentos familia | ✓ | Asignado | ✓ | ✓ |
| Solicitar cambios/eliminación | — | — | ✓ | ✓ |
| Moderar condolencias | ✓ | Asignado | ✓ | — |

---

## 3. Modelo implicado

- `family_groups`
- `family_members`
- `invitations`
- `cases`
- `deceased_persons`
- `funeral_services`
- `ceremonies`
- `documents`
- `memorials`
- `content_requests` (nueva entidad propuesta)
- `audit_logs`

### `content_requests`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `organization_id` | uuid FK | |
| `case_id` | uuid FK | |
| `memorial_id` | uuid null | |
| `requested_by` | uuid FK | |
| `type` | enum | `MODIFICATION`, `DELETION`, `ACCESS`, `OTHER`. |
| `target_type` | text | `BIOGRAPHY`, `MEDIA`, `MEMORY`, `CONDOLENCE`, `DOCUMENT`, `ACCOUNT`. |
| `target_id` | uuid null | |
| `description` | text | |
| `status` | enum | `OPEN`, `IN_REVIEW`, `RESOLVED`, `REJECTED`. |
| `resolved_by` | uuid null | |
| `resolved_at` | timestamptz null | |
| `created_at`, `updated_at` | timestamptz | |

---

## 4. Grupo familiar

### 4.1. Creación

- Se crea automáticamente al activar un expediente, si no existe.
- También puede crearlo un `FUNERAL_ADMIN` mediante endpoint.
- Un expediente tiene un grupo familiar en el MVP.
- El grupo no es visible públicamente.
- El nombre del grupo es interno.

### 4.2. Roles

- `FAMILY_ADMIN`: responsable del grupo.
- `FAMILY_MEMBER`: familiar autorizado.

Un grupo debe tener al menos un `FAMILY_ADMIN` activo.

### 4.3. Límites

- Máximo de miembros por grupo: configurable por plan (propuesta: 20 en Basic, 50 en Professional).
- Máximo de invitaciones pendientes por grupo: 10.
- Un usuario no puede tener dos memberships activas en el mismo grupo.

### 4.4. Salida y revocación

- Un miembro puede abandonar el grupo.
- Si es el último administrador, debe transferir la administración antes de salir.
- Un `FAMILY_ADMIN` puede retirar a otro miembro.
- La retirada revoca el acceso de inmediato.
- El contenido aportado por el miembro retirado permanece, salvo solicitud de eliminación.
- La retirada se audita.

### 4.5. Transferencia de administración

- Solo un `FAMILY_ADMIN` puede transferir.
- El destinatario debe ser miembro activo.
- La operación es atómica.
- Se audita.

---

## 5. Invitaciones

### 5.1. Tipos

- Invitación de empleado (Spec 02).
- Invitación de familia.

### 5.2. Creación

```text
POST /api/v1/organizations/:organizationId/cases/:caseId/family-group/invitations
{
  "email": "familiar@example.com",
  "role": "FAMILY_ADMIN" | "FAMILY_MEMBER",
  "relationship": "Hija"
}
```

o, desde el portal familiar:

```text
POST /api/v1/family-groups/:familyGroupId/invitations
```

Reglas:

- El emisor debe tener permiso sobre el grupo.
- El email se normaliza.
- No se puede invitar a un miembro activo.
- No se puede duplicar una invitación pendiente al mismo email.
- El rol `FAMILY_ADMIN` solo lo puede conceder un administrador de familia o de funeraria.
- Se genera un token aleatorio de 32 bytes.
- Se guarda solo el hash SHA-256.
- Caducidad: 7 días.
- Usos: 1.
- Se envía un email con el enlace.
- Se audita.

### 5.3. Enlace

Formato recomendado:

```text
https://app.legaria.es/invitacion#t=<token>
```

- El token va en el fragmento, que no se envía al servidor ni aparece en logs HTTP.
- La página lee el fragmento y lo envía a la API en el cuerpo de un `POST`.
- `Referrer-Policy: no-referrer`.
- No se incluye el token en analítica.
- No se incluye en emails de seguimiento.

### 5.4. Validación previa

```text
POST /api/v1/invitations/validate
{ "token": "..." }
```

Devuelve:

```json
{
  "emailMasked": "f***@example.com",
  "role": "FAMILY_MEMBER",
  "organizationName": "Funeraria Ejemplo",
  "expiresAt": "2026-11-12T10:00:00.000Z",
  "status": "VALID"
}
```

No consume el token.

### 5.5. Canje

```text
POST /api/v1/invitations/redeem
{
  "token": "...",
  "fullName": "Ana García",
  "password": "..."
}
```

Reglas:

- Validar hash, estado, caducidad y usos.
- Verificar que el email de la cuenta coincide.
- Si el usuario no existe, crear cuenta en Better Auth y en `users`.
- Si existe, requerir sesión con el email invitado.
- Crear membership en el grupo.
- Marcar invitación como `ACCEPTED` y `used_count = 1`.
- Enviar verificación de email si es cuenta nueva.
- La membership queda `INVITED` hasta verificar el email.
- Auditar.

### 5.6. Reenvío y revocación

- Reenviar invalida el token anterior y genera uno nuevo.
- Revocar cambia el estado a `REVOKED`.
- Una invitación revocada no se puede canjear.
- Ambas acciones se auditan.

### 5.7. Seguridad

- Límite de creación: 20/hora/organización.
- Límite de validación: 10/minuto/IP.
- Límite de canje: 5/hora/IP.
- Respuestas genéricas para tokens inválidos.
- No revelar si el email existe.
- Token de un solo uso.
- Caducidad estricta.
- Comparación en tiempo constante si se compara el hash.

---

## 6. Portal familiar

### 6.1. Secciones

1. **Resumen del servicio:** funeraria, tipo de servicio, fecha y estado.
2. **Horarios y ubicación:** ceremonias, sala y dirección autorizada.
3. **Documentación:** solo documentos `FAMILY`.
4. **Memorial:** enlace al memorial del expediente.
5. **Familia:** miembros y roles.
6. **Solicitudes:** cambios, eliminación o acceso.
7. **Ajustes:** perfil y preferencias.

### 6.2. DTO de vista familiar

El backend devuelve un DTO específico, no el modelo completo del expediente.

```json
{
  "case": {
    "id": "uuid",
    "status": "ACTIVE",
    "funeralHome": {
      "name": "Funeraria Ejemplo",
      "phone": "+34...",
      "email": "contacto@example.com"
    },
    "deceased": {
      "firstNames": "María",
      "lastNames": "López Ruiz",
      "birthDate": "1948-03-12",
      "deathDate": "2026-10-28"
    },
    "services": [
      {
        "type": "FUNERAL_MASS",
        "startsAt": "2026-10-30T10:00:00.000Z",
        "locationName": "Iglesia de San Juan",
        "address": "Calle Mayor 1"
      }
    ],
    "memorial": {
      "id": "uuid",
      "status": "PUBLISHED",
      "visibility": "PRIVATE"
    }
  }
}
```

No incluye:

- Notas internas.
- Empleados asignados.
- Auditoría.
- Documentos internos.
- Datos de otras familias.
- Precios.
- Identificadores internos innecesarios.

### 6.3. Permisos de contenido

| Contenido | FAMILY_ADMIN | FAMILY_MEMBER |
|---|---|---|
| Ver resumen | ✓ | ✓ |
| Ver documentos `FAMILY` | ✓ | ✓ |
| Ver memorial | ✓ | ✓ |
| Editar biografía | ✓ | ✓ |
| Subir fotos | ✓ | ✓ |
| Añadir recuerdos | ✓ | ✓ |
| Moderar condolencias | ✓ | — |
| Invitar miembros | ✓ | — |
| Retirar miembros | ✓ | — |
| Transferir administración | ✓ | — |
| Solicitar publicación | ✓ | — |
| Solicitar eliminación | ✓ | ✓ |

---

## 7. Solicitudes de cambio o eliminación

- Cualquier miembro puede crear una solicitud.
- Tipos: modificación, eliminación, acceso, otro.
- La solicitud se asigna a la funeraria.
- Estados: `OPEN`, `IN_REVIEW`, `RESOLVED`, `REJECTED`.
- Se notifica al solicitante.
- Se audita.
- La eliminación de contenido sensible se ejecuta tras validación.

---

## 8. Endpoints

### Grupo familiar

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/organizations/:organizationId/cases/:caseId/family-group` | `family:read` |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/family-group` | `family:manage` |
| GET | `/api/v1/family-groups/:familyGroupId` | `family:read` |
| GET | `/api/v1/family-groups/:familyGroupId/case` | `family:read` |
| GET | `/api/v1/family-groups/:familyGroupId/members` | `family:read` |
| PATCH | `/api/v1/family-groups/:familyGroupId/members/:memberId` | `family:manage` |
| DELETE | `/api/v1/family-groups/:familyGroupId/members/:memberId` | `family:manage` |
| POST | `/api/v1/family-groups/:familyGroupId/leave` | — |
| POST | `/api/v1/family-groups/:familyGroupId/transfer-admin` | `family:manage` |

### Invitaciones

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/api/v1/invitations/validate` | Público |
| POST | `/api/v1/invitations/redeem` | Público |
| POST | `/api/v1/organizations/:organizationId/cases/:caseId/family-group/invitations` | `invitation:create` |
| GET | `/api/v1/organizations/:organizationId/family-groups/:familyGroupId/invitations` | `invitation:create` |
| POST | `/api/v1/family-groups/:familyGroupId/invitations` | `invitation:create` |
| POST | `/api/v1/organizations/:organizationId/invitations/:invitationId/resend` | `invitation:create` |
| DELETE | `/api/v1/organizations/:organizationId/invitations/:invitationId` | `invitation:revoke` |
| DELETE | `/api/v1/family-groups/:familyGroupId/invitations/:invitationId` | `invitation:revoke` |

### Documentos y solicitudes

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/family-groups/:familyGroupId/documents` | `document:read` |
| GET | `/api/v1/family-groups/:familyGroupId/documents/:documentId/download-url` | `document:read` |
| POST | `/api/v1/family-groups/:familyGroupId/requests` | `family:read` |
| GET | `/api/v1/family-groups/:familyGroupId/requests` | `family:read` |

---

## 9. Validaciones

- Email válido y normalizado.
- Rol permitido.
- `relationship` máximo 60 caracteres.
- Token con longitud y formato esperados.
- Contraseña según política.
- `fullName` 2–120.
- No se puede invitar al último administrador a abandonar sin transferencia.
- No se puede retirar al último administrador.
- No se puede transferir a un miembro inactivo.

---

## 10. Errores

| Código | HTTP | Descripción |
|---|---|---|
| `FAMILY_GROUP_NOT_FOUND` | 404 | Grupo inexistente o sin acceso. |
| `FAMILY_GROUP_ALREADY_EXISTS` | 409 | Ya existe grupo para el expediente. |
| `FAMILY_MEMBER_ALREADY_ACTIVE` | 409 | Ya pertenece al grupo. |
| `FAMILY_MEMBER_NOT_FOUND` | 404 | Miembro inexistente. |
| `LAST_FAMILY_ADMIN` | 409 | No se puede dejar el grupo sin administrador. |
| `INVITATION_INVALID` | 404 | Token inválido. |
| `INVITATION_EXPIRED` | 410 | Token caducado. |
| `INVITATION_USED` | 409 | Token ya utilizado. |
| `INVITATION_EMAIL_MISMATCH` | 403 | Email no coincide. |
| `INVITATION_ROLE_NOT_ALLOWED` | 403 | Rol no permitido para el emisor. |
| `INVITATION_LIMIT_REACHED` | 429 | Límite de invitaciones. |
| `DOCUMENT_NOT_VISIBLE` | 404 | Documento no visible para familia. |

---

## 11. Auditoría

- `family.group.created`
- `family.member.invited`
- `family.member.joined`
- `family.member.role_changed`
- `family.member.removed`
- `family.member.left`
- `family.admin.transferred`
- `family.invitation.resent`
- `family.invitation.revoked`
- `family.document.downloaded`
- `family.request.created`
- `family.request.resolved`

---

## 12. Casos límite

1. Invitación caducada: se puede reenviar.
2. Invitación para email ya registrado: se vincula tras login.
3. Invitación para email distinto: se rechaza.
4. Reenvío: invalida el token anterior.
5. Último administrador intenta salir: se bloquea.
6. Miembro retirado con contenido: el contenido permanece salvo solicitud.
7. Grupo sin memorial: el portal muestra el estado pendiente.
8. Expediente archivado: el portal queda en solo lectura.
9. Organización suspendida: acceso bloqueado.
10. Token en url de Referer: mitigado con fragmento y `no-referrer`.

---

## 13. Criterios de aceptación

- [ ] Se crea el grupo familiar al activar el expediente.
- [ ] Se invita a un familiar con token de un solo uso.
- [ ] La invitación caduca y se puede revocar.
- [ ] El canje crea o vincula la cuenta.
- [ ] El familiar accede solo a su expediente.
- [ ] No accede a otro grupo familiar.
- [ ] `FAMILY_ADMIN` gestiona miembros y `FAMILY_MEMBER` no.
- [ ] El último administrador está protegido.
- [ ] Los documentos se descargan con URL firmada.
- [ ] Las solicitudes se registran y resuelven.
- [ ] Todas las acciones sensibles se auditan.
- [ ] Existen pruebas de token inválido, caducado y reutilizado.

---

## 14. Preguntas abiertas

1. ¿El grupo se crea automáticamente o solo manualmente?
2. ¿Puede haber varios grupos familiares por expediente?
3. ¿Puede un familiar pertenecer a varios grupos?
4. ¿Qué documentos pueden ver los familiares por defecto?
5. ¿La familia puede invitar sin aprobación de la funeraria?
6. ¿Se permite acceso por enlace sin cuenta para memoriales privados?
7. ¿Qué ocurre con el contenido de un miembro retirado?
8. ¿Se notifica a la funeraria de cada nueva incorporación?
