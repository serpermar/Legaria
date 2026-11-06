# PRD — Legaria

**Versión:** 0.1  
**Fecha:** 2026-11-05  
**Estado:** Borrador para validación  
**Producto:** Plataforma digital funeraria y de memoriales  
**Mercado inicial:** España  
**Modelo:** SaaS B2B2C

---

## 1. Resumen ejecutivo

Legaria es una plataforma web que digitaliza la relación entre las empresas funerarias y las familias, y ofrece un espacio de memoria digital para las personas fallecidas.

No se plantea como una web funeraria tradicional, sino como un ecosistema con cuatro áreas diferenciadas:

- Panel profesional para funerarias.
- Portal privado para familias.
- Memoriales digitales.
- Administración global de la plataforma.

El producto se comercializará como SaaS para funerarias. Las familias accederán gratuitamente a los espacios que les proporcione la funeraria, con posibilidad de ampliar servicios en fases posteriores.

La inteligencia artificial se incorporará como herramienta de asistencia para redactar, organizar y clasificar recuerdos. Nunca publicará contenido de forma automática, no inventará datos biográficos y no generará comunicaciones que simulen la personalidad de la persona fallecida.

---

## 2. Problema y oportunidad

### Problema

Las funerarias gestionan expedientes, documentación, servicios, salas, empleados y comunicación con familias mediante herramientas dispersas, correo electrónico, mensajería y papel.

Las familias, por su parte, viven un momento de alta carga emocional y administrativa, con poca visibilidad sobre el servicio, la documentación y los espacios de recuerdo.

Los memoriales digitales existentes suelen ser:

- Estáticos y poco cuidados.
- Con poca o nula moderación.
- Con modelos de privacidad ambiguos.
- Desconectados de la gestión funeraria real.
- Poco accesibles y con experiencias de usuario frágiles.

### Oportunidad

Legaria puede aportar valor en tres dimensiones:

1. **Operativa:** reducir fricción en la gestión interna de la funeraria.
2. **Relacional:** ofrecer a las familias un espacio privado, claro y acompañado.
3. **Memorial:** preservar la memoria de forma segura, autorizada y duradera.

La combinación de gestión profesional, portal familiar y memorial digital con IA responsable es el elemento diferencial.

---

## 3. Visión y propuesta de valor

### Visión

Ser el espacio digital de referencia para acompañar a las familias antes, durante y después de un servicio funerario, sin perder la sensibilidad humana.

### Propuesta de valor

**Para la funeraria:**

- Centralización de expedientes, servicios, empleados y familias.
- Imagen digital moderna y diferenciada.
- Herramientas de comunicación y seguimiento.
- Memoriales digitales gestionados desde el mismo entorno.
- IA asistida para mejorar la calidad del contenido sin sustituir el criterio humano.

**Para la familia:**

- Acceso privado y seguro a la información del servicio.
- Espacio compartido para fotografías, recuerdos y mensajes.
- Control sobre quién puede ver cada contenido.
- Acompañamiento en la creación de la biografía y los homenajes.
- Un memorial que perdura y puede visitarse a distancia.

**Para la plataforma:**

- Modelo SaaS recurrente.
- Datos y métricas agregadas del sector.
- Posibilidad de integraciones y expansión internacional.

---

## 4. Objetivos y no objetivos

### Objetivos del MVP

1. Validar que una funeraria puede gestionar su operativa básica en Legaria.
2. Validar que las familias pueden acceder a un espacio privado útil y comprensible.
3. Validar que un memorial puede crearse, revisarse, autorizarse y publicarse con garantías.
4. Demostrar buenas prácticas de arquitectura, seguridad, accesibilidad y pruebas.
5. Disponer de una base técnica preparada para IA y suscripciones posteriores.

### No objetivos del MVP

- Sustituir un ERP funerario completo.
- Gestionar pagos o facturación.
- Ofrecer videollamadas, streaming o gestión de pésames presenciales.
- Crear una red social abierta.
- Implementar microservicios.
- Ofrecer aplicación móvil nativa.
- Gestionar trámites legales con administraciones públicas.
- Generar contenido con IA de forma autónoma.
- Crear avatares, voces sintéticas o simulaciones de la persona fallecida.

---

## 5. Usuarios y roles

