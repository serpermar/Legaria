# Spec 08 — Roadmap y criterios de salida

**Estado:** Borrador  
**Alcance:** Fase 0 a Fase 7

---

## 1. Principios del roadmap

- Entregas incrementales y verificables.
- Cada fase termina con una demo y criterios de aceptación.
- No se avanza si la seguridad o el aislamiento multi-tenant fallan.
- La IA y el pago no bloquean el MVP.
- La documentación y las pruebas forman parte del entregable.

---

## 2. Fase 0 — Análisis y arquitectura

**Estado:** En curso.

### Entregables

- [x] PRD.
- [x] Arquitectura.
- [x] Modelo de datos inicial.
- [x] Seguridad y privacidad.
- [x] Estructura del repositorio.
- [x] Decisiones pendientes.
- [x] Identidad visual.
- [x] ADRs.
- [x] Especificaciones iniciales.
- [ ] Validación de decisiones.
- [ ] Ajustes de specs.

### Criterio de salida

- Decisiones bloqueantes resueltas.
- PRD y specs validadas.
- Alcance del MVP confirmado.
- Autorización para iniciar la Fase 1.

---

## 3. Fase 1 — Fundación

### Objetivo

Disponer de una base técnica segura, reproducible y probada sobre la que construir los módulos.

### Entregables

- Monorepo pnpm con `apps/api`, `apps/web`, `packages/contracts`.
- TypeScript estricto, ESLint, Prettier y Vitest.
- Configuración de entornos y `.env.example`.
- Supabase local o PostgreSQL de desarrollo.
- Esquema Prisma inicial con usuarios, organizaciones, memberships y auditoría.
- Migraciones y seed con dos organizaciones.
- Autenticación con Supabase.
- Sesión con cookies o Bearer según decisión.
- Middleware de autenticación y resolución de actor.
- RBAC base y catálogo de permisos.
- Aislamiento multi-tenant y pruebas cross-tenant.
- Manejo de errores y request ID.
- Cabeceras de seguridad, CORS, CSRF y rate limiting básico.
- Layouts base y design tokens.
- CI con lint, typecheck, tests y build.
- Health checks.
- README actualizado.

### Criterio de salida

- Un usuario puede iniciar y cerrar sesión.
- Un usuario de la organización A no accede a la B.
- Existen pruebas automatizadas de aislamiento.
- CI en verde.
- No hay secretos en el repositorio.
- Errores y logs no exponen datos sensibles.

### Riesgos

- Complejidad del modelo de sesión.
- Configuración de Supabase local.
- Curva inicial de Prisma y migraciones.

---

## 4. Fase 2 — Organizaciones y administración

### Objetivo

Permitir el alta y gestión de funerarias, empleados y supervisión global.

### Entregables

- Alta de organización por Super Admin.
- Perfil de organización.
- Invitaciones de empleados.
- Aceptación y verificación de email.
- Roles `FUNERAL_ADMIN` y `FUNERAL_EMPLOYEE`.
- Protección del último administrador.
- Dashboard de organización.
- Panel global de organizaciones y usuarios.
- Acceso de soporte con motivo y caducidad.
- Auditoría de organización.
- Métricas agregadas.
- MFA para administradores.
- Pruebas de autorización y E2E de alta.

### Criterio de salida

- Se crea una funeraria y su administrador.
- Se invitan y aceptan empleados.
- El Super Admin no accede a contenido sin concesión.
- Las acciones sensibles quedan auditadas.
- El panel global no muestra datos personales innecesarios.

---

## 5. Fase 3 — Expedientes y servicios

### Objetivo

Digitalizar la operativa básica del expediente funerario.

### Entregables

- Creación de expediente con referencia atómica.
- Listado, filtros, búsqueda y paginación.
- Detalle y edición.
- Estados y transiciones.
- Persona fallecida.
- Servicios funerarios.
- Salas y ceremonias.
- Validación de solapamientos.
- Asignaciones de empleados.
- Documentos con subida privada y URL firmada.
- Historial de actividad.
- Vista limitada para familias.
- Pruebas de aislamiento y documentos.

### Criterio de salida

- Un empleado asignado gestiona su expediente.
- Un empleado no asignado no accede.
- La familia ve solo información autorizada.
- Los documentos no son públicos.
- Las transiciones inválidas se bloquean.
- Existen pruebas de fechas, salas y permisos.

---

## 6. Fase 4 — Familias e invitaciones

### Objetivo

Incorporar a la familia a un espacio privado seguro.

### Entregables

- Grupo familiar.
- Invitaciones con token hasheado, caducidad y un solo uso.
- Validación y canje.
- Creación o vinculación de cuenta.
- Roles familiares.
- Portal familiar.
- Gestión de miembros.
- Transferencia de administración.
- Acceso a documentos autorizados.
- Solicitudes de cambio o eliminación.
- Revocación inmediata.
- Pruebas de token inválido, caducado y reutilizado.

