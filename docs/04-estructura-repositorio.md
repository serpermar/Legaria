# Estructura del repositorio — Legaria

**Estado:** Propuesta para validación  
**Enfoque:** Monorepo con pnpm workspaces

---

## 1. Decisión de estructura

Se propone un monorepo con:

- `apps/api`: backend Node.js + Express + TypeScript.
- `apps/web`: frontend React + Vite + TypeScript.
- `packages/contracts`: esquemas Zod, tipos y constantes compartidas.
- `packages/config`: configuración común de TypeScript, ESLint y Prettier (opcional al inicio).
- `docs` y `specs`: documentación y especificaciones.
- `infra`: políticas de Supabase, almacenamiento y Docker local.

Ventajas:

- Contratos compartidos sin publicar paquetes.
- Un solo PR para cambios de extremo a extremo.
- CI unificada.
- Versionado y tipos coherentes.
- Onboarding más sencillo para un proyecto de portfolio.

Alternativa descartada: repositorios separados por frontend y backend. Añade coordinación sin beneficio claro en esta escala.

---

## 2. Árbol propuesto

```text
legaria/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── security.yml
├── .editorconfig
├── .gitignore
├── .nvmrc
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── README.md
├── PRD.md
├── docs/
│   ├── 01-arquitectura.md
│   ├── 02-modelo-datos.md
│   ├── 03-seguridad-privacidad.md
│   ├── 04-estructura-repositorio.md
│   ├── 05-decisiones-pendientes.md
│   ├── 06-identidad-visual.md
│   └── adr/
│       ├── 0001-monorepo-pnpm.md
│       ├── 0002-monolito-modular.md
│       ├── 0003-multitenancy.md
│       ├── 0004-sesion-cookies.md
│       └── 0005-almacenamiento-privado.md
├── specs/
│   ├── README.md
│   ├── 00-convenciones.md
│   ├── 01-autenticacion-rbac.md
│   ├── 02-organizaciones-empleados.md
│   ├── 03-expedientes-servicios.md
│   ├── 04-familias-invitaciones.md
│   ├── 05-memoriales.md
│   ├── 06-ia.md
│   ├── 07-api.md
│   └── 08-roadmap-mvp.md
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── env.ts
│   │   │   │   ├── constants.ts
│   │   │   │   └── logger.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── authenticate.ts
│   │   │   │   ├── authorize.ts
│   │   │   │   ├── validate.ts
│   │   │   │   ├── rate-limit.ts
│   │   │   │   ├── request-id.ts
│   │   │   │   └── error-handler.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── organizations/
│   │   │   │   ├── employees/
│   │   │   │   ├── cases/
│   │   │   │   ├── deceased-persons/
│   │   │   │   ├── funeral-services/
│   │   │   │   ├── families/
│   │   │   │   ├── invitations/
│   │   │   │   ├── memorials/
│   │   │   │   ├── condolences/
│   │   │   │   ├── memories/
│   │   │   │   ├── media/
│   │   │   │   ├── ai/
│   │   │   │   ├── notifications/
│   │   │   │   ├── subscriptions/
│   │   │   │   ├── audit/
│   │   │   │   └── admin/
│   │   │   ├── shared/
│   │   │   │   ├── auth/
│   │   │   │   ├── authorization/
│   │   │   │   ├── db/
│   │   │   │   ├── errors/
│   │   │   │   ├── http/
│   │   │   │   ├── storage/
│   │   │   │   ├── email/
│   │   │   │   ├── ai/
│   │   │   │   └── utils/
│   │   │   ├── jobs/
│   │   │   │   ├── worker.ts
│   │   │   │   └── handlers/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   │   ├── integration/
│   │   │   ├── security/
│   │   │   └── fixtures/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── router/
│       │   │   ├── providers/
│       │   │   └── App.tsx
│       │   ├── layouts/
│       │   │   ├── PublicLayout/
│       │   │   ├── AuthLayout/
│       │   │   ├── FuneralHomeLayout/
│       │   │   ├── FamilyLayout/
│       │   │   └── AdminLayout/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── organizations/
│       │   │   ├── employees/
│       │   │   ├── cases/
│       │   │   ├── services/
│       │   │   ├── families/
│       │   │   ├── invitations/
│       │   │   ├── memorials/
│       │   │   ├── condolences/
│       │   │   ├── ai/
│       │   │   ├── admin/
│       │   │   └── settings/
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   ├── common/
│       │   │   └── feedback/
│       │   ├── hooks/
│       │   ├── services/
│       │   │   ├── api/
│       │   │   └── queries/
│       │   ├── lib/
│       │   ├── styles/
│       │   ├── types/
│       │   └── main.tsx
│       ├── e2e/
│       ├── public/
│       ├── index.html
│       ├── package.json
│       ├── tailwind.config.ts
│       ├── vite.config.ts
│       └── tsconfig.json
├── packages/
│   ├── contracts/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── organizations/
│   │   │   ├── cases/
│   │   │   ├── families/
│   │   │   ├── memorials/
│   │   │   ├── ai/
│   │   │   ├── common/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── config/
│       ├── eslint/
│       └── typescript/
├── infra/
│   ├── supabase/
│   │   ├── policies/
│   │   └── storage.sql
│   └── docker-compose.yml
└── scripts/
    ├── generate-openapi.ts
    └── seed-demo.ts
```

