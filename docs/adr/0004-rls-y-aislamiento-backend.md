Título: ADR 0004 — RLS y aislamiento multi-tenant en backend

Encabezado:

markdown
- **Estado**: Aceptado
- **Fecha**: 2026-11-05
- **Decisores**: Arquitecto de software, desarrollador Full Stack senior
- **Relacionado**: [ADR 0003 — Multitenancy](./0003-multitenancy.md)
Contexto: añadir al inicio:

Este ADR complementa el ADR 0003. Mientras que 0003 fija el modelo de multi-tenancy (qué es un tenant, cómo se relaciona con Organization), este 0004 concreta cómo se aplica esa decisión: RLS en Supabase + filtrado obligatorio en backend.

Sección § 8 "Referencias": añadir - docs/adr/0003-multitenancy.md.

El resto del contenido (capas 1/2/3, matriz de visibilidad, helpers SQL, consecuencias, alternativas descartadas, criterios de aceptación) se mantiene igual.

Acción adicional: revisa que 0003-multitenancy.md no repita la matriz de visibilidad ni las políticas RLS. Si las repite, muévelas al 0004 y deja en 0003 solo la definición de tenant + modelo de datos.