| Rol | Ámbito | Descripción |
|---|---|---|
| `SUPER_ADMIN` | Global | Administra la plataforma, organizaciones, usuarios y configuración. No accede al contenido sensible por defecto. |
| `FUNERAL_ADMIN` | Organización | Administra la funeraria, sus empleados, expedientes, familias y publicación de memoriales. |
| `FUNERAL_EMPLOYEE` | Organización / expediente | Gestiona los expedientes que tiene asignados. No administra la organización ni publica memoriales. |
| `FAMILY_ADMIN` | Grupo familiar | Responsable de la familia. Gestiona miembros, contenido y solicitudes de publicación. |
| `FAMILY_MEMBER` | Grupo familiar | Familiar autorizado. Consulta información y aporta contenido según permisos. |
| `VISITOR` | Memorial público | Visitante sin cuenta. Solo ve contenido público y puede enviar condolencias moderadas. |

Un usuario puede pertenecer a varias organizaciones y a varios grupos familiares con roles distintos.

---

## 6. Alcance

### 6.1. MVP (Fases 1–5)

| Área | Incluido en MVP |
|---|---|
| Fundación | Monorepo, frontend, backend, PostgreSQL, Prisma, autenticación, RBAC, multi-tenancy. |
| Organizaciones | Alta de funeraria, perfil, empleados, roles, estado y auditoría básica. |
| Expedientes | Creación, consulta, edición, estados, persona fallecida, servicios, salas, ceremonias, asignaciones y documentos. |
| Familias | Grupo familiar, invitaciones seguras, acceso, miembros, permisos y documentación autorizada. |
| Memoriales | Borrador, biografía, fotografías, recuerdos, cronología, condolencias, autorización, revisión, publicación y URL pública. |
| Administración | Panel global, gestión de organizaciones y usuarios, métricas agregadas, auditoría y acceso de soporte justificado. |

### 6.2. Posterior al MVP

- IA asistida (Fase 6).
- Suscripciones, pagos y facturación (Fase 7).
- Vídeo avanzado y transcodificación.
- Varias sedes y personalización Enterprise.
- Integraciones con terceros.
- Notificaciones avanzadas y aniversarios automatizados.
- Internacionalización completa.

---

## 7. Requisitos funcionales

Prioridad: **M** = Must, **S** = Should, **C** = Could.  
Fase: fase de desarrollo prevista.

### 7.1. Autenticación, sesión y usuarios

| ID | Requisito | Prioridad | Fase |
|---|---|---|---|
| FR-AUTH-01 | Login con email y contraseña mediante Better Auth. | M | 1 |
| FR-AUTH-02 | Renovación de sesión y revocación de sesiones activas. | M | 1 |
| FR-AUTH-03 | Logout local y logout global. | M | 1 |
| FR-AUTH-04 | Recuperación y restablecimiento de contraseña. | M | 1 |
| FR-AUTH-05 | Perfil de usuario editable (nombre, teléfono, idioma). | M | 1 |
| FR-AUTH-06 | Aceptación de invitación con creación o vinculación de cuenta. | M | 4 |
| FR-AUTH-07 | Verificación de email para cuentas nuevas. | M | 1 |
| FR-AUTH-08 | MFA obligatoria para `SUPER_ADMIN` y `FUNERAL_ADMIN`, opcional para empleados. | S | 2 |
| FR-AUTH-09 | Limitación de intentos y protección contra enumeración de cuentas. | M | 1 |
| FR-AUTH-10 | Reautenticación para acciones sensibles (publicar, descargar documentos, cambiar permisos). | S | 3 |

### 7.2. Organizaciones y empleados

| ID | Requisito | Prioridad | Fase |
|---|---|---|---|
| FR-ORG-01 | `SUPER_ADMIN` puede crear, suspender y cancelar organizaciones. | M | 2 |
| FR-ORG-02 | `FUNERAL_ADMIN` puede editar el perfil de su organización. | M | 2 |
| FR-ORG-03 | Invitar empleados por email con rol y caducidad. | M | 2 |
| FR-ORG-04 | Aceptar, revocar y eliminar miembros de la organización. | M | 2 |
| FR-ORG-05 | Proteger la organización frente a la eliminación del último administrador. | M | 2 |
| FR-ORG-06 | Aislar datos entre organizaciones en todas las capas. | M | 1 |
| FR-ORG-07 | Gestionar plan y estado de suscripción (sin pagos en MVP). | S | 2 |
| FR-ORG-08 | Consultar historial de actividad de la organización. | M | 2 |
| FR-ORG-09 | Un usuario puede pertenecer a varias organizaciones con roles distintos. | M | 2 |
| FR-ORG-10 | Cambiar de organización activa sin mezclar contextos. | M | 2 |

