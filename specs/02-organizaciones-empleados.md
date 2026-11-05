# Spec 02 — Organizaciones y empleados

**Estado:** Borrador  
**Fase:** 2  
**Depende de:** Spec 01

---

## 1. Objetivo

Permitir que la plataforma dé de alta funerarias, que cada funeraria gestione su organización, sus empleados y sus roles, y que el Super Admin supervise el conjunto sin acceder al contenido sensible.

---

## 2. Actores y permisos

| Acción | Quién |
|---|---|
| Crear organización | `SUPER_ADMIN` |
| Suspender/cancelar organización | `SUPER_ADMIN` |
| Editar perfil de organización | `FUNERAL_ADMIN` |
| Invitar empleados | `FUNERAL_ADMIN` |
| Cambiar roles | `FUNERAL_ADMIN` |
| Eliminar empleados | `FUNERAL_ADMIN` |
| Consultar auditoría de la organización | `FUNERAL_ADMIN` |
| Consultar métricas globales | `SUPER_ADMIN` |
| Acceso de soporte a contenido | `SUPER_ADMIN` con concesión |

---

## 3. Modelo implicado

- `organizations`
- `organization_members`
- `invitations`
- `subscriptions` (fase 7)
- `audit_logs`
- `support_access_grants`

---

## 4. Reglas de negocio

### 4.1. Alta de organización

1. `SUPER_ADMIN` introduce nombre, slug, datos fiscales y email del administrador.
2. Se crea la organización en estado `PENDING` o `ACTIVE` según configuración.
3. Se crea una invitación para el `FUNERAL_ADMIN`.
4. Al aceptar, la organización pasa a `ACTIVE` si estaba pendiente.
5. Se audita.

Reglas:

- `slug` único, en minúsculas, sin espacios.
- `tax_id` único si se informa.
- No se puede crear una organización con un administrador que ya sea Super Admin.
- El email del administrador no puede estar ya vinculado a otra organización como administrador si la configuración lo impide.

### 4.2. Perfil de organización

Campos editables:

- Nombre comercial.
- Email y teléfono de contacto.
- Dirección.
- Zona horaria.
- Preferencias de notificación.
- Logo (fase posterior).

No editables por la funeraria:

- `plan`.
- `status`.
- `slug` (salvo solicitud justificada).
- Datos de facturación (fase 7).

### 4.3. Empleados

- Invitación por email con rol `FUNERAL_ADMIN` o `FUNERAL_EMPLOYEE`.
- Caducidad de 7 días.
- Un solo uso.
- El invitado debe aceptar y verificar su email.
- No se puede invitar a un email ya activo en la misma organización.
- Se puede reenviar una invitación pendiente.
- Se puede revocar una invitación pendiente.
- Al eliminar un empleado, su membership pasa a `REMOVED` y sus asignaciones se desactivan.
- El empleado conserva su cuenta si pertenece a otras organizaciones.

### 4.4. Roles

- `FUNERAL_ADMIN`: administra la organización, empleados, expedientes y publicación de memoriales.
- `FUNERAL_EMPLOYEE`: gestiona expedientes asignados y contenido derivado.
- No se puede asignar `SUPER_ADMIN` desde una organización.
- Un usuario puede ser administrador en una organización y empleado en otra.

### 4.5. Último administrador

- No se puede eliminar, suspender ni degradar al último `FUNERAL_ADMIN` activo.
- Para hacerlo, primero debe nombrarse otro administrador.
- La regla se aplica en backend y en base de datos si es posible.

### 4.6. Suspensión de organización

- `SUSPENDED`: no permite login de sus miembros ni operaciones, pero conserva datos.
- `CANCELLED`: inicia el proceso de retención y eliminación.
- El Super Admin debe indicar motivo.
- Se audita.
- Los usuarios conservan su cuenta personal.

### 4.7. Acceso de soporte

- El Super Admin solicita acceso con motivo y ámbito.
- Se concede por un tiempo máximo (por ejemplo, 2 horas).
- Se registra cada uso.
- Se revoca al finalizar.
- No se concede de forma permanente.
- El acceso a contenido sensible requiere esta concesión.

### 4.8. Métricas del dashboard

Para `FUNERAL_ADMIN`:

- Expedientes activos.
- Expedientes cerrados del mes.
- Servicios próximos.
- Invitaciones pendientes.
- Memoriales en borrador, en revisión y publicados.
- Condolencias pendientes de moderación.

Para `SUPER_ADMIN`:

- Organizaciones activas, suspendidas y canceladas.
- Usuarios activos.
- Memoriales publicados.
- Uso agregado de IA.
- Errores y estado técnico.
- Nunca contenido sensible.

---

## 5. Endpoints

