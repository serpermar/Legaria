# Decisiones pendientes — Legaria

**Estado:** Parcialmente resueltas  
**Uso:** Las marcadas como ✅ ya no bloquean; las ⏳ siguen abiertas.

---

## 1. Decisiones bloqueantes para la Fase 1

### D-01. Estructura del repositorio

| | |
|---|---|
| **Opciones** | A) Monorepo pnpm con `apps/api`, `apps/web`, `packages/contracts`. B) Repositorios separados. C) Monorepo con carpetas `backend/` y `frontend/`. |
| **Recomendación** | **A**. Contratos compartidos, CI única y cambios de extremo a extremo. |
| **Impacto** | Alto: afecta a imports, CI, despliegue y documentación. |
| **Decisión** | Monorepo pnpm con `apps/api`, `apps/web`, `packages/contracts`. |
| **Referencia** | ADR 0001 |

### D-02. Modelo de sesión

| | |
|---|---|
| **Opciones** | A) BFF con cookies `httpOnly` gestionadas por la API. B) SPA con Bearer token y SDK de auth en el navegador. C) Híbrido. |
| **Recomendación** | **A** para datos sensibles: refresh token fuera de JavaScript, revocación centralizada y CSRF controlado. |
| **Impacto** | Alto: afecta a auth, CORS, CSRF, frontend y despliegue. |
| **Requisito** | Dominios same-site (`app.legaria.es` + `api.legaria.es`) o proxy inverso. |
| **Decisión** | BFF con cookies `httpOnly` gestionadas por la API + CSRF. |
| **Referencia** | ADR 0004 |

### D-03. Aislamiento multi-tenant

| | |
|---|---|
| **Opciones** | A) `organization_id` + autorización en aplicación + FK compuestas. B) A + RLS de PostgreSQL. C) Esquema por tenant. |
| **Recomendación** | **A** en Fase 1 y evaluar **B** como defensa adicional antes de producción. |
| **Impacto** | Crítico para seguridad. |
| **Decisión** | `organization_id` + FK compuestas (ADR 0003) + filtrado backend + RLS como defensa en profundidad. |
| **Referencia** | ADR 0003 + ADR 0006 |

### D-04. Hosting y dominios

| | |
|---|---|
| **Opciones** | A) Neon (EU) + API en Render/Fly.io + web en Vercel/Cloudflare Pages. B) Todo en Railway. C) AWS. |
| **Recomendación** | **A**, con dominios propios y misma-site para cookies. |
| **Impacto** | Alto: coste, latencia, despliegue, backups y observabilidad. |
| **Decisión** | Neon Free (Frankfurt) + Render (API) + Vercel (web), con Better Auth autoalojado y Neon Object Storage. |
| **Referencia** | ADR 0007 y `docs/legal/politica-datos-fallecidos.md` § 8 |

### D-05. Proveedor de email

| | |
|---|---|
| **Opciones** | A) Resend. B) AWS SES. C) Postmark. |
| **Recomendación** | **A** por simplicidad y buena experiencia de desarrollo; **B** si el coste escala. |
| **Impacto** | Medio: invitaciones, recuperación y notificaciones. |
| **Decisión** | **Resend** (free tier: 3.000 emails/mes, 100/día). Fallback a Brevo si se supera. |

### D-06. Rate limiting y colas

| | |
|---|---|
| **Opciones** | A) PostgreSQL (`pg-boss`) + rate limit en memoria/Postgres. B) Redis (Upstash) + BullMQ. |
| **Recomendación** | **A** para el MVP; **B** si hay varias instancias o picos. |
| **Impacto** | Medio: complejidad operativa y coste. |
| **Decisión** | `pg-boss` sobre PostgreSQL + rate limit en memoria. Redis solo si el volumen lo exige. |

### D-07. Estrategia de pruebas de integración

| | |
|---|---|
| **Opciones** | A) PostgreSQL local en Docker. B) PostgreSQL con Testcontainers. C) Base de datos de staging. |
| **Recomendación** | **B** en CI y **A** en local. |
| **Impacto** | Medio: velocidad y fiabilidad de CI. |
| **Decisión** | Testcontainers en CI, PostgreSQL en Docker en dev. |

---

## 2. Decisiones de producto y legales

### D-08. Autorización para publicar un memorial

