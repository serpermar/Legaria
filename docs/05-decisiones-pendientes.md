# Decisiones pendientes — Legaria

**Estado:** Pendiente de validación  
**Uso:** Resolver antes de iniciar la fase indicada. Las propuestas son recomendaciones, no decisiones cerradas.

---

## 1. Decisiones bloqueantes para la Fase 1

### D-01. Estructura del repositorio

| | |
|---|---|
| **Opciones** | A) Monorepo pnpm con `apps/api`, `apps/web`, `packages/contracts`. B) Repositorios separados. C) Monorepo con carpetas `backend/` y `frontend/`. |
| **Recomendación** | **A**. Contratos compartidos, CI única y cambios de extremo a extremo. |
| **Impacto** | Alto: afecta a imports, CI, despliegue y documentación. |
| **Decisión** | ☐ Pendiente |

### D-02. Modelo de sesión

| | |
|---|---|
| **Opciones** | A) BFF con cookies `httpOnly` gestionadas por la API. B) SPA con Bearer token y Supabase JS. C) Híbrido. |
| **Recomendación** | **A** para datos sensibles: refresh token fuera de JavaScript, revocación centralizada y CSRF controlado. |
| **Impacto** | Alto: afecta a auth, CORS, CSRF, frontend y despliegue. |
| **Requisito** | Dominios same-site (`app.legaria.es` + `api.legaria.es`) o proxy inverso. |
| **Decisión** | ☐ Pendiente |

### D-03. Aislamiento multi-tenant

| | |
|---|---|
| **Opciones** | A) `organization_id` + autorización en aplicación + FK compuestas. B) A + RLS de PostgreSQL. C) Esquema por tenant. |
| **Recomendación** | **A** en Fase 1 y evaluar **B** como defensa adicional antes de producción. |
| **Impacto** | Crítico para seguridad. |
| **Decisión** | ☐ Pendiente |

### D-04. Hosting y dominios

| | |
|---|---|
| **Opciones** | A) Supabase (EU) + API en Render/Fly.io + web en Vercel/Cloudflare Pages. B) Todo en Railway. C) AWS. |
| **Recomendación** | **A**, con dominios propios y misma-site para cookies. |
| **Impacto** | Alto: coste, latencia, despliegue, backups y observabilidad. |
| **Decisión** | ☐ Pendiente |

### D-05. Proveedor de email

| | |
|---|---|
| **Opciones** | A) Resend. B) AWS SES. C) Postmark. |
| **Recomendación** | **A** por simplicidad y buena experiencia de desarrollo; **B** si el coste escala. |
| **Impacto** | Medio: invitaciones, recuperación y notificaciones. |
| **Decisión** | ☐ Pendiente |

### D-06. Rate limiting y colas

| | |
|---|---|
| **Opciones** | A) PostgreSQL (`pg-boss`) + rate limit en memoria/Postgres. B) Redis (Upstash) + BullMQ. |
| **Recomendación** | **A** para el MVP; **B** si hay varias instancias o picos. |
| **Impacto** | Medio: complejidad operativa y coste. |
| **Decisión** | ☐ Pendiente |

### D-07. Estrategia de pruebas de integración

| | |
|---|---|
| **Opciones** | A) Supabase local. B) PostgreSQL con Testcontainers. C) Base de datos de staging. |
| **Recomendación** | **B** en CI y **A** en local. |
| **Impacto** | Medio: velocidad y fiabilidad de CI. |
| **Decisión** | ☐ Pendiente |

---

## 2. Decisiones de producto y legales

### D-08. Autorización para publicar un memorial

| | |
|---|---|
| **Opciones** | A) Consentimiento digital del `FAMILY_ADMIN` con registro de evidencia. B) Documento firmado obligatorio. C) Ambos según el caso. |
| **Recomendación** | **C**: consentimiento digital para contenido general y documento para casos que lo requieran; revisión legal previa. |
| **Impacto** | Crítico: privacidad, confianza y cumplimiento. |
| **Decisión** | ☐ Pendiente |

### D-09. Memoriales sin funeraria

