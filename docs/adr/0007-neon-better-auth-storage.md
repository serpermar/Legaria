# ADR 0007 — Neon + Better Auth + Neon Object Storage

- **Estado**: Aceptado
- **Fecha**: 2026-11-06
- **Decisores**: Arquitecto de software, desarrollador Full Stack senior
- **Sustituye parcialmente**: las referencias de proveedor de [ADR 0004 — Sesión con cookies](./0004-sesion-cookies.md), [ADR 0005 — Almacenamiento privado](./0005-almacenamiento-privado.md) y [ADR 0006 — RLS y aislamiento backend](./0006-rls-y-aislamiento-backend.md). Las decisiones de sesión BFF, almacenamiento privado y aislamiento en tres capas se mantienen; cambia el proveedor que las implementa.

## Contexto

El plan gratuito de Supabase permite **2 proyectos activos por organización**. La cuenta de desarrollo de Legaria ya tiene 2 proyectos, por lo que no se puede crear un tercer entorno (por ejemplo, `legaria-dev`) sin pausar uno de los existentes. Pausar proyectos es una solución temporal, no una base para el MVP.

Además, el proyecto necesita tres piezas en el plan gratuito:

1. PostgreSQL gestionado con Prisma.
2. Autenticación con email/contraseña, sesiones y recuperación.
3. Almacenamiento privado de documentos y multimedia.

## Alternativas evaluadas (planes gratuitos, noviembre de 2026)

| Proveedor | PostgreSQL | Auth | Storage | Límites relevantes | Encaje |
|---|---|---|---|---|---|
| **Supabase Free** | Sí | Sí | Sí | 2 proyectos activos, 500 MB DB, 1 GB storage, pausa tras 1 semana | Bloqueado por el límite de 2 proyectos |
| **Neon Free** | Sí | Better Auth gestionada o autoalojada | Sí, S3-compatible | 100 proyectos, 1 GB Postgres/proyecto + 20 GB por cuenta, 5 GB storage/proyecto, 100 CU-horas/proyecto, scale-to-zero, región Frankfurt | **Elegido** |
| **Nhost Starter** | Sí | Sí | Sí | 1 proyecto activo, 1 GB DB, 1 GB storage, 5 GB egress | Válido, pero solo 1 proyecto y menos margen |
| **Xano Free** | Propietaria | Sí | Sí (con marca de agua) | 100k registros, 1 GB DB, solo US, 10 req/20 s | No es PostgreSQL ni encaja con Prisma |
| **Appwrite Cloud Free** | No (base documental; Postgres aparte) | Sí | Sí | Proyecto único, cuotas de ejecución | No es drop-in para el modelo relacional actual |
| **Firebase** | No | Sí | Sí | Firestore/Storage | No es PostgreSQL ni encaja con Prisma |

### Por qué Neon

- Es PostgreSQL estándar: Prisma, migraciones SQL y RLS siguen siendo válidos.
- 100 proyectos gratuitos eliminan el bloqueo que motivó este ADR.
- Región **AWS Europe (Frankfurt)** disponible en Free, lo que mejora el encaje RGPD frente al free tier de Supabase en US.
- Object Storage compatible con S3 evita introducir otro proveedor para archivos.
- Scale-to-zero reduce el consumo, aunque añade latencia de arranque en el primer acceso.

### Por qué Better Auth autoalojado y no Managed Better Auth

Neon ofrece **Managed Better Auth**, pero su SDK gestionado está orientado a Next.js y a un flujo de sesión propio. La API de Legaria es Express y ya sigue el patrón BFF con cookies `httpOnly` (ADR 0004). Better Auth autoalojado:

- Se integra con Express mediante `toNodeHandler` y `fromNodeHeaders`.
- Usa el mismo Prisma Client y la misma base de datos Neon.
- Permite conservar la autorización por contexto y el filtrado multi-tenant en la API.
- Evita acoplar la sesión al SDK de un framework que no se usa.

## Decisión

Adoptamos esta combinación para desarrollo y MVP:

| Capa | Proveedor / tecnología |
|---|---|
| Base de datos | **Neon Free** (PostgreSQL, región `eu-central-1`) |
| ORM | **Prisma 5** con `DATABASE_URL` pooled y `DIRECT_URL` directa |
| Identidad | **Better Auth 1.7 autoalojado** en `apps/api` |
| Sesión | Cookie `httpOnly` gestionada por Better Auth + CORS con credenciales |
| Almacenamiento | **Neon Object Storage** (S3-compatible) con buckets privados y URLs firmadas |
| API | Render Free (sin cambios) |
| Web | Vercel Hobby (sin cambios) |
| RLS | Políticas en `infra/db/policies/` como defensa en profundidad |

### Modelo de identidad

Better Auth es la fuente de identidad. Sus tablas se mapean a modelos Prisma propios para no colisionar con el modelo de dominio `User`:

| Modelo Prisma | Tabla | Uso |
|---|---|---|
| `AuthUser` | `auth_user` | Credenciales, email verificado y perfil de identidad |
| `AuthSession` | `auth_session` | Sesiones y tokens |
| `AuthAccount` | `auth_account` | Proveedores y hash de contraseña |
| `AuthVerification` | `auth_verification` | Verificación de email y recuperación |

El modelo de dominio `User` conserva `authUserId` como referencia única al `AuthUser.id`. Los roles de negocio (`platformRole`, membresías de organización y familia) **nunca** se guardan en la sesión de Better Auth: se resuelven desde PostgreSQL en cada petición.

### Flujo de autenticación

```text
[Web] POST /api/auth/sign-in/email  (cookie httpOnly)
   ↓
[Better Auth] valida credenciales y crea sesión
   ↓
[Web] GET /api/v1/auth/me  (envía cookie)
   ↓
[authMiddleware] auth.api.getSession({ headers })
   ↓
[Prisma] User.findUnique({ authUserId: session.user.id })
   ↓
req.auth = { userId, authUserId, email, platformRole }
```

El handler de Better Auth se monta **antes** de `express.json()` porque consume el body sin procesar.

### Almacenamiento

Se usa un cliente S3 (`@aws-sdk/client-s3`) apuntando al endpoint de Neon Object Storage:

- Bucket privado por defecto (`S3_BUCKET=legaria-private`).
- URLs prefirmadas de subida y descarga con caducidad corta.
- `forcePathStyle: true`, tal como exige Neon.
- El bucket público de memoriales publicados se gestiona con una política explícita; nunca se hace público el bucket de documentos privados.

### RLS

Las políticas se mueven de `infra/supabase/policies/` a `infra/db/policies/`. Neon Data API expone el JWT en `request.jwt.claims`; `app.auth_user_id()` lee el claim `sub` y `app.domain_user_id()` lo traduce al usuario de dominio. Los roles de Neon son `authenticated` y `anonymous`.

RLS sigue siendo **defensa en profundidad**: la API usa Prisma con un rol privilegiado y debe seguir filtrando por `organizationId` en todas las consultas de tenant (ADR 0006).

## Consecuencias

### Positivas

- Se elimina el bloqueo de los 2 proyectos de Supabase.
- PostgreSQL estándar y Prisma siguen siendo la base del modelo.
- Región europea disponible en Free.
- Un solo proveedor para base de datos, auth autoalojada y storage.
- La API mantiene el control de autorización y sesión (patrón BFF).

### Negativas / riesgos

| Riesgo | Mitigación |
|---|---|
| Cold start por scale-to-zero | Aceptable en desarrollo; en producción, plan Launch o keep-alive |
| Límite de 1 GB por proyecto y 100 CU-horas | Monitorizar; migrar a plan de pago antes de producción real |
| Better Auth autoalojado exige mantener dependencias | Versión fijada y pruebas de auth en CI |
| Las contraseñas de Supabase no se pueden importar | Proyecto en desarrollo: recrear usuarios con el seed; en producción, flujo de reseteo |
| RLS depende de `request.jwt.claims` | La API no depende de RLS; se prueba el filtrado de aplicación |
| Object Storage requiere región soportada | Frankfurt (`eu-central-1`) está soportada |

## Criterios de aceptación

- [ ] `apps/api` arranca con Better Auth en `/api/auth/*` antes de `express.json()`.
- [ ] `GET /api/v1/auth/me` funciona con cookie de sesión y sin cabecera `Authorization`.
- [ ] El seed crea usuarios en Better Auth y los enlaza con `users.auth_user_id`.
- [ ] Prisma valida y genera con los modelos `AuthUser`, `AuthSession`, `AuthAccount` y `AuthVerification`.
- [ ] El frontend envía cookies (`withCredentials: true`).
- [ ] Las políticas RLS viven en `infra/db/policies/0001_rls.sql`.
- [ ] `docs/legal/politica-datos-fallecidos.md` refleja Neon (UE) y Neon Object Storage.

## Referencias

- [Neon — Pricing](https://neon.com/pricing)
- [Neon — Object Storage](https://neon.com/docs/storage/overview)
- [Neon — Data API: access control & security](https://neon.com/docs/data-api/access-control)
- [Better Auth — Express](https://www.better-auth.com/docs/integrations/express)
- [Better Auth — Prisma adapter](https://www.better-auth.com/docs/adapters/prisma)
- [ADR 0004 — Sesión con cookies](./0004-sesion-cookies.md)
- [ADR 0005 — Almacenamiento privado](./0005-almacenamiento-privado.md)
- [ADR 0006 — RLS y aislamiento backend](./0006-rls-y-aislamiento-backend.md)
