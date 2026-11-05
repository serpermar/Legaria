# ADR 0001 — Monorepo con pnpm

**Estado:** Propuesto  
**Fecha:** 2026-11-05

## Contexto

Legaria tiene frontend, backend y contratos compartidos. Los cambios de producto suelen atravesar API, base de datos y UI. Se busca simplicidad operativa y buena experiencia de desarrollo.

## Decisión

Usar un monorepo con pnpm workspaces:

- `apps/api`
- `apps/web`
- `packages/contracts`
- `packages/config` (opcional)

## Consecuencias

**Positivas**

- Contratos Zod y tipos compartidos sin publicar paquetes.
- Un único PR para cambios de extremo a extremo.
- CI y versionado unificados.
- Onboarding sencillo.

**Negativas**

- Mayor acoplamiento de herramientas.
- CI potencialmente más lenta.
- Necesidad de disciplina para no mezclar dependencias.

## Alternativas descartadas

- Repositorios separados: coordinación extra sin beneficio en esta escala.
- Carpetas `backend/` y `frontend/` sin workspaces: menos aislamiento de dependencias.
