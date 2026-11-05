# ADR 0003 — Multi-tenancy con esquema compartido

**Estado:** Propuesto  
**Fecha:** 2026-11-05

## Contexto

Las funerarias son organizaciones con datos aislados. El MVP necesita bajo coste, migraciones simples y consultas agregadas para administración.

## Decisión

Base de datos compartida con esquema compartido:

- `organization_id` en todas las tablas de tenant.
- Autorización en aplicación con repositorios acotados.
- Claves foráneas compuestas `(id, organization_id)`.
- Pruebas automatizadas de aislamiento entre dos organizaciones.
- RLS como defensa adicional opcional.

## Consecuencias

**Positivas**

- Operación sencilla.
- Migraciones únicas.
- Coste bajo.
- Analítica agregada viable.

**Negativas**

- Riesgo de fuga si una consulta omite el filtro.
- RLS no protege automáticamente si Prisma usa un rol con bypass.
- Necesidad de disciplina y pruebas.

## Mitigaciones

- Repositorios que exigen ámbito.
- Revisión de código específica.
- Tests cross-tenant en CI.
- Claves compuestas para integridad.
- Prohibición de consultas globales en módulos de tenant.
