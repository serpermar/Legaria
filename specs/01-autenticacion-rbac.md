# Spec 01 — Autenticación, RBAC y multi-tenancy

**Estado:** Borrador  
**Fase:** 1  
**Depende de:** Spec 00

---

## 1. Objetivo

Definir cómo se autentican los usuarios, cómo se gestionan las sesiones y cómo se autoriza cada operación según rol, organización, expediente, grupo familiar y recurso.

---

## 2. Alcance

Incluye:

- Login, refresh, logout y recuperación de contraseña.
- Verificación de email.
- MFA para administradores.
- Resolución de identidad y memberships.
- Catálogo de permisos y matriz por rol.
- Reglas de contexto y aislamiento multi-tenant.
- Acceso de soporte del Super Admin.
- Errores, auditoría y pruebas.

No incluye:

- Registro público de funerarias.
- Pagos.
- Gestión de identidades federadas (SSO) en el MVP.

---

## 3. Modelo de identidad

- **Better Auth** almacena credenciales, emails verificados y factores MFA.
- La tabla `users` almacena el perfil y referencia `auth_user_id`.
- Los roles de negocio **no** se guardan en la sesión de Better Auth.
- En cada petición, la API resuelve el actor desde PostgreSQL.
- Un usuario puede tener varias memberships de organización y de familia.

```ts
type ActorContext = {
  userId: string;
  authUserId: string;
  platformRoles: Array<"SUPER_ADMIN">;
  organizationMemberships: Array<{
    organizationId: string;
    role: "FUNERAL_ADMIN" | "FUNERAL_EMPLOYEE";
    status: "ACTIVE";
  }>;
  familyMemberships: Array<{
    familyGroupId: string;
    caseId: string;
    role: "FAMILY_ADMIN" | "FAMILY_MEMBER";
    status: "ACTIVE";
  }>;
};
```

---

## 4. Flujos

### 4.1. Login

```text
POST /api/auth/sign-in/email
{ "email": "...", "password": "..." }
```

1. Validar formato.
2. Aplicar rate limit por IP y por email.
3. Autenticar con Better Auth.
4. Si el email no está verificado, devolver `EMAIL_NOT_VERIFIED`.
5. Si la cuenta está suspendida, devolver error genérico.
6. Better Auth crea la sesión y establece la cookie `httpOnly`.
7. Devolver perfil, memberships y organización activa sugerida.
8. Auditar el acceso.

Respuesta:

```json
{
  "user": {
    "id": "uuid",
    "email": "ana@example.com",
    "fullName": "Ana García",
    "locale": "es-ES"
  },
  "organizations": [
    { "id": "uuid", "name": "Funeraria Ejemplo", "role": "FUNERAL_ADMIN" }
  ],
  "familyGroups": [
    { "id": "uuid", "caseId": "uuid", "role": "FAMILY_ADMIN" }
  ]
}
```

Errores:

- Credenciales inválidas: 401 genérico.
- Email no verificado: 403 con código específico.
- Demasiados intentos: 429.
- Cuenta suspendida: 403 genérico.

### 4.2. Refresh

```text
POST /api/v1/auth/refresh
```

- Requiere cookie de refresh y token CSRF.
- Rota el refresh token.
- Detecta reutilización de un refresh ya rotado y revoca la familia de sesiones.
- Devuelve nueva cookie de acceso.
- No devuelve tokens en el cuerpo.

### 4.3. Logout

```text
POST /api/v1/auth/logout
```

- Revoca la sesión actual.
- Elimina cookies.
- Audita.

```text
POST /api/v1/auth/logout-all
```

- Revoca todas las sesiones del usuario.
- Requiere reautenticación reciente.

### 4.4. Recuperación de contraseña

```text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

- Respuesta genérica exista o no el email.
- Token de un solo uso con caducidad.
- No revelar el token en logs.
- Invalidar sesiones tras el cambio.

### 4.5. Verificación de email

- Better Auth envía el email de verificación.
- La API comprueba `auth_user.email_verified`.
- Sin verificación no se accede a datos sensibles.

### 4.6. MFA

- TOTP mediante el plugin `two-factor` de Better Auth.
- Obligatoria para `SUPER_ADMIN` y `FUNERAL_ADMIN`.
- Configuración en el primer acceso o en ajustes.
- Códigos de recuperación.
- Verificación adicional para acciones sensibles.

### 4.7. Reautenticación

Acciones que requieren autenticación reciente (< 15 minutos):

- Publicar o despublicar un memorial.
- Descargar documentación sensible.
- Cambiar roles o eliminar miembros.
- Crear o revocar accesos de soporte.
- Cambiar el email o la contraseña.
- Exportar datos.

Si la autenticación es antigua, devolver `REAUTH_REQUIRED` (403) y permitir completar el flujo.

### 4.8. Canje de invitación

```text
POST /api/v1/invitations/redeem
{ "token": "...", "fullName": "...", "password": "..." }
```

Reglas:

- El token se recibe por HTTPS y no se registra.
- Se busca por hash.
- Se valida estado, caducidad, usos y email.
- Si el usuario existe, se vincula tras verificar identidad.
- Si no existe, se crea en Better Auth y en `users`.
- Se crea la membership correspondiente.
- Se marca la invitación como aceptada.
- Se audita.

Detalle en [04-familias-invitaciones.md](./04-familias-invitaciones.md).

---

## 5. Sesión

### Cookies propuestas

| Cookie | Contenido | Atributos |
|---|---|---|
| `legaria_at` | Access token | `httpOnly`, `Secure`, `SameSite=Lax`, `Path=/` |
| `legaria_rt` | Refresh token | `httpOnly`, `Secure`, `SameSite=Lax`, `Path=/api/v1/auth` |
| `legaria_csrf` | Token CSRF | No `httpOnly`, `Secure`, `SameSite=Lax` |

- El frontend envía `X-CSRF-Token` en métodos mutables.
- La API compara con el token de la cookie o con el valor firmado.
- El access token dura 10–15 minutos.
- El refresh rota en cada uso.
- La sesión absoluta máxima se define en configuración.
- El logout elimina ambas cookies.

---

## 6. Catálogo de permisos

```text
organization:read
organization:update
organization:manage_members
organization:read_audit
organization:manage_subscription

case:read
case:create
case:update
case:close
case:archive
deceased:read
deceased:update
service:read
service:manage
assignment:manage

document:read
document:upload
document:delete

family:read
family:manage
invitation:create
invitation:revoke

memorial:read
memorial:create
memorial:update
memorial:submit
memorial:review
memorial:publish
memorial:moderate

condolence:create
condolence:read
condolence:moderate

memory:create
memory:moderate

ai:generate
ai:review

