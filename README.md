# Legaria

Plataforma digital funeraria y de memoriales para conectar funerarias, familias y particulares.

> **Estado actual: Fase 0 — análisis, producto y arquitectura.**
> Todavía no hay código de aplicación. La documentación está validada en un 76 %
> (19 de 25 decisiones cerradas). Las 6 decisiones abiertas no bloquean la Fase 1;
> deben resolverse antes de producción real y de la Fase 7.

## Qué es Legaria

Legaria es un SaaS B2B2C con cuatro áreas:

1. **Panel profesional** para funerarias.
2. **Portal privado** para familias.
3. **Memoriales digitales** públicos, privados o restringidos.
4. **Administración global** de la plataforma.

El producto combina gestión operativa, memoria digital e inteligencia artificial asistida, con una experiencia humana, sobria y respetuosa.

## Documentación

| Documento | Contenido |
|---|---|
| [PRD.md](./PRD.md) | Visión, alcance, requisitos funcionales y no funcionales, métricas y criterios de aceptación. |
| [docs/01-arquitectura.md](./docs/01-arquitectura.md) | Arquitectura lógica, modular, de despliegue y aislamiento multi-tenant. |
| [docs/02-modelo-datos.md](./docs/02-modelo-datos.md) | Modelo de datos inicial, relaciones, restricciones e índices. **Fuente de verdad: `apps/api/prisma/schema.prisma`.** |
| [docs/03-seguridad-privacidad.md](./docs/03-seguridad-privacidad.md) | Modelo de amenazas, controles, RGPD/LOPDGDD y IA. |
| [docs/04-estructura-repositorio.md](./docs/04-estructura-repositorio.md) | Estructura definitiva propuesta del monorepo (pnpm + `apps/` + `packages/`). |
| [docs/05-decisiones-pendientes.md](./docs/05-decisiones-pendientes.md) | Decisiones técnicas y funcionales. **19 resueltas, 6 abiertas.** |
| [docs/06-identidad-visual.md](./docs/06-identidad-visual.md) | Principios de diseño, tokens, tipografía y accesibilidad. |
| [docs/legal/politica-datos-fallecidos.md](./docs/legal/politica-datos-fallecidos.md) | Marco normativo, bases legales, autorización de publicación, conservación y transferencias internacionales. |
| [docs/adr/](./docs/adr/) | Registros de decisiones de arquitectura (0001–0006). |
| [specs/](./specs/) | Especificaciones funcionales y contratos por módulo (00–08). |

### ADRs

| ADR | Decisión |
|---|---|
| [0001](./docs/adr/0001-monorepo-pnpm.md) | Monorepo con pnpm workspaces. |
| [0002](./docs/adr/0002-monolito-modular.md) | Monolito modular, sin microservicios en MVP. |
| [0003](./docs/adr/0003-multitenancy.md) | Multi-tenancy con esquema compartido. |
| [0004](./docs/adr/0004-sesion-cookies.md) | Sesión con cookies `httpOnly` (patrón BFF). |
| [0005](./docs/adr/0005-almacenamiento-privado.md) | Almacenamiento privado por defecto. |
| [0006](./docs/adr/0006-rls-y-aislamiento-backend.md) | RLS en Supabase + filtrado obligatorio en backend + pruebas de aislamiento. |

### Specs

| Spec | Módulo |
|---|---|
| [00](./specs/00-convenciones.md) | Convenciones comunes. |
| [01](./specs/01-autenticacion-rbac.md) | Autenticación, RBAC y multi-tenancy. |
| [02](./specs/02-organizaciones-empleados.md) | Organizaciones y empleados. |
| [03](./specs/03-expedientes-servicios.md) | Expedientes, personas fallecidas y servicios. |
| [04](./specs/04-familias-invitaciones.md) | Familias, invitaciones y portal privado. |
| [05](./specs/05-memoriales.md) | Memoriales. |
| [06](./specs/06-ia.md) | Inteligencia artificial asistida. |
| [07](./specs/07-api.md) | Contratos de API REST. |
| [08](./specs/08-roadmap-mvp.md) | Roadmap y criterios de salida. |