### Organizaciones

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/api/v1/organizations` | `admin:manage_organizations` |
| GET | `/api/v1/organizations` | `admin:manage_organizations` |
| GET | `/api/v1/organizations/:organizationId` | `organization:read` |
| PATCH | `/api/v1/organizations/:organizationId` | `organization:update` |
| PATCH | `/api/v1/organizations/:organizationId/status` | `admin:manage_organizations` |
| GET | `/api/v1/organizations/:organizationId/metrics` | `organization:read` |
| GET | `/api/v1/organizations/:organizationId/audit-logs` | `organization:read_audit` |

### Empleados

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/organizations/:organizationId/members` | `organization:manage_members` |
| POST | `/api/v1/organizations/:organizationId/members/invitations` | `organization:manage_members` |
| POST | `/api/v1/organizations/:organizationId/members/invitations/:invitationId/resend` | `organization:manage_members` |
| DELETE | `/api/v1/organizations/:organizationId/members/invitations/:invitationId` | `organization:manage_members` |
| PATCH | `/api/v1/organizations/:organizationId/members/:memberId` | `organization:manage_members` |
| DELETE | `/api/v1/organizations/:organizationId/members/:memberId` | `organization:manage_members` |

### Soporte

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/api/v1/organizations/:organizationId/support-access` | `admin:manage_organizations` |
| DELETE | `/api/v1/organizations/:organizationId/support-access/:grantId` | `admin:manage_organizations` |

### Administración global

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/v1/admin/organizations` | `admin:manage_organizations` |
| GET | `/api/v1/admin/users` | `admin:manage_users` |
| PATCH | `/api/v1/admin/users/:userId/status` | `admin:manage_users` |
| PATCH | `/api/v1/admin/users/:userId/platform-role` | `admin:manage_users` |
| GET | `/api/v1/admin/settings` | `admin:access` |
| PATCH | `/api/v1/admin/settings` | `admin:access` |
| GET | `/api/v1/admin/metrics` | `admin:read_metrics` |
| GET | `/api/v1/admin/audit-logs` | `admin:read_audit` |

---

## 6. Validaciones

- `name`: 2–120 caracteres.
- `slug`: 3–60, `[a-z0-9-]`, sin guiones consecutivos.
- `taxId`: formato válido si se informa.
- `email`: formato y normalización.
- `phone`: formato flexible, sin obligatoriedad.
- Rol dentro de `FUNERAL_ADMIN` o `FUNERAL_EMPLOYEE`.
- No se puede invitar al mismo email dos veces con invitación pendiente.
- `reason` obligatorio en suspensión y acceso de soporte.
- `expiresAt` del acceso de soporte dentro del máximo permitido.

---

## 7. Errores

| Código | HTTP | Descripción |
|---|---|---|
| `ORGANIZATION_SLUG_TAKEN` | 409 | Slug ya utilizado. |
| `ORGANIZATION_TAX_ID_TAKEN` | 409 | CIF/NIF ya utilizado. |
| `LAST_ADMIN_REQUIRED` | 409 | No se puede dejar la organización sin administrador. |
| `MEMBER_ALREADY_ACTIVE` | 409 | El usuario ya pertenece a la organización. |
| `INVITATION_ALREADY_PENDING` | 409 | Ya existe una invitación pendiente. |
| `CANNOT_ASSIGN_PLATFORM_ROLE` | 403 | Intento de asignar rol global. |
| `ORGANIZATION_SUSPENDED` | 403 | Organización no operativa. |
| `SUPPORT_REASON_REQUIRED` | 422 | Falta motivo de soporte. |

---

## 8. Auditoría

- `organization.created`
- `organization.updated`
- `organization.suspended`
- `organization.cancelled`
- `organization.member.invited`
- `organization.member.invitation_resent`
- `organization.member.invitation_revoked`
- `organization.member.joined`
- `organization.member.role_changed`
- `organization.member.removed`
- `organization.settings.updated`
- `support.access.granted`
- `support.access.revoked`

---

## 9. Casos límite

1. Invitación a un email que ya tiene cuenta: se vincula.
2. Empleado eliminado con expedientes asignados: las asignaciones quedan inactivas y el administrador debe reasignar.
3. Organización suspendida con sesiones activas: las sesiones se revocan.
4. Cambio de rol del último administrador: se bloquea.
5. Usuario perteneciente a dos organizaciones: el contexto se selecciona explícitamente.
6. Reenvío de invitación: invalida la anterior.
7. Acceso de soporte caducado: se deniega y se audita.
8. Intento de acceso cruzado: 404.

---

## 10. Criterios de aceptación

- [ ] Se crea una organización y su administrador recibe invitación.
- [ ] El administrador acepta y accede solo a su organización.
- [ ] Se invitan empleados y aceptan.
- [ ] No se puede eliminar al último administrador.
- [ ] Los roles se aplican en backend.
- [ ] Un miembro de otra organización no puede acceder.
- [ ] El Super Admin no ve contenido sensible sin concesión.
- [ ] Las acciones quedan auditadas.
- [ ] La organización suspendida no permite operar.
- [ ] El dashboard muestra métricas agregadas.

---

## 11. Preguntas abiertas

1. ¿El alta de funeraria es solo manual o habrá autoservicio?
2. ¿Se permite más de un administrador por organización? (Recomendado: sí.)
3. ¿Se permite que un empleado pertenezca a varias organizaciones? (Recomendado: sí.)
4. ¿Qué datos fiscales son obligatorios en el MVP?
5. ¿Se permite personalizar el slug?
6. ¿Qué ocurre con los expedientes al cancelar una organización?