| | |
|---|---|
| **Opciones** | A) Consentimiento digital del `FAMILY_ADMIN` con registro de evidencia. B) Documento firmado obligatorio. C) Ambos según el caso. |
| **Recomendación** | **C**: consentimiento digital para contenido general y documento para casos que lo requieran; revisión legal previa. |
| **Impacto** | Crítico: privacidad, confianza y cumplimiento. |
| **Decisión** | Consentimiento digital con registro de evidencia (`publication_authorizations` + `audit_logs`). Documento firmado opcional vía `documentId`. |
| **Referencia** | `docs/legal/politica-datos-fallecidos.md` § 4, `specs/05-memoriales.md` § 6 |

### D-09. Memoriales sin funeraria

| | |
|---|---|
| **Opciones** | A) Solo a través de una funeraria en el MVP. B) Particulares pueden crear memoriales desde el inicio. |
| **Recomendación** | solo a través de funeraria en MVP. |
| **Impacto** | Alto: modelo de negocio, moderación y responsabilidad. |
| **Decisión** | ☐ Pendiente |

### D-10. Número de grupos familiares por expediente

| | |
|---|---|
| **Opciones** | A) Uno por expediente en el MVP. B) Varios desde el inicio. |
| **Recomendación** | **A**, manteniendo el modelo preparado para **B**. |
| **Impacto** | Medio: modelo de datos y permisos. |
| **Decisión** | Uno por expediente en MVP (`UNIQUE(case_id)`), modelo preparado para varios. |
| **Referencia** | `docs/02-modelo-datos.md` § 3.3 |

### D-11. Registro de familiares

| | |
|---|---|
| **Opciones** | A) Solo por invitación. B) Registro libre + vinculación posterior. |
| **Recomendación** | **A** para el MVP: reduce suplantaciones y accesos indebidos. |
| **Impacto** | Alto: seguridad y experiencia. |
| **Decisión** | Solo por invitación. |
| **Referencia** | `specs/04-familias-invitaciones.md` § 5 |

### D-12. Almacenamiento de DNI/NIE de la persona fallecida

| | |
|---|---|
| **Opciones** | A) No almacenar en el MVP. B) Almacenar cifrado a nivel de aplicación. C) Almacenar en claro. |
| **Recomendación** | **A**. Solo añadir **B** si una integración o requisito legal lo exige. |
| **Impacto** | Alto: minimización y riesgo. |
| **Decisión** | **No se almacena en el MVP.** |

### D-13. Moderación de condolencias

| | |
|---|---|
| **Opciones** | A) Moderación previa. B) Publicación inmediata con revisión posterior. C) Configurable por memorial. |
| **Recomendación** | **A** en el MVP; **C** más adelante. |
| **Impacto** | Alto: reputación, spam y carga operativa. |
| **Decisión** | Moderación previa (`status = PENDING` hasta aprobación). |
| **Referencia** | `specs/05-memoriales.md` § 7.5 |

### D-14. Indexación en buscadores

| | |
|---|---|
| **Opciones** | A) `noindex` siempre. B) `noindex` por defecto, activable. C) Indexación por defecto. |
| **Recomendación** | **B**. |
| **Impacto** | Medio: privacidad y descubrimiento. |
| **Decisión** | `noindex, nofollow` por defecto; activable por la familia. |

### D-15. URL pública del memorial

| | |
|---|---|
| **Opciones** | A) Slug opaco aleatorio (`/memorial/a1b2c3d4`). B) Nombre y apellidos (`/memorial/ana-garcia`). C) Slug personalizado. |
| **Recomendación** | **A** por privacidad; **C** opcional para Enterprise. |
| **Impacto** | Medio: privacidad, SEO y colisiones. |
| **Decisión** | Slug opaco aleatorio (`/memorial/a1b2c3d4e5f6`). |
| **Referencia** | `specs/05-memoriales.md` § 9.3 |

### D-16. Plazos de conservación

| | |
|---|---|
| **Opciones** | A) Propuesta inicial del documento de modelo de datos. B) Definir por contrato con cada funeraria. C) Otra política. |
| **Recomendación** | **B** con una base común y revisión legal. |
| **Impacto** | Alto: cumplimiento y coste de almacenamiento. |
Propuesta inicial en `docs/legal/politica-datos-fallecidos.md` § 7. Validar con abogado.

### D-17. Edad mínima y menores

| | |
|---|---|
| **Opciones** | A) 14 años con consentimiento propio. B) 18 años. C) Solo mediante representante legal. |
| **Recomendación** | 14 años con verificación legal, sujeto a revisión |
| **Impacto** | Medio: cumplimiento y moderación. |
| **Decisión** | ☐ Pendiente |