### 7.3. Expedientes, personas fallecidas y servicios

| ID | Requisito | Prioridad | Fase |
|---|---|---|---|
| FR-CASE-01 | Crear expediente con referencia única por organización. | M | 3 |
| FR-CASE-02 | Listar, filtrar, ordenar y buscar expedientes. | M | 3 |
| FR-CASE-03 | Consultar el detalle del expediente con permisos por recurso. | M | 3 |
| FR-CASE-04 | Editar expediente y cambiar de estado. | M | 3 |
| FR-CASE-05 | Registrar y editar la persona fallecida asociada. | M | 3 |
| FR-CASE-06 | Gestionar uno o varios servicios funerarios por expediente. | M | 3 |
| FR-CASE-07 | Gestionar salas y ceremonias asociadas a servicios. | S | 3 |
| FR-CASE-08 | Asignar empleados al expediente y retirarlos. | M | 3 |
| FR-CASE-09 | Subir y clasificar documentación del expediente. | M | 3 |
| FR-CASE-10 | Consultar historial de actividad del expediente. | M | 3 |
| FR-CASE-11 | Archivar expedientes sin borrado destructivo inmediato. | M | 3 |
| FR-CASE-12 | Validar coherencia de fechas y estados. | M | 3 |
| FR-CASE-13 | Aplicar minimización de datos sensibles. | M | 3 |

### 7.4. Familias e invitaciones

| ID | Requisito | Prioridad | Fase |
|---|---|---|---|
| FR-FAM-01 | Crear un grupo familiar asociado a un expediente. | M | 4 |
| FR-FAM-02 | Invitar familiares mediante token seguro, caducable y de un solo uso. | M | 4 |
| FR-FAM-03 | Canjear invitación y vincular la cuenta al grupo familiar. | M | 4 |
| FR-FAM-04 | Distinguir `FAMILY_ADMIN` y `FAMILY_MEMBER`. | M | 4 |
| FR-FAM-05 | El portal familiar solo muestra información autorizada del expediente. | M | 4 |
| FR-FAM-06 | `FAMILY_ADMIN` puede invitar y retirar familiares. | M | 4 |
| FR-FAM-07 | Un familiar puede abandonar el grupo; no puede dejar el grupo sin administrador. | M | 4 |
| FR-FAM-08 | Controlar el acceso a documentación por documento y por rol. | M | 4 |
| FR-FAM-09 | Solicitar modificaciones o eliminación de contenido. | S | 4 |
| FR-FAM-10 | Transferir la administración del grupo familiar. | S | 4 |
| FR-FAM-11 | Revocar el acceso de un familiar de forma inmediata. | M | 4 |

### 7.5. Memoriales

| ID | Requisito | Prioridad | Fase |
|---|---|---|---|
| FR-MEM-01 | Crear un memorial en borrador asociado a un expediente. | M | 5 |
| FR-MEM-02 | Editar biografía con revisión humana. | M | 5 |
| FR-MEM-03 | Subir fotografía principal y galería de imágenes. | M | 5 |
| FR-MEM-04 | Soportar vídeos con límites de tamaño y formato. | S | 5 |
| FR-MEM-05 | Añadir recuerdos y anécdotas. | M | 5 |
| FR-MEM-06 | Construir una cronología de acontecimientos. | S | 5 |
| FR-MEM-07 | Recibir condolencias con moderación. | M | 5 |
| FR-MEM-08 | Soportar visibilidad pública, privada y restringida. | M | 5 |
| FR-MEM-09 | Registrar autorización verificable antes de publicar. | M | 5 |
| FR-MEM-10 | Revisar, aprobar, rechazar y despublicar memoriales. | M | 5 |
| FR-MEM-11 | Generar una URL pública única para memoriales públicos. | M | 5 |
| FR-MEM-12 | Compartir el memorial mediante enlace. | M | 5 |
| FR-MEM-13 | Gestionar aniversarios y fechas especiales. | C | 6 |
| FR-MEM-14 | Aplicar `noindex` por defecto y controlar la indexación. | S | 5 |
| FR-MEM-15 | Permitir reportar contenido inapropiado. | S | 5 |
| FR-MEM-16 | Mantener los documentos y originales privados por defecto. | M | 5 |

### 7.6. Inteligencia artificial (post-MVP)

