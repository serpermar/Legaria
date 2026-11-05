# Legaria

Plataforma digital funeraria y de memoriales para conectar funerarias, familias y particulares.

> **Estado actual: Fase 0 — análisis, producto y arquitectura.**
> Todavía no hay código de aplicación. Los documentos de este repositorio son propuestas y deben validarse antes de implementar.

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
| [docs/01-arquitectura.md](./docs/01-arquitectura.md) | Arquitectura lógica, modular y de despliegue. |
| [docs/02-modelo-datos.md](./docs/02-modelo-datos.md) | Modelo de datos inicial, relaciones, restricciones e índices. |
| [docs/03-seguridad-privacidad.md](./docs/03-seguridad-privacidad.md) | Modelo de amenazas, controles, RGPD/LOPDGDD y IA. |
| [docs/04-estructura-repositorio.md](./docs/04-estructura-repositorio.md) | Estructura definitiva propuesta del monorepo. |
| [docs/05-decisiones-pendientes.md](./docs/05-decisiones-pendientes.md) | Decisiones técnicas y funcionales que requieren validación. |
| [docs/06-identidad-visual.md](./docs/06-identidad-visual.md) | Principios de diseño, tokens, tipografía y accesibilidad. |
| [docs/adr/](./docs/adr/) | Registros de decisiones de arquitectura. |
| [specs/](./specs/) | Especificaciones funcionales y contratos iniciales por módulo. |

## Stack propuesto

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, React Hook Form y Zod.
- **Backend:** Node.js, Express, TypeScript, Zod y arquitectura modular por dominios.
- **Datos:** PostgreSQL, Supabase y Prisma ORM, con UUID como identificadores.
- **Autenticación:** Supabase Auth, RBAC y autorización por contexto.
- **Almacenamiento:** Supabase Storage con buckets privados y URLs firmadas.
- **IA:** OpenAI API, invocada exclusivamente desde el backend.
- **Infraestructura:** Git/GitHub, entornos separados, Docker opcional y pruebas automatizadas.

## Principios

- Seguridad y privacidad desde el diseño.
- Aislamiento multi-tenant verificable.
- Autorización en backend, nunca solo en la interfaz.
- Monolito modular, sin microservicios en la primera versión.
- TypeScript estricto y validación compartida con Zod.
- La IA asiste, nunca publica ni inventa.
- Documentación y pruebas como parte del producto.

## Próximo paso

1. Revisar y validar [PRD.md](./PRD.md) y [docs/05-decisiones-pendientes.md](./docs/05-decisiones-pendientes.md).
2. Ajustar las especificaciones de [specs/](./specs/).
3. Iniciar la Fase 1 (fundación técnica) solo después de la validación.