### Criterio de salida

- La invitación funciona de extremo a extremo.
- El token no se reutiliza.
- El familiar solo accede a su grupo.
- El último administrador está protegido.
- La retirada revoca el acceso.
- Existen pruebas de seguridad del flujo.

---

## 7. Fase 5 — Memoriales

### Objetivo

Crear, revisar, autorizar y publicar memoriales digitales.

### Entregables

- Memorial en borrador.
- Biografía.
- Fotografía principal y galería.
- Vídeo con límites.
- Recuerdos.
- Cronología.
- Condolencias y moderación.
- Visibilidad pública, privada y restringida.
- Autorización de publicación.
- Revisión y aprobación.
- Publicación y despublicación.
- URL pública.
- Compartición.
- `noindex`.
- Reporte de contenido.
- Procesamiento de imágenes sin EXIF.
- Pruebas E2E de publicación y acceso.

### Criterio de salida

- Un memorial no se publica sin autorización.
- El público resuelve y el privado no.
- Las condolencias requieren moderación.
- Despublicar oculta el contenido.
- Las imágenes no contienen metadatos.
- Existen pruebas de acceso por visibilidad.

### Hito: MVP

El MVP se libera al completar las fases 1–5 y cumplir los criterios del PRD.

---

## 8. Fase 6 — Inteligencia artificial

### Objetivo

Añadir asistencia de redacción y organización con revisión humana.

### Entregables

- Interfaz de proveedor.
- Generación de biografía.
- Generación de homenaje.
- Propuesta de cronología.
- Minimización y redacción.
- Cuotas por plan.
- Registro de generaciones.
- Etiquetado de borradores.
- Revisión y aprobación.
- Evaluación de invención y seguridad.
- DPA y revisión legal.

### Criterio de salida

- La IA no publica.
- Todo texto se revisa.
- No se inventan hechos en la evaluación.
- No se permite suplantación.
- Se aplican cuotas y trazabilidad.
- Existe base legal y contractual.

---

## 9. Fase 7 — Comercialización

### Objetivo

Convertir Legaria en un SaaS con planes, pagos y facturación.

### Entregables

- Planes Basic, Professional y Enterprise.
- Límites por plan.
- Integración con pasarela.
- Webhooks firmados.
- Periodos de prueba.
- Facturas.
- Gestión de impagos.
- Métricas de negocio.
- Portal de suscripción.
- Pruebas de idempotencia y webhooks.

### Criterio de salida

- Una organización puede contratar un plan.
- Los límites se aplican en backend.
- Los webhooks son idempotentes y seguros.
- La facturación es trazable.
- No se almacenan datos de tarjeta en Legaria.

---

## 10. Trabajo transversal

Durante todas las fases:

- Seguridad y privacidad.
- Accesibilidad WCAG 2.2 AA.
- Pruebas unitarias, integración y E2E.
- Documentación y ADRs.
- Observabilidad.
- Revisión de dependencias.
- Backups y restauración.
- Revisión legal.

---

## 11. Primer sprint propuesto (tras validación)

### Semana 1

- Crear monorepo y workspaces.
- Configurar TypeScript, ESLint, Prettier y Vitest.
- Configurar CI.
- Crear `.env.example`.
- Configurar Prisma y base de datos local.
- Definir esquema inicial de usuarios, organizaciones y memberships.
- Configurar Supabase Auth.
- Implementar login, refresh y logout.
- Implementar middleware de actor.
- Crear seed con dos organizaciones.
- Escribir primeras pruebas de aislamiento.

### Semana 2

- Implementar RBAC base.
- Implementar organizaciones y memberships.
- Crear layouts y navegación.
- Implementar manejo de errores.
- Añadir cabeceras de seguridad, CORS y CSRF.
- Añadir rate limiting básico.
- Documentar auth y permisos.
- Demo de login y aislamiento.

> La duración es orientativa y debe ajustarse tras la validación.

---

## 12. Dependencias entre fases

```text
Fase 0 -> Fase 1 -> Fase 2 -> Fase 3 -> Fase 4 -> Fase 5 -> MVP
                                                        -> Fase 6
                                                        -> Fase 7
```

- Fase 3 depende de organizaciones y empleados.
- Fase 4 depende de expedientes.
- Fase 5 depende de familias y expedientes.
- Fase 6 depende de memoriales.
- Fase 7 puede empezar en paralelo a Fase 6 si el producto lo requiere.

---

## 13. Definición de terminado (global)

- [ ] Requisitos y criterios de aceptación validados.
- [ ] Código con TypeScript estricto.
- [ ] Pruebas unitarias e integración.
- [ ] Pruebas E2E del flujo.
- [ ] Autorización y aislamiento probados.
- [ ] Auditoría implementada.
- [ ] Accesibilidad revisada.
- [ ] Documentación actualizada.
- [ ] Sin secretos ni PII en logs.
- [ ] Revisión de seguridad.
- [ ] Demo realizada.