### D-18. Rol de Legaria en el tratamiento

| | |
|---|---|
| **Opciones** | A) Encargada del tratamiento de la funeraria. B) Responsable de los memoriales familiares. C) Modelo mixto. |
| **Recomendación** | **C** con contratos específicos y revisión legal. |
| **Impacto** | Crítico: obligaciones, contratos y DPIA. |
| **Decisión** | ☐ Pendiente |
Propuesta: modelo mixto (encargada para funerarias, responsable para memoriales familiares).

---

## 3. Decisiones técnicas posteriores

### D-19. Proveedor de IA y región

| | |
|---|---|
| **Opciones** | A) OpenAI API con DPA y minimización. B) Azure OpenAI en la UE. C) Google Gemini (free tier) o Vertex AI. |
| **Recomendación** | **C** para el MVP por coste; **B** si la residencia de datos en la UE es requisito. |
| **Impacto** | Alto: privacidad, coste, latencia y calidad. |
| **Decisión** | **Google Gemini** (free tier: 1.000 RPD en Flash-Lite) como principal. **OpenRouter** como respaldo solo para pruebas (50 RPD sin créditos). Abstracción vía `AiProvider`. |
| **Referencia** | `specs/06-ia.md` § 11 |
| **Nota** | El free tier de Gemini puede usar prompts para mejorar sus productos. En MVP solo prompts anonimizados. Para producción, evaluar Vertex AI con residencia UE. |

### D-20. Medios públicos

| | |
|---|---|
| **Opciones** | A) Bucket público solo para derivados de memoriales públicos. B) Todo privado con URLs firmadas. C) CDN propia. |
| **Recomendación** | **A**: originales privados, derivados públicos sin EXIF. |
| **Impacto** | Medio: rendimiento, coste y privacidad. |
| **Decisión** | Originales privados, derivados públicos sin EXIF en bucket separado. |
| **Referencia** | ADR 0005 |

### D-21. Sistema de diseño

| | |
|---|---|
| **Opciones** | A) Tailwind + Radix UI + CVA. B) shadcn/ui. C) Librería completa (MUI, Chakra). |
| **Recomendación** | **A** con componentes propios; **B** como punto de partida si acelera. |
| **Impacto** | Medio: consistencia y accesibilidad. |
| **Decisión** | Tailwind + Radix UI + CVA. Componentes propios. |
| **Referencia** | `docs/06-identidad-visual.md` |

### D-22. MFA

| | |
|---|---|
| **Opciones** | A) Obligatoria para `SUPER_ADMIN` y `FUNERAL_ADMIN`. B) Solo Super Admin. C) Opcional. |
| **Recomendación** | **A**. |
| **Impacto** | Medio: seguridad y fricción. |
| **Decisión** | Obligatoria para `SUPER_ADMIN` y `FUNERAL_ADMIN`. |
| **Referencia** | `specs/01-autenticacion-rbac.md` § 4.6 |

### D-23. Acceso de soporte del Super Admin

| | |
|---|---|
| **Opciones** | A) Sin acceso a contenido sensible. B) Acceso temporal con motivo y auditoría. C) Acceso permanente. |
| **Recomendación** | **B**. |
| **Impacto** | Alto: privacidad y confianza. |
| **Decisión** | Acceso temporal con motivo, caducidad y auditoría (`support_access_grants`). |
| **Referencia** | ADR 0006 § Matriz, `specs/02-organizaciones-empleados.md` § 4.7 |

### D-24. Pasarela de pago (Fase 7)

| | |
|---|---|
| **Opciones** | A) Stripe. B) Paddle. C) Redsys. |
| **Recomendación** | **A** para SaaS internacional; **C** si se exige proveedor local. |
| **Impacto** | Medio: facturación e impuestos. |
| **Decisión** | no bloquea el MVP |

### D-25. Internacionalización

| | |
|---|---|
| **Opciones** | A) Solo español, textos externalizados. B) `react-i18next` desde el inicio. C) Solo español sin externalizar. |
| **Recomendación** | solo español en MVP, textos externalizados. |
| **Impacto** | Bajo en el MVP. |
| **Decisión** | ☐ Pendiente |

---

## 4. Decisiones ya propuestas (salvo objeción)

Estas decisiones se consideran parte de la propuesta y solo requieren confirmación:

1. Monolito modular, sin microservicios.
2. PostgreSQL + Prisma + Neon.
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