| | |
|---|---|
| **Opciones** | A) Solo a través de una funeraria en el MVP. B) Particulares pueden crear memoriales desde el inicio. |
| **Recomendación** | **A** en el MVP; **B** en una fase posterior con verificación adicional. |
| **Impacto** | Alto: modelo de negocio, moderación y responsabilidad. |
| **Decisión** | ☐ Pendiente |

### D-10. Número de grupos familiares por expediente

| | |
|---|---|
| **Opciones** | A) Uno por expediente en el MVP. B) Varios desde el inicio. |
| **Recomendación** | **A**, manteniendo el modelo preparado para **B**. |
| **Impacto** | Medio: modelo de datos y permisos. |
| **Decisión** | ☐ Pendiente |

### D-11. Registro de familiares

| | |
|---|---|
| **Opciones** | A) Solo por invitación. B) Registro libre + vinculación posterior. |
| **Recomendación** | **A** para el MVP: reduce suplantaciones y accesos indebidos. |
| **Impacto** | Alto: seguridad y experiencia. |
| **Decisión** | ☐ Pendiente |

### D-12. Almacenamiento de DNI/NIE de la persona fallecida

| | |
|---|---|
| **Opciones** | A) No almacenar en el MVP. B) Almacenar cifrado a nivel de aplicación. C) Almacenar en claro. |
| **Recomendación** | **A**. Solo añadir **B** si una integración o requisito legal lo exige. |
| **Impacto** | Alto: minimización y riesgo. |
| **Decisión** | ☐ Pendiente |

### D-13. Moderación de condolencias

| | |
|---|---|
| **Opciones** | A) Moderación previa. B) Publicación inmediata con revisión posterior. C) Configurable por memorial. |
| **Recomendación** | **A** en el MVP; **C** más adelante. |
| **Impacto** | Alto: reputación, spam y carga operativa. |
| **Decisión** | ☐ Pendiente |

### D-14. Indexación en buscadores

| | |
|---|---|
| **Opciones** | A) `noindex` siempre. B) `noindex` por defecto, activable. C) Indexación por defecto. |
| **Recomendación** | **B**. |
| **Impacto** | Medio: privacidad y descubrimiento. |
| **Decisión** | ☐ Pendiente |

### D-15. URL pública del memorial

| | |
|---|---|
| **Opciones** | A) Slug opaco aleatorio (`/memorial/a1b2c3d4`). B) Nombre y apellidos (`/memorial/ana-garcia`). C) Slug personalizado. |
| **Recomendación** | **A** por privacidad; **C** opcional para Enterprise. |
| **Impacto** | Medio: privacidad, SEO y colisiones. |
| **Decisión** | ☐ Pendiente |

### D-16. Plazos de conservación

| | |
|---|---|
| **Opciones** | A) Propuesta inicial del documento de modelo de datos. B) Definir por contrato con cada funeraria. C) Otra política. |
| **Recomendación** | **B** con una base común y revisión legal. |
| **Impacto** | Alto: cumplimiento y coste de almacenamiento. |
| **Decisión** | ☐ Pendiente |

### D-17. Edad mínima y menores

| | |
|---|---|
| **Opciones** | A) 14 años con consentimiento propio. B) 18 años. C) Solo mediante representante legal. |
| **Recomendación** | **A** con revisión legal y restricciones de contenido. |
| **Impacto** | Medio: cumplimiento y moderación. |
| **Decisión** | ☐ Pendiente |

### D-18. Rol de Legaria en el tratamiento

| | |
|---|---|
| **Opciones** | A) Encargada del tratamiento de la funeraria. B) Responsable de los memoriales familiares. C) Modelo mixto. |
| **Recomendación** | **C** con contratos específicos y revisión legal. |
| **Impacto** | Crítico: obligaciones, contratos y DPIA. |
| **Decisión** | ☐ Pendiente |

---

## 3. Decisiones técnicas posteriores

### D-19. Proveedor de IA y región

| | |
|---|---|
| **Opciones** | A) OpenAI API con DPA y minimización. B) Azure OpenAI en la UE. C) Otro proveedor. |
| **Recomendación** | **B** si la residencia de datos en la UE es requisito; **A** si las garantías contractuales son suficientes. |
| **Impacto** | Alto: privacidad, coste, latencia y calidad. |
| **Decisión** | ☐ Pendiente |

