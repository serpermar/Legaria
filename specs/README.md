# Especificaciones — Legaria

Cada documento describe un módulo funcional y sirve como contrato previo a la implementación.

## Índice

| Spec | Módulo | Fase |
|---|---|---|
| [00-convenciones.md](./00-convenciones.md) | Convenciones comunes | 1 |
| [01-autenticacion-rbac.md](./01-autenticacion-rbac.md) | Autenticación, sesión, RBAC y multi-tenancy | 1 |
| [02-organizaciones-empleados.md](./02-organizaciones-empleados.md) | Organizaciones y empleados | 2 |
| [03-expedientes-servicios.md](./03-expedientes-servicios.md) | Expedientes, personas fallecidas, servicios, salas y documentos | 3 |
| [04-familias-invitaciones.md](./04-familias-invitaciones.md) | Familias, invitaciones y portal privado | 4 |
| [05-memoriales.md](./05-memoriales.md) | Memoriales, medios, recuerdos y condolencias | 5 |
| [06-ia.md](./06-ia.md) | IA asistida y revisión humana | 6 |
| [07-api.md](./07-api.md) | Convenciones y catálogo de API | 1–5 |
| [08-roadmap-mvp.md](./08-roadmap-mvp.md) | Fases, entregables y criterios de salida | 0–7 |

## Estados

- **Borrador:** pendiente de validación.
- **Validado:** aprobado para implementación.
- **Implementado:** existe código y pruebas.
- **Modificado:** requiere revisión por cambio de requisitos.

## Plantilla de especificación

1. Objetivo.
2. Actores y permisos.
3. Modelo de datos implicado.
4. Reglas de negocio.
5. Endpoints.
6. Validaciones.
7. Errores.
8. Auditoría.
9. Casos límite.
10. Criterios de aceptación.
11. Preguntas abiertas.

## Regla de trabajo

No se implementa un módulo sin:

- Especificación validada.
- Modelo de datos revisado.
- Endpoints definidos.
- Permisos identificados.
- Criterios de aceptación acordados.
- Pruebas previstas.
