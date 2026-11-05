# ADR 0006 — RLS y aislamiento multi-tenant en backend

- **Estado**: Aceptado
- **Fecha**: 2026-11-05
- **Decisores**: Arquitecto de software, desarrollador Full Stack senior
- **Relacionado**: [ADR 0003 — Multitenancy](./0003-multitenancy.md), [ADR 0004 — Sesión con cookies](./0004-sesion-cookies.md)

## Contexto

Este ADR **complementa** el ADR 0003. Mientras que 0003 fija el modelo de multi-tenancy (qué es un tenant, cómo se relaciona con `Organization`), este 0006 concreta **cómo se aplica** esa decisión:

1. **RLS** en Supabase como defensa en profundidad.
2. **Filtrado obligatorio en backend** mediante middleware de tenant y repositorios acotados.
3. **Pruebas de aislamiento cross-tenant** que fallan si un servicio omite el `organizationId`.

El modelo de datos del ADR 0003 ya incluye `organization_id` en las tablas raíz de tenant. Este ADR concreta el resto de capas.

## Decisión

Adoptamos un modelo de **multi-tenancy en tres capas**, no excluyentes:

### Capa 1 — Aislamiento estructural (ya definido en ADR 0003)

`organization_id` en las tablas raíz de tenant:

| Tabla raíz | Justificación |
|---|---|
| `organizations` | Raíz absoluta. |
| `organization_members` | Pertenencia a organización. |
| `cases` | Raíz de expediente. |
| `family_groups` | Raíz de grupo familiar. |
| `memorials` | Raíz de memorial. |
| `invitations` | Raíz de invitación. |
| `rooms` | Recurso propio. |
| `subscriptions` | 1:1 con organización. |
| `support_access_grants` | Concesión temporal. |

Las tablas hoja (`deceased_persons`, `funeral_services`, `ceremonies`, `documents`, `memorial_media`, `memories`, `condolences`, `timeline_events`, `publication_authorizations`, `memorial_access_grants`, `content_requests`, `case_assignments`, `ai_generations`, `audit_logs`) heredan el tenant a través de su padre.

### Capa 2 — Autorización de aplicación (backend)

El backend **nunca** confía en el `organizationId` que envía el cliente. Lo resuelve así:

[Request llega con JWT de Supabase]
↓
[authMiddleware]

Verifica JWT con Supabase

Resuelve user = User.findUnique({ authUserId })

Adjunta req.auth = { user, supabaseUserId }
↓
[tenantMiddleware]

Extrae organizationId del path (/organizations/:organizationId/...)
o del recurso solicitado (/cases/:caseId → case.organizationId)

Verifica OrganizationMember.exists({ userId, organizationId, status: ACTIVE })

Verifica que Organization.status === ACTIVE

Adjunta req.tenant = { organizationId, role }
↓
[authorize('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE')]

Verifica que req.tenant.role está en la lista permitida
↓
[service]

TODAS las queries Prisma incluyen where: { organizationId: req.tenant.organizationId }

text

**Regla inviolable**: ningún `repository` ni `service` puede ejecutar una consulta sobre una tabla raíz de tenant sin `organizationId` en el `where`. Se refuerza con una **prueba de integración** que recorre todos los servicios del módulo y falla si detecta una query sin filtro de tenant.

### Capa 3 — Defensa en profundidad (RLS en Supabase)

Activamos **Row Level Security** en todas las tablas raíz de tenant. Las políticas se definen en `infra/supabase/policies/*.sql`.

**Importante**: como el backend usa `service_role` (que **bypassa RLS**), RLS protege:

- Cualquier acceso directo desde el frontend a Supabase.
- Cualquier acceso accidental con `anon` key.
- El dashboard de Supabase y sus integraciones (MCP server oficial).
- Cualquier lectura pública de memoriales.

**No sustituye al filtrado del backend**: lo complementa.

## Modelo de políticas RLS

Las políticas usan funciones `SECURITY DEFINER STABLE` para evitar subconsultas repetidas:

```sql
-- Helper: ID del usuario de dominio a partir del JWT de Supabase
CREATE OR REPLACE FUNCTION auth.domain_user_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Helper: organizaciones activas del usuario
CREATE OR REPLACE FUNCTION auth.user_org_ids() RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT organization_id FROM public.organization_members
  WHERE user_id = auth.domain_user_id() AND status = 'ACTIVE';
$$;

-- Helper: rol del usuario en una organización
CREATE OR REPLACE FUNCTION auth.user_org_role(org uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role::text FROM public.organization_members
  WHERE user_id = auth.domain_user_id()
    AND organization_id = org
    AND status = 'ACTIVE'
  LIMIT 1;
$$;

-- Helper: grupos familiares activos del usuario
CREATE OR REPLACE FUNCTION auth.user_family_group_ids() RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT family_group_id FROM public.family_members
  WHERE user_id = auth.domain_user_id() AND status = 'ACTIVE';
$$;

-- Helper: ¿es Super Admin?
CREATE OR REPLACE FUNCTION auth.is_super_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.domain_user_id() AND platform_role = 'SUPER_ADMIN'
  );
$$;
Matriz de visibilidad (resumen)
Tabla raíz	SUPER_ADMIN	FUNERAL_ADMIN	FUNERAL_EMPLOYEE	FAMILY_ADMIN	FAMILY_MEMBER	VISITOR (anon)
organizations	ALL	SELECT/UPDATE (su org)	SELECT (su org)	—	—	—
cases	ALL	ALL (su org)	ALL (su org)	SELECT (su expediente)	SELECT (su expediente)	—
family_groups	ALL	ALL (su org)	ALL (su org)	ALL (su grupo)	SELECT (su grupo)	—
invitations	ALL	ALL (su org)	ALL (su org)	CREATE/SELECT/REVOKE (su grupo)	—	—
memorials (privado)	ALL	ALL (su org)	ALL (su org)	ALL (su memorial)	SELECT (su memorial)	—
memorials (público)	ALL	—	—	—	—	SELECT (solo visibility=PUBLIC y status=PUBLISHED)
condolences	ALL	—	—	ALL (su memorial)	INSERT/SELECT (su memorial)	INSERT (memorial público)
Las políticas completas están en infra/supabase/policies/ (ver § Referencias).

Consecuencias
Positivas
Defensa en tres capas (modelo + aplicación + RLS).

El backend es la fuente de verdad (los permisos no dependen del frontend).

Las políticas RLS son cortas, testeables y reutilizables.

El servidor MCP oficial de Supabase (read-only) puede operar con anon key sin exponer datos de otras organizaciones.

Negativas / costes
Las subconsultas RLS añaden latencia en tablas grandes. Mitigación: índices + funciones SECURITY DEFINER STABLE.

El backend con service_role bypassa RLS: la seguridad depende de la disciplina de aplicar organizationId. Mitigación: test de integración que falla si falta el filtro.

auth.uid() devuelve el UUID de auth.users, no el de public.users. Por eso el helper domain_user_id().

Riesgos identificados
Riesgo	Mitigación
Query de Prisma sin organizationId	Test de integración + revisión de PR
service_role filtrado al frontend	Variables de entorno separadas; CI que escanea el bundle
Política RLS demasiado permisiva	Tests SQL con supabase test db
Función SECURITY DEFINER mal escrita	Revisión de PR + tests
Cross-tenant en FamilyGroup (un familiar de dos expedientes)	El modelo permite múltiples FamilyMember; RLS usa IN sobre user_family_group_ids()
Alternativas descartadas
Filtrado solo en backend (sin RLS): descartado. El prompt exige aislamiento multi-tenant y defensa en profundidad.

RLS solo, sin filtrado en backend: descartado. service_role bypassa RLS.

Schema por tenant: descartado para MVP (ADR 0003).

Criterios de aceptación
□ RLS activo en todas las tablas raíz de tenant.
□ Helpers auth.domain_user_id, auth.user_org_ids, auth.user_org_role, auth.user_family_group_ids, auth.is_super_admin creados.
□ Test SQL que verifica que anon no lee cases de otra organización.
□ Test SQL que verifica que un FAMILY_MEMBER no lee invitations.
□ Test de integración backend que falla si un servicio de tenant no incluye organizationId en el where.
□ docs/legal/politica-datos-fallecidos.md § 8 documenta la región US en free tier.
Referencias
ADR 0003 — Multitenancy

ADR 0004 — Sesión con cookies

ADR 0005 — Almacenamiento privado

infra/supabase/policies/0001_rls.sql

apps/api/tests/security/tenant-isolation.test.ts

Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security