| ID | Requisito | Prioridad | Fase |
|---|---|---|---|
| FR-AI-01 | Generar borradores de biografía a partir de datos aportados por el usuario. | S | 6 |
| FR-AI-02 | Generar borradores de homenaje o texto conmemorativo. | S | 6 |
| FR-AI-03 | Proponer una cronología a partir de recuerdos fechados. | C | 6 |
| FR-AI-04 | Clasificar y etiquetar fotografías con revisión humana. | C | 6 |
| FR-AI-05 | No publicar contenido automáticamente. | M | 6 |
| FR-AI-06 | No inventar hechos, relaciones ni datos personales. | M | 6 |
| FR-AI-07 | Etiquetar todo texto generado como borrador asistido por IA. | M | 6 |
| FR-AI-08 | Registrar generaciones, consumo y revisión. | M | 6 |
| FR-AI-09 | Aplicar minimización y redacción de datos antes de enviar al proveedor. | M | 6 |
| FR-AI-10 | Aplicar límites de consumo por organización y usuario. | M | 6 |

### 7.7. Administración global

| ID | Requisito | Prioridad | Fase |
|---|---|---|---|
| FR-ADM-01 | Dashboard global con métricas agregadas. | M | 2 |
| FR-ADM-02 | Gestionar organizaciones y su estado. | M | 2 |
| FR-ADM-03 | Gestionar usuarios y estado de cuenta. | M | 2 |
| FR-ADM-04 | Gestionar roles globales y permisos de administración. | M | 2 |
| FR-ADM-05 | Administrar suscripciones (sin pagos en MVP). | S | 7 |
| FR-ADM-06 | Consultar auditoría global. | M | 2 |
| FR-ADM-07 | Configurar parámetros globales. | S | 2 |
| FR-ADM-08 | Acceder a información sensible solo con justificación, tiempo limitado y auditoría. | M | 2 |
| FR-ADM-09 | Supervisar estado técnico y errores. | S | 2 |

### 7.8. Comercialización (post-MVP)

| ID | Requisito | Prioridad | Fase |
|---|---|---|---|
| FR-BILL-01 | Definir planes Basic, Professional y Enterprise. | S | 7 |
| FR-BILL-02 | Gestionar suscripciones y periodos de prueba. | S | 7 |
| FR-BILL-03 | Aplicar límites por plan. | S | 7 |
| FR-BILL-04 | Emitir facturas y gestionar impagos. | C | 7 |
| FR-BILL-05 | Integrar pasarela de pago. | S | 7 |

---

## 8. Requisitos no funcionales

### 8.1. Seguridad

| ID | Requisito |
|---|---|
| NFR-SEC-01 | Toda autorización se aplica en backend; el frontend solo mejora la experiencia. |
| NFR-SEC-02 | Aislamiento multi-tenant verificable con pruebas automatizadas entre organizaciones. |
| NFR-SEC-03 | Validación de entrada y salida con Zod y tipos estrictos. |
| NFR-SEC-04 | Documentos y originales privados; acceso mediante URLs firmadas de corta duración. |
| NFR-SEC-05 | Auditoría de operaciones sensibles sin almacenar contenido sensible innecesario. |
| NFR-SEC-06 | Limitación de peticiones en autenticación, invitaciones, condolencias y IA. |
| NFR-SEC-07 | Secretos solo en variables de entorno y nunca en el repositorio. |
| NFR-SEC-08 | Cabeceras de seguridad, CSP estricta y protección CSRF cuando se usen cookies. |
| NFR-SEC-09 | Dependencias revisadas y análisis automatizado de vulnerabilidades. |
| NFR-SEC-10 | Errores sin trazas internas ni datos personales en producción. |

### 8.2. Privacidad y cumplimiento

| ID | Requisito |
|---|---|
| NFR-PRI-01 | Diseño conforme a RGPD, LOPDGDD y normativa aplicable, con revisión legal externa. |
| NFR-PRI-02 | Minimización de datos y finalidad determinada para cada tratamiento. |
| NFR-PRI-03 | Política de conservación y eliminación documentada y ejecutable. |
| NFR-PRI-04 | Registro de consentimientos y autorizaciones de publicación. |
| NFR-PRI-05 | Los datos enviados a proveedores de IA se minimizan y se amparan en garantías contractuales. |
| NFR-PRI-06 | Derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición. |
| NFR-PRI-07 | Evaluación de impacto (DPIA) antes de producción. |
| NFR-PRI-08 | Ningún memorial se publica sin autorización verificable. |