## Stack propuesto

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, React Hook Form y Zod.
- **Backend:** Node.js, Express, TypeScript, Zod y arquitectura modular por dominios.
- **Datos:** PostgreSQL, Supabase y Prisma ORM, con UUID como identificadores.
- **Autenticación:** Supabase Auth, RBAC y autorización por contexto.
- **Aislamiento:** `organization_id` + claves foráneas compuestas + filtrado en backend + RLS en Supabase (defensa en profundidad).
- **Almacenamiento:** Supabase Storage con buckets privados y URLs firmadas.
- **IA:** **Google Gemini** (free tier: 1.000 RPD en Flash-Lite) como proveedor principal. **OpenRouter** como respaldo para pruebas. Abstracción mediante interfaz `AiProvider`.
- **Email transaccional:** Resend (free tier: 3.000 emails/mes).
- **Infraestructura:** Git/GitHub, entornos separados, Docker opcional y pruebas automatizadas.

### Plan gratuito

Todo el MVP se apoya en planes gratuitos:

| Servicio | Plan | Límite relevante |
|---|---|---|
| Supabase | Free | 500 MB DB, 1 GB Storage, proyecto US (documentado en `docs/legal/`) |
| Render | Free | 750 h/mes, cold starts tras 15 min |
| Vercel | Hobby | 100 GB/mes |
| Gemini API | Free | 1.000 RPD en Flash-Lite |
| Resend | Free | 3.000 emails/mes, 100/día |

La migración a planes de pago y región UE es un requisito previo a producción real.

## Principios

- Seguridad y privacidad desde el diseño.
- Aislamiento multi-tenant verificable en tres capas (modelo + aplicación + RLS).
- Autorización en backend, nunca solo en la interfaz.
- Monolito modular, sin microservicios en la primera versión.
- TypeScript estricto y validación compartida con Zod.
- La IA asiste, nunca publica, nunca inventa, nunca suplanta.
- Documentación y pruebas como parte del producto.

## Estado del proyecto

### Completado

- [x] PRD, arquitectura, modelo de datos, seguridad y privacidad.
- [x] 19 de 25 decisiones cerradas (`docs/05-decisiones-pendientes.md`).
- [x] Identidad visual.
- [x] 6 ADRs (0001–0006).
- [x] 9 specs (00–08).
- [x] Política legal de datos de fallecidos.
- [x] Decisión de proveedor IA: Gemini (principal) + OpenRouter (respaldo).

### Pendiente antes de Fase 1

- [ ] Crear `apps/api/prisma/schema.prisma` a partir de `docs/02-modelo-datos.md`.
- [ ] Generar migración `0001_init` con `prisma migrate dev --name init`.
- [ ] Añadir políticas RLS en `infra/supabase/policies/0001_rls.sql`.
- [ ] Implementar módulos `auth`, `organizations` y `cases` en `apps/api/src/modules/`.
- [ ] Crear `apps/api/tests/security/tenant-isolation.test.ts` (aislamiento cross-tenant).
- [ ] Crear `apps/api/prisma/seed.ts` (2 organizaciones, 3 expedientes).
- [ ] Implementar `FuneralHomeLayout` + `CaseListPage` en `apps/web/`.

### Decisiones abiertas (no bloquean Fase 1)

- D-09: memoriales sin funeraria.
- D-16: plazos de conservación (revisión legal).
- D-17: edad mínima y menores (revisión legal).
- D-18: rol de Legaria como responsable/encargado (revisión legal).
- D-24: pasarela de pago (Fase 7).
- D-25: internacionalización.

Deben cerrarse **antes de producción real** (D-16, D-17, D-18) o **antes de Fase 7** (D-24, D-25).

## Próximo paso

1. Revisar y validar el `schema.prisma` contra `docs/02-modelo-datos.md`.
2. Generar la migración `0001_init` y aplicar las políticas RLS de ADR 0006.
3. Implementar los módulos `auth`, `organizations` y `cases` siguiendo sus specs.
4. Ejecutar las pruebas de aislamiento cross-tenant en CI.
5. Iniciar la Fase 2 (organizaciones y administración) solo cuando las pruebas de aislamiento estén en verde.

## Contribución

Proyecto personal de portfolio. Antes de proponer un cambio, revisa:

- [specs/00-convenciones.md](./specs/00-convenciones.md)
- Los ADRs relevantes en `docs/adr/`
- La spec del módulo afectado

Las decisiones de arquitectura se documentan como ADR nuevos, no se modifican los existentes.