### D-20. Medios públicos

| | |
|---|---|
| **Opciones** | A) Bucket público solo para derivados de memoriales públicos. B) Todo privado con URLs firmadas. C) CDN propia. |
| **Recomendación** | **A**: originales privados, derivados públicos sin EXIF. |
| **Impacto** | Medio: rendimiento, coste y privacidad. |
| **Decisión** | ☐ Pendiente |

### D-21. Sistema de diseño

| | |
|---|---|
| **Opciones** | A) Tailwind + Radix UI + CVA. B) shadcn/ui. C) Librería completa (MUI, Chakra). |
| **Recomendación** | **A** con componentes propios; **B** como punto de partida si acelera. |
| **Impacto** | Medio: consistencia y accesibilidad. |
| **Decisión** | ☐ Pendiente |

### D-22. MFA

| | |
|---|---|
| **Opciones** | A) Obligatoria para `SUPER_ADMIN` y `FUNERAL_ADMIN`. B) Solo Super Admin. C) Opcional. |
| **Recomendación** | **A**. |
| **Impacto** | Medio: seguridad y fricción. |
| **Decisión** | ☐ Pendiente |

### D-23. Acceso de soporte del Super Admin

| | |
|---|---|
| **Opciones** | A) Sin acceso a contenido sensible. B) Acceso temporal con motivo y auditoría. C) Acceso permanente. |
| **Recomendación** | **B**. |
| **Impacto** | Alto: privacidad y confianza. |
| **Decisión** | ☐ Pendiente |

### D-24. Pasarela de pago (Fase 7)

| | |
|---|---|
| **Opciones** | A) Stripe. B) Paddle. C) Redsys. |
| **Recomendación** | **A** para SaaS internacional; **C** si se exige proveedor local. |
| **Impacto** | Medio: facturación e impuestos. |
| **Decisión** | ☐ Pendiente (no bloquea el MVP) |

### D-25. Internacionalización

| | |
|---|---|
| **Opciones** | A) Solo español, textos externalizados. B) `react-i18next` desde el inicio. C) Solo español sin externalizar. |
| **Recomendación** | **A**: bajo coste y preparado para **B**. |
| **Impacto** | Bajo en el MVP. |
| **Decisión** | ☐ Pendiente |

---

## 4. Decisiones ya propuestas (salvo objeción)

Estas decisiones se consideran parte de la propuesta y solo requieren confirmación:

1. Monolito modular, sin microservicios.
2. PostgreSQL + Prisma + Supabase.
3. UUID como identificadores.
4. Zod como validación compartida.
5. API REST versionada en `/api/v1`.
6. Buckets privados por defecto.
7. IA solo desde backend y con revisión humana.
8. Autorización en backend, nunca solo en frontend.
9. `SUPER_ADMIN` sin acceso permanente a contenido sensible.
10. Un memorial por expediente en el MVP.
11. Una familia por expediente en el MVP.
12. Sin pagos en el MVP.
13. Sin IA en el MVP.
14. Español como idioma inicial.
15. TanStack Query para estado del servidor.
16. React Hook Form + Zod para formularios.

---

## 5. Orden de resolución recomendado

1. **D-02** (sesión) y **D-03** (multi-tenancy): condicionan toda la Fase 1.
2. **D-01**, **D-04**, **D-05**, **D-06**, **D-07**: infraestructura y repo.
3. **D-08**, **D-18**, **D-16**: legal y privacidad antes de producción.
4. **D-09**, **D-10**, **D-11**, **D-13**, **D-15**: producto del MVP.
5. **D-19**, **D-20**, **D-21**, **D-22**, **D-23**: antes de las fases correspondientes.
6. **D-24**, **D-25**: no bloquean el MVP.

---

## 6. Cómo validar

Puede responderse con el identificador y la opción elegida. Ejemplo:

```text
D-01: A
D-02: A
D-03: A
D-08: C
```

También se puede indicar “propuesta aceptada” para aprobar todas las recomendaciones, o detallar cambios en las especificaciones antes de empezar.