### 8.3. Rendimiento, disponibilidad y mantenibilidad

| ID | Requisito |
|---|---|
| NFR-PERF-01 | Respuesta p95 < 500 ms en lecturas normales, excluyendo archivos e IA. |
| NFR-PERF-02 | Paginación obligatoria en listados; sin consultas sin límite. |
| NFR-PERF-03 | Imágenes optimizadas y servidas en formatos modernos. |
| NFR-REL-01 | Copias de seguridad automáticas y procedimiento de restauración probado. |
| NFR-REL-02 | RPO objetivo ≤ 24 h y RTO objetivo ≤ 4 h para el MVP. |
| NFR-OBS-01 | Logs estructurados, identificador de petición y seguimiento de errores. |
| NFR-MAINT-01 | TypeScript estricto; `any` prohibido salvo justificación documentada. |
| NFR-MAINT-02 | Módulos desacoplados por dominio y contratos compartidos. |
| NFR-TEST-01 | Pruebas unitarias, de integración y E2E para flujos críticos. |
| NFR-TEST-02 | Pruebas de autorización entre organizaciones en cada endpoint con datos de tenant. |

### 8.4. Accesibilidad y experiencia

| ID | Requisito |
|---|---|
| NFR-A11Y-01 | Objetivo WCAG 2.2 AA en flujos críticos. |
| NFR-A11Y-02 | Navegación por teclado, foco visible y formularios con etiquetas y errores asociados. |
| NFR-A11Y-03 | Contraste suficiente y respeto a `prefers-reduced-motion`. |
| NFR-RESP-01 | Diseño responsive desde móvil hasta escritorio. |
| NFR-I18N-01 | Español como idioma inicial, con textos externalizados para futuras traducciones. |
| NFR-COMP-01 | Últimas dos versiones de Chrome, Firefox, Safari y Edge. |

---

## 9. Flujos críticos

### 9.1. Alta de funeraria y empleados

1. `SUPER_ADMIN` crea la organización.
2. Se designa un `FUNERAL_ADMIN`.
3. El administrador recibe una invitación y activa su cuenta.
4. Invita a empleados y asigna roles.
5. Cada empleado accede solo a su organización y a los expedientes asignados.

### 9.2. Gestión de un expediente

1. El empleado crea el expediente.
2. Registra la persona fallecida y los datos mínimos necesarios.
3. Crea el servicio funerario y, si procede, la ceremonia y la sala.
4. Asigna empleados.
5. Adjunta documentación privada.
6. La familia se incorpora mediante invitación.

### 9.3. Invitación familiar

1. La funeraria crea el grupo familiar e invita al responsable.
2. El responsable recibe un enlace de un solo uso.
3. Crea su cuenta o vincula la existente.
4. Accede únicamente a la información autorizada.
5. Puede invitar a otros familiares según su rol.

### 9.4. Publicación de un memorial

1. Se crea el memorial en borrador.
2. Se añaden biografía, fotografías, recuerdos y cronología.
3. El `FAMILY_ADMIN` revisa y firma o registra la autorización de publicación.
4. El memorial pasa a revisión.
5. El `FUNERAL_ADMIN` lo aprueba y publica.
6. Solo entonces es accesible en su URL pública, si la visibilidad es pública.
7. Cualquier contenido puede despublicarse o retirarse.

### 9.5. Condolencia pública

1. El visitante accede a un memorial público.
2. Envía una condolencia con nombre y mensaje.
3. La condolencia queda pendiente de moderación.
4. Un usuario autorizado la aprueba, la oculta o la rechaza.
5. Solo las aprobadas se muestran públicamente.

---

## 10. Modelo de negocio

### Planes

| Plan | Enfoque | Funcionalidades |
|---|---|---|
| Basic | Funerarias pequeñas | Expedientes, servicios y memoriales básicos. |
| Professional | Funerarias medianas | Usuarios ampliados, estadísticas, IA y más capacidad. |
| Enterprise | Grupos y varias sedes | Multi-sede, personalización, integraciones y soporte. |

### Reglas

- Las familias no pagan por el acceso proporcionado por la funeraria.
- Los límites por plan se aplican en backend.
- El pago y la facturación se implementan en la Fase 7.
- La IA tendrá límites de consumo por plan.

---

## 11. Métricas de éxito

### Producto