---

## 3. Backend

### 3.1. Estructura de un módulo

```text
modules/cases/
├── cases.routes.ts
├── cases.controller.ts
├── cases.service.ts
├── cases.repository.ts
├── cases.mapper.ts
├── cases.types.ts
└── cases.test.ts
```

Responsabilidades:

| Archivo | Responsabilidad |
|---|---|
| `routes` | Declara endpoints, middlewares y contratos. |
| `controller` | Traduce HTTP a llamadas al servicio; sin reglas de negocio. |
| `service` | Reglas, autorización de recurso, transacciones y auditoría. |
| `repository` | Prisma acotado por tenant; sin lógica de negocio. |
| `mapper` | Entidad → DTO; evita exponer campos internos. |
| `types` | Tipos internos del módulo. |
| `test` | Pruebas unitarias y de integración del módulo. |

### 3.2. Reglas

- Un módulo no importa archivos internos de otro módulo; usa su servicio público o `shared`.
- Las dependencias circulares están prohibidas.
- Los repositorios reciben `organizationId` o un `scope` explícito.
- Los controladores no acceden a Prisma.
- Los servicios no acceden a `req`/`res`.
- Los errores de dominio se lanzan como clases tipadas.
- La auditoría se registra en el servicio.

### 3.3. Middlewares

Orden recomendado:

1. `requestId`
2. `logger`
3. `helmet`
4. `cors`
5. `rateLimit`
6. `express.json({ limit })`
7. `authenticate`
8. `resolveActor`
9. `validate`
10. `authorize`
11. ruta
12. `notFound`
13. `errorHandler`

### 3.4. Contratos

`packages/contracts` contiene:

- Esquemas Zod de entrada y salida.
- Tipos inferidos.
- Enums compartidos.
- Constantes de permisos.
- Códigos de error.
- Esquemas de paginación.

El frontend importa los tipos; nunca importa código de servidor.

---

## 4. Frontend

### 4.1. Organización por funcionalidad

```text
modules/cases/
├── pages/
│   ├── CaseListPage.tsx
│   ├── CaseDetailPage.tsx
│   └── CaseCreatePage.tsx
├── components/
│   ├── CaseTable.tsx
│   ├── CaseForm.tsx
│   └── CaseStatusBadge.tsx
├── hooks/
│   ├── useCases.ts
│   └── useCase.ts
├── api/
│   └── cases.api.ts
├── schemas/
│   └── case.schema.ts
└── types.ts
```

Reglas:

- Componentes reutilizables en `components/ui`.
- Componentes específicos dentro de cada módulo.
- Sin lógica de negocio en componentes de presentación.
- TanStack Query para estado del servidor.
- React Hook Form + Zod para formularios.
- Rutas con `lazy` y límites de error.
- `queryKey` centralizados.
- Invalidación explícita tras mutaciones.