admin:access
admin:manage_organizations
admin:manage_users
admin:read_audit
admin:read_metrics
support:access
```

---

## 7. Matriz de permisos

Leyenda: **✓** permitido, **ctx** solo con contexto válido, **—** denegado.

| Permiso | SUPER_ADMIN | FUNERAL_ADMIN | FUNERAL_EMPLOYEE | FAMILY_ADMIN | FAMILY_MEMBER | VISITOR |
|---|---|---|---|---|---|---|
| `organization:read` | ✓ | ✓ | ✓ | — | — | — |
| `organization:update` | — | ✓ | — | — | — | — |
| `organization:manage_members` | — | ✓ | — | — | — | — |
| `organization:read_audit` | ✓ | ✓ | — | — | — | — |
| `organization:manage_subscription` | ✓ | ✓ | — | — | — | — |
| `case:read` | — | ✓ | ctx | — | — | — |
| `case:create` | — | ✓ | ✓ | — | — | — |
| `case:update` | — | ✓ | ctx | — | — | — |
| `case:close` | — | ✓ | — | — | — | — |
| `case:archive` | — | ✓ | — | — | — | — |
| `deceased:read` | — | ✓ | ctx | ctx | ctx | — |
| `deceased:update` | — | ✓ | ctx | — | — | — |
| `service:read` | — | ✓ | ctx | ctx | ctx | — |
| `service:manage` | — | ✓ | ctx | — | — | — |
| `assignment:manage` | — | ✓ | — | — | — | — |
| `document:read` | — | ✓ | ctx | ctx | ctx | — |
| `document:upload` | — | ✓ | ctx | — | — | — |
| `document:delete` | — | ✓ | ctx | — | — | — |
| `family:read` | — | ✓ | ctx | ctx | ctx | — |
| `family:manage` | — | ✓ | — | ctx | — | — |
| `invitation:create` | — | ✓ | ctx | ctx | — | — |
| `invitation:revoke` | — | ✓ | — | ctx | — | — |
| `memorial:read` | — | ✓ | ctx | ctx | ctx | ctx |
| `memorial:create` | — | ✓ | ctx | ctx | — | — |
| `memorial:update` | — | ✓ | ctx | ctx | ctx | — |
| `memorial:submit` | — | ✓ | — | ctx | — | — |
| `memorial:review` | — | ✓ | — | — | — | — |
| `memorial:publish` | — | ✓ | — | — | — | — |
| `memorial:moderate` | — | ✓ | ctx | ctx | — | — |
| `condolence:create` | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| `condolence:read` | — | ✓ | ctx | ctx | ctx | ✓ |
| `condolence:moderate` | — | ✓ | ctx | ctx | — | — |
| `memory:create` | — | ✓ | ctx | ctx | ctx | — |
| `memory:moderate` | — | ✓ | ctx | ctx | — | — |
| `ai:generate` | — | ✓ | ctx | ctx | — | — |
| `ai:review` | — | ✓ | ctx | ctx | — | — |
| `admin:access` | ✓ | — | — | — | — | — |
| `admin:manage_organizations` | ✓ | — | — | — | — | — |
| `admin:manage_users` | ✓ | — | — | — | — | — |
| `admin:read_audit` | ✓ | — | — | — | — | — |
| `admin:read_metrics` | ✓ | — | — | — | — | — |
| `support:access` | ctx | — | — | — | — | — |

### Notas

- `SUPER_ADMIN` no tiene permisos de contenido por defecto. `support:access` exige una concesión temporal, motivo y auditoría.
- `FUNERAL_EMPLOYEE` solo accede a expedientes asignados y a los recursos derivados.
- `FAMILY_ADMIN` y `FAMILY_MEMBER` solo acceden a su grupo familiar y a los recursos visibles.
- `VISITOR` solo accede a memoriales publicados con visibilidad pública.
- `memorial:review` y `memorial:publish` son exclusivos de `FUNERAL_ADMIN` (o del sistema con autorización registrada).
- `ai:generate` depende del plan y de la fase 6.

---

## 8. Reglas de contexto

### 8.1. Organización

- La ruta incluye `organizationId`.
- El actor debe tener membership `ACTIVE` en esa organización.
- La organización debe estar `ACTIVE`.
- Si no, 404 o 403 según el caso.
- No se acepta `organizationId` del cuerpo para decidir el tenant.

### 8.2. Expediente

- `FUNERAL_ADMIN`: todos los expedientes de su organización.
- `FUNERAL_EMPLOYEE`: solo expedientes con asignación activa.
- `FAMILY_ADMIN` y `FAMILY_MEMBER`: solo el expediente de su grupo familiar.
- El acceso familiar se limita a campos y documentos autorizados.

### 8.3. Documento

- Empleado: documentos de expedientes asignados.
- Familia: solo documentos con `access_level = FAMILY`.
- Descarga mediante URL firmada tras comprobar el permiso.
- Cada descarga sensible se audita.

### 8.4. Memorial

- Staff: memorial del expediente al que tiene acceso.
- Familia: memorial de su grupo familiar.
- Público: solo `PUBLISHED` + `PUBLIC`.
- Privado/restringido: solo miembros o usuarios autorizados.
- El estado y la visibilidad se comprueban en cada petición.

### 8.5. Condolencias

- Cualquiera puede crear en memorial público.
- La condolencia nace `PENDING`.
- Solo usuarios con `condolence:moderate` la aprueban, ocultan o rechazan.
- La familia puede moderar su memorial.
- El staff puede moderar memoriales de su organización.

### 8.6. IA

- Requiere `ai:generate`.
- Requiere memorial o expediente accesible.
- Requiere plan con IA.
- Requiere cuota disponible.
- El resultado es un borrador, nunca publicación.

### 8.7. Super Admin

- Puede administrar organizaciones y usuarios.
- No puede leer contenido sensible sin `support_access_grant`.
- La concesión exige motivo, ámbito y caducidad.
- Toda lectura sensible se audita.
- La concesión se revoca al terminar.

---

## 9. Endpoints

| Método | Ruta | Auth | Permiso | Descripción |
|---|---|---|---|---|
| POST | `/auth/login` | No | — | Iniciar sesión. |
| POST | `/auth/refresh` | Cookie | — | Renovar sesión. |
| POST | `/auth/logout` | Sí | — | Cerrar sesión. |
| POST | `/auth/logout-all` | Sí | — | Cerrar todas las sesiones. |
| POST | `/auth/forgot-password` | No | — | Solicitar recuperación. |
| POST | `/auth/reset-password` | No | — | Restablecer contraseña. |
| POST | `/auth/mfa/enroll` | Sí | — | Configurar MFA. |
| POST | `/auth/mfa/verify` | Sí | — | Verificar MFA. |
| POST | `/invitations/redeem` | No | — | Canjear invitación. |
| GET | `/me` | Sí | — | Perfil y memberships. |
| PATCH | `/me` | Sí | — | Editar perfil. |
| GET | `/me/organizations` | Sí | — | Organizaciones del usuario. |
| GET | `/me/family-groups` | Sí | — | Grupos familiares. |
| POST | `/auth/step-up` | Sí | — | Reautenticación reciente. |

---

## 10. Validaciones

- Email válido y normalizado.
- Contraseña con longitud mínima y sin truncado.
- Token de invitación con longitud y formato esperados.
- No aceptar `role` desde el cliente en operaciones que no lo permitan.
- No aceptar `organizationId` del cuerpo para resolver tenant.
- `fullName` con longitud y caracteres razonables.
- Códigos MFA de 6 dígitos.

---

## 11. Errores específicos

| Código | HTTP | Descripción |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos. |
| `EMAIL_NOT_VERIFIED` | 403 | Email pendiente de verificación. |
| `ACCOUNT_SUSPENDED` | 403 | Cuenta suspendida. |
| `MFA_REQUIRED` | 403 | Se requiere segundo factor. |
| `REAUTH_REQUIRED` | 403 | Acción sensible con sesión antigua. |
| `INVITATION_INVALID` | 404 | Token inexistente. |
| `INVITATION_EXPIRED` | 410 | Token caducado. |
| `INVITATION_USED` | 409 | Token ya utilizado. |
| `INVITATION_EMAIL_MISMATCH` | 403 | El email no coincide. |
| `ORGANIZATION_ACCESS_DENIED` | 404 | Sin membership o inexistente. |
| `CASE_ACCESS_DENIED` | 404 | Sin acceso al expediente. |
| `SUPPORT_ACCESS_REQUIRED` | 403 | Super Admin sin acceso de soporte. |

---

## 12. Auditoría

Eventos:

- `auth.login.succeeded`
- `auth.login.failed`
- `auth.logout`
- `auth.refresh.reused`
- `auth.password.reset`
- `auth.mfa.enabled`
- `auth.mfa.disabled`
- `invitation.redeemed`
- `organization.member.added`
- `organization.member.role_changed`
- `organization.member.removed`
- `support.access.granted`
- `support.access.used`
- `support.access.revoked`

---

## 13. Casos límite

1. Usuario con varias organizaciones: debe elegir contexto; no se mezclan datos.
2. Usuario con membership suspendida: acceso inmediato denegado.
3. Cambio de rol mientras hay sesión activa: el permiso se recalcula en la siguiente petición.
4. Invitación para un email que ya tiene cuenta: se vincula, no se duplica.
5. Invitación para un email distinto al de la cuenta: se rechaza.
6. Token reutilizado: se rechaza y se alerta.
7. Refresh token reutilizado: se revoca la familia de sesiones.
8. Super Admin sin concesión: no ve contenido.
9. Organización suspendida: no permite operaciones.
10. Sesión antigua en acción sensible: se exige reautenticación.

---

## 14. Criterios de aceptación

- [ ] Login, refresh, logout y recuperación funcionan con pruebas.
- [ ] Las cookies son `httpOnly` y seguras.
- [ ] CSRF está protegido en métodos mutables.
- [ ] Los roles se resuelven desde base de datos, no desde el JWT.
- [ ] Un usuario de la organización A no accede a la B.
- [ ] Un empleado no accede a expedientes no asignados.
- [ ] Un familiar no accede a otro grupo familiar.
- [ ] El Super Admin no accede a contenido sin concesión.
- [ ] Las acciones sensibles requieren reautenticación.
- [ ] Los eventos de auditoría se registran.
- [ ] Los errores no revelan información sensible.

---

## 15. Preguntas abiertas

1. Duración exacta de access y refresh tokens.
2. ¿MFA obligatoria también para empleados con acceso a documentos?
3. ¿Se permite SSO para Enterprise?
4. ¿Qué ocurre con una invitación si el usuario ya pertenece al grupo?
5. ¿Se permite cambiar el email de la cuenta sin soporte?
6. ¿Se notifica al usuario cuando se revocan sus sesiones?