- Tiempo medio hasta crear el primer expediente.
- Porcentaje de expedientes con familia invitada.
- Porcentaje de invitaciones aceptadas.
- Memoriales creados y publicados por organización.
- Condolencias recibidas y moderadas.
- Uso de IA y porcentaje de borradores aceptados tras revisión.

### Negocio

- Número de organizaciones activas.
- Retención mensual de organizaciones.
- Conversión de prueba a plan de pago (fase 7).
- Satisfacción de funerarias y familias.

### Técnicas

- Disponibilidad.
- Latencia p95.
- Tasa de errores.
- Incidentes de seguridad: objetivo cero críticos.
- Cobertura de pruebas en flujos críticos.

---

## 12. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Acceso cruzado entre organizaciones | Crítico | Autorización por contexto, claves compuestas, pruebas de aislamiento. |
| Exposición de datos de familias o personas fallecidas | Crítico | Minimización, buckets privados, URLs firmadas, auditoría. |
| Publicación sin autorización suficiente | Alto | Flujo de autorización verificable y revisión humana. |
| Contenido ofensivo o spam en memoriales | Alto | Moderación previa, límites, CAPTCHA, reportes. |
| IA que inventa o resulta inapropiada | Alto | Solo datos aportados, instrucciones estrictas, revisión humana obligatoria. |
| Complejidad excesiva del MVP | Medio | Fases cerradas, monolito modular, alcance explícito. |
| Dependencia del proveedor de datos | Medio | Prisma + SQL estándar; Neon es PostgreSQL y el storage es S3-compatible. |
| Baja adopción por funerarias | Medio | Diseño operativo sencillo, onboarding asistido y valor visible. |
| Coste de IA o almacenamiento | Medio | Límites por plan, cuotas y monitorización. |
| Cambios legales o interpretación del RGPD | Alto | Revisión legal, DPIA, contratos de encargado y política de conservación. |

---

## 13. Roadmap resumido

| Fase | Entregable |
|---|---|
| 0 | Documentación, PRD, arquitectura, modelo de datos, specs y decisiones validadas. |
| 1 | Fundación: monorepo, auth, RBAC, multi-tenancy, base de datos y CI. |
| 2 | Organizaciones, empleados y panel global. |
| 3 | Expedientes, personas fallecidas, servicios, salas y documentos. |
| 4 | Familias, invitaciones, portal privado y permisos. |
| 5 | Memoriales, medios, recuerdos, condolencias y publicación. |
| 6 | IA asistida y revisión humana. |
| 7 | Suscripciones, pagos, facturación e integraciones. |

Detalle en [specs/08-roadmap-mvp.md](./specs/08-roadmap-mvp.md).

---

## 14. Criterios de aceptación del MVP

El MVP se considerará validado cuando:

1. Un `SUPER_ADMIN` puede crear una funeraria y designar un administrador.
2. Un `FUNERAL_ADMIN` puede invitar empleados y estos aceptan la invitación.
3. Un empleado solo puede acceder a los expedientes que tiene asignados.
4. Una organización no puede leer ni modificar datos de otra, con pruebas automatizadas.
5. Se puede crear un expediente, registrar la persona fallecida y gestionar un servicio.
6. Se puede invitar a una familia y esta accede a un espacio privado limitado.
7. Se puede crear un memorial con biografía y fotografías.
8. Un memorial no se publica sin autorización registrada y revisión humana.
9. Un memorial público es accesible por URL y uno privado no.
10. Un visitante puede enviar una condolencia y esta no aparece hasta ser moderada.
11. Las acciones sensibles quedan auditadas.
12. Los flujos críticos tienen pruebas y cumplen WCAG 2.2 AA como objetivo.
13. No hay secretos en el repositorio ni datos sensibles en logs.

---

## 15. Fuera de alcance

- Gestión de pagos y facturación en el MVP.
- IA en el MVP.
- Aplicaciones móviles nativas.
- Streaming de ceremonias.
- Firma electrónica cualificada.
- Integraciones con administraciones públicas.
- Gestión de trámites legales.
- Avatares, voces sintéticas o simulaciones de la persona fallecida.
- Red social abierta o muro público sin moderación.
- Microservicios, Kubernetes o event sourcing.
- Multi-región activa-activa.

---

## 16. Decisiones abiertas

Las decisiones que bloquean o condicionan la implementación están en [docs/05-decisiones-pendientes.md](./docs/05-decisiones-pendientes.md). Deben resolverse antes de iniciar la Fase 1.