### 4.2. Layouts

| Layout | Uso |
|---|---|
| `PublicLayout` | Home, memoriales públicos, información legal. |
| `AuthLayout` | Login, registro, recuperación, canje de invitación. |
| `FuneralHomeLayout` | Panel profesional. |
| `FamilyLayout` | Portal familiar. |
| `AdminLayout` | Administración global. |

Cada layout tiene su navegación, sus permisos visuales y su estética.

### 4.3. Rutas propuestas

```text
/                                  Público
/memorial/:slug                    Memorial público
/login                             Auth
/recuperar                         Auth
/invitacion/:token                 Auth
/app                               Redirección según rol
/app/expedientes                   Funeraria
/app/expedientes/:id               Funeraria
/app/familias                      Funeraria
/app/memoriales                    Funeraria
/app/empleados                     Funeraria
/app/ajustes                       Funeraria
/familia                           Familiar
/familia/:caseId                   Familiar
/familia/memorial                  Familiar
/admin                             Super Admin
/admin/organizaciones              Super Admin
/admin/usuarios                    Super Admin
/admin/auditoria                   Super Admin
```

### 4.4. Estado

- **Servidor:** TanStack Query.
- **Sesión:** contexto de autenticación + endpoint `/me`.
- **Organización activa:** contexto + persistencia en URL o almacenamiento seguro.
- **Formularios:** React Hook Form.
- **UI local:** estado de componente; evitar stores globales innecesarios.

---

## 5. Convenciones de nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Tablas DB | snake_case | `deceased_persons` |
| Modelos Prisma | PascalCase | `DeceasedPerson` |
| Archivos backend | kebab-case | `cases.service.ts` |
| Componentes React | PascalCase | `CaseDetailPage.tsx` |
| Hooks | camelCase con `use` | `useCase.ts` |
| Funciones | camelCase | `createCase` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_UPLOAD_BYTES` |
| JSON API | camelCase | `organizationId` |
| Variables de entorno | SCREAMING_SNAKE_CASE | `DATABASE_URL` |
| Rutas | kebab-case | `/organizations/:id/cases` |

---

## 6. Scripts previstos

```json
{
  "dev": "pnpm --parallel dev",
  "build": "pnpm -r build",
  "lint": "pnpm -r lint",
  "typecheck": "pnpm -r typecheck",
  "test": "pnpm -r test",
  "test:e2e": "pnpm --filter web test:e2e",
  "db:migrate": "pnpm --filter api db:migrate",
  "db:seed": "pnpm --filter api db:seed",
  "openapi": "pnpm --filter api openapi"
}
```

---

## 7. Variables de entorno

### API

```text
NODE_ENV
PORT
DATABASE_URL
DIRECT_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
SESSION_SECRET
CSRF_SECRET
OPENAI_API_KEY
EMAIL_API_KEY
SENTRY_DSN
APP_URL
API_URL
```

### Web

```text
VITE_API_URL
VITE_APP_URL
VITE_SENTRY_DSN
```

Reglas:

- `.env.example` documenta las variables sin valores reales.
- `.env` nunca se versiona.
- Secretos de servidor nunca llevan prefijo `VITE_`.
- La `service_role` solo existe en el backend.

---

## 8. CI/CD

Pipeline mínimo:

1. Instalar dependencias con lockfile.
2. Lint.
3. Typecheck.
4. Tests unitarios.
5. Tests de integración con PostgreSQL.
6. Build de API y web.
7. Validación de migraciones Prisma.
8. Auditoría de dependencias.
9. Generación y diff de OpenAPI.
10. Despliegue a staging tras merge en `main`.
11. Despliegue a producción con aprobación manual.

---

## 9. Qué no incluir en la primera versión

- Microservicios.
- Kubernetes.
- Event sourcing.
- GraphQL.
- Aplicación móvil.
- Redis si `pg-boss` es suficiente.
- Sistema de plugins.
- Multi-región.
- Feature flags complejos.
