# Seguridad y privacidad — Legaria

**Estado:** Propuesta para validación  
**Nota:** Este documento no sustituye la revisión de un abogado especializado en protección de datos.

---

## 1. Activos a proteger

1. Datos de personas fallecidas.
2. Datos de familiares y contactos.
3. Documentación funeraria y autorizaciones.
4. Fotografías, vídeos y recuerdos.
5. Contenido de memoriales privados o restringidos.
6. Credenciales y sesiones.
7. Invitaciones y tokens de acceso.
8. Datos de organizaciones y empleados.
9. Registros de auditoría.
10. Secretos de infraestructura y claves de API.

---

## 2. Actores y confianza

| Actor | Confianza | Riesgo principal |
|---|---|---|
| Visitante anónimo | No confiable | Spam, scraping, abuso de condolencias. |
| Familiar autenticado | Confianza limitada | Acceso a contenido de otro grupo familiar. |
| Empleado de funeraria | Confianza limitada | Acceso a expedientes no asignados u otras organizaciones. |
| Administrador de funeraria | Alta dentro de su organización | Mal uso de datos o publicación indebida. |
| Super Admin | Alta, pero con mínimo privilegio | Acceso injustificado a información sensible. |
| Proveedores externos | Bajo control contractual | Transferencia internacional, retención, entrenamiento con datos. |
| Atacante externo | No confiable | Robo de sesión, IDOR, fuerza bruta, XSS, subida de archivos. |
| Insider malicioso | Riesgo real | Exfiltración, modificación de auditoría. |

---

## 3. Modelo de amenazas

### 3.1. Amenazas principales

| Amenaza | Ejemplo | Impacto |
|---|---|---|
| IDOR / BOLA | Cambiar un UUID y acceder a un expediente de otra organización. | Crítico. |
| Fuga cross-tenant | Consulta sin `organization_id`. | Crítico. |
| Robo de sesión | XSS roba refresh token. | Crítico. |
| Fuerza bruta | Probar contraseñas o tokens de invitación. | Alto. |
| Enumeración de cuentas | Distinguir email existente en login o invitación. | Medio. |
| CSRF | Acción destructiva usando cookies de la víctima. | Alto. |
| XSS almacenado | Biografía o condolencia con HTML malicioso. | Alto. |
| Subida maliciosa | SVG con script, archivo ejecutable, MIME falso. | Alto. |
| Exposición de memorial privado | URL indexada o enlace filtrado. | Crítico. |
| Scraping | Extracción masiva de memoriales públicos. | Medio. |
| Spam | Condolencias automatizadas. | Medio. |
| Prompt injection | Texto malicioso en un recuerdo que manipula a la IA. | Medio. |
| Abuso de coste | Uso masivo de IA. | Medio. |
| Insider | Empleado consulta expedientes ajenos. | Alto. |
| Cadena de suministro | Dependencia comprometida. | Alto. |
| Backup expuesto | Copia sin cifrado o accesible. | Crítico. |

### 3.2. Límites de confianza

- Navegador → API.
- API → Supabase.
- API → OpenAI.
- API → proveedor de email.
- Personal interno → panel de administración.

Todo lo que cruza un límite se valida y se registra.

---

## 4. Controles de seguridad

### 4.1. Autenticación

- Supabase Auth con contraseñas gestionadas por el proveedor.
- Verificación de email.
- MFA para administradores.
- Sesiones con access token corto y refresh rotatorio.
- Cookies `httpOnly`, `Secure`, `SameSite=Lax` si se adopta BFF.
- Revocación de sesiones por usuario y por administrador.
- Reautenticación para acciones sensibles.
- Bloqueo progresivo y límites por IP y por cuenta.
- Respuestas genéricas para no revelar si un email existe.
- Contraseñas nunca se almacenan ni se loguean en la aplicación.

### 4.2. Autorización

- RBAC + contexto + propiedad del recurso.
- Verificación en middleware y en servicio.
- Repositorios que exigen ámbito de tenant.
- Denegación por defecto.
- `SUPER_ADMIN` sin acceso a contenido sensible salvo acceso de soporte justificado.
- Pruebas de autorización para cada endpoint.
- No confiar en identificadores enviados por el cliente sin validar la relación.

### 4.3. Aislamiento multi-tenant

- `organization_id` en todas las tablas de tenant.
- Claves foráneas compuestas.
- Filtros obligatorios en repositorios.
- Pruebas automatizadas con dos organizaciones.
- RLS como defensa adicional si se habilita el acceso directo.
- Nunca exponer la `service_role` de Supabase al navegador.

### 4.4. Validación y salida

- Zod en todos los cuerpos, parámetros y queries.
- Listas blancas para filtros y ordenación.
- Límites de longitud en textos, biografías y condolencias.
- Serialización explícita de DTOs; nunca devolver modelos Prisma completos.
- Escape automático de React; prohibido `dangerouslySetInnerHTML` salvo sanitización justificada.
- Sanitización de HTML si se permite texto enriquecido.
- Content-Type correcto y `X-Content-Type-Options: nosniff`.
- CSP estricta, `frame-ancestors 'none'`, `Referrer-Policy: no-referrer` en páginas con tokens.

### 4.5. Archivos

- Buckets privados por defecto.
- Validación de MIME real, extensión y tamaño.
- SVG prohibido.
- Nombres generados; nunca el nombre original.
- Imágenes reprocesadas y EXIF eliminado.
- URLs firmadas de corta duración.
- Descargas con `Content-Disposition`.
- Separación entre originales y derivados públicos.
- Límites por plan y por archivo.
- Registro de subidas y descargas sensibles.
- Antivirus/malware en fase posterior si el volumen lo justifica.

### 4.6. Invitaciones

- Token aleatorio de al menos 32 bytes.
- Solo se almacena el hash SHA-256.
- Caducidad de 7 días por defecto.
- Un solo uso.
- Vinculado al email destinatario.
- Revocable.
- Límite de creación y de canje.
- No se registra el token en logs ni en analítica.
- Enlace con `Referrer-Policy: no-referrer`.
- Si el token se filtra, no se puede reutilizar tras el primer canje.

### 4.7. Condolencias y contenido público

- Moderación previa por defecto.
- Límite por IP y por memorial.
- CAPTCHA o prueba de trabajo en formularios públicos.
- Honeypot y detección de duplicados.
- Longitud máxima y sin HTML.
- Reporte de contenido.
- Capacidad de ocultar o eliminar.
- `noindex` por defecto en memoriales públicos.
- Sin datos de familiares vivos en la página pública.

### 4.8. IA

- Solo desde backend.
- Clave de API en servidor.
- Minimización y redacción previa.
- No enviar documentos ni datos innecesarios.
- Instrucciones explícitas contra invención y suplantación.
- Validación de salida.
- Etiquetado como borrador.
- Revisión humana obligatoria.
- Registro de generaciones y consumo.
- Cuotas por organización y usuario.
- Proveedor con DPA y garantías de transferencia.
- No usar datos para entrenamiento.
- Protección frente a prompt injection: separar instrucciones de contenido del usuario, delimitar y validar.

### 4.9. Auditoría

Se auditan, como mínimo:

- Login fallido repetido y bloqueo.
- Creación, modificación y eliminación de organizaciones.
- Altas, bajas y cambios de rol.
- Acceso a expedientes y documentos.
- Creación, edición, publicación y despublicación de memoriales.
- Moderación de condolencias.
- Generaciones de IA y aprobaciones.
- Accesos de soporte.
- Cambios de configuración.
- Exportaciones y descargas sensibles.

La auditoría no debe contener:

- Contraseñas o tokens.
- Biografías completas.
- Contenido de condolencias.
- Documentos.
- Datos de salud o creencias.

### 4.10. Infraestructura

- Secretos en variables de entorno.
- Rotación de claves.
- Principio de mínimo privilegio.
- Bases de datos no accesibles públicamente salvo por red controlada.
- Backups cifrados y restauración probada.
- Entornos separados.
- Dependencias auditadas.
- Imágenes Docker mínimas y actualizadas.
- HTTPS obligatorio.
- Cabeceras de seguridad.
- WAF o protección DDoS del proveedor.
- Monitorización y alertas.

---

## 5. RGPD y LOPDGDD

### 5.1. Roles de tratamiento

Es una decisión legal pendiente. Propuesta inicial:

| Tratamiento | Responsable | Encargado |
|---|---|---|
| Datos de la funeraria y sus empleados | Funeraria | Legaria |
| Expedientes y personas fallecidas | Funeraria | Legaria |
| Documentación del servicio | Funeraria | Legaria |
| Cuenta de familiar | Legaria / funeraria según contrato | — |
| Memorial y contenido familiar | Legaria o funeraria según contrato | — |
| Marketing de Legaria | Legaria | — |

Debe formalizarse mediante contrato de encargado del tratamiento y, si aplica, acuerdo de corresponsabilidad.

### 5.2. Bases legales

- **Ejecución de contrato:** relación con la funeraria y uso de la plataforma.
- **Consentimiento:** publicación de memorial, uso de IA, comunicaciones opcionales.
- **Interés legítimo:** seguridad, prevención de fraude, mejora del servicio.
- **Obligación legal:** conservación de documentación cuando corresponda.

Cada tratamiento debe tener base legal documentada.

### 5.3. Personas fallecidas

El RGPD no se aplica a personas fallecidas, pero la LOPDGDD permite que herederos y personas vinculadas ejerciten determinados derechos. Implicaciones:

- Definir un procedimiento para acreditar la condición de heredero o representante.
- Permitir acceso, rectificación y supresión del memorial.
- No publicar datos de familiares vivos sin base legal.
- Tratar con especial cuidado datos de salud, creencias o causas de fallecimiento, aunque se refieran a la persona fallecida, porque pueden revelar información de familiares vivos.

### 5.4. Derechos de las personas

- Acceso.
- Rectificación.
- Supresión.
- Limitación.
- Portabilidad.
- Oposición.
- Retirada del consentimiento.
- No ser objeto de decisiones automatizadas con efectos significativos.

Proceso:

1. Canal de solicitud.
2. Verificación de identidad.
3. Registro.
4. Respuesta en plazo legal.
5. Ejecución técnica y auditoría.

### 5.5. Minimización

- No pedir DNI si no es necesario.
- No pedir dirección exacta de familiares.
- No pedir datos de salud.
- No pedir creencias religiosas.
- No mostrar emails ni teléfonos en memoriales.
- No guardar IP en claro; usar hash con sal.
- No conservar contenido generado por IA más de lo necesario.

### 5.6. Conservación

- Definir plazos por tipo de dato.
- Ejecutar purgas automáticas.
- Documentar excepciones legales.
- Incluir backups en la política.
- Verificar que la eliminación alcanza derivados y cachés.

### 5.7. Evaluación de impacto

Se recomienda realizar una DPIA antes de producción por:

- Tratamiento de datos de personas fallecidas y familiares.
- Posible tratamiento de datos de salud o creencias.
- Uso de IA.
- Publicación de contenido en internet.
- Gran escala potencial.
- Colectivos vulnerables.

### 5.8. Transferencias internacionales

- Supabase en región europea.
- OpenAI con garantías contractuales y, si es posible, residencia de datos en la UE.
- Proveedor de email en la UE o con SCC.
- Documentar transferencias y evaluación de riesgo.

### 5.9. Menores

- Edad mínima para cuenta propia: 14 años en España, con revisión legal.
- Menores de 14 años: acceso mediante representante legal.
- No publicar datos de menores en memoriales.
- Moderación reforzada si se detecta contenido de menores.

---

## 6. Privacidad de memoriales

### 6.1. Niveles

| Nivel | Quién accede | URL pública | Indexación |
|---|---|---|---|
| `PUBLIC` | Cualquiera | Sí | `noindex` por defecto; configurable. |
| `PRIVATE` | Miembros del grupo familiar | No | No. |
| `RESTRICTED` | Usuarios expresamente autorizados | No | No. |

### 6.2. Reglas

- Solo se publica con autorización vigente.
- La autorización puede revocarse.
- Al despublicar, la URL deja de mostrar contenido.
- No se muestran datos de familiares vivos.
- No se muestran documentos.
- Las condolencias pendientes no son visibles.
- Los visitantes no pueden descargar originales.
- Las imágenes públicas no contienen EXIF.
- El slug es opaco y no contiene nombre ni apellidos por defecto.
- Se ofrece un mecanismo de reporte y retirada.

### 6.3. Indexación

- `noindex, nofollow` por defecto.
- La funeraria o la familia puede solicitar indexación.
- `sitemap` solo con memoriales públicos autorizados.
- Exclusión de resultados tras despublicar.

---

## 7. Seguridad de la IA

### 7.1. Reglas de producto

- La IA no publica.
- La IA no decide.
- La IA no inventa.
- La IA no suplanta.
- La IA no genera contenido sexual, violento, discriminatorio o vejatorio.
- La IA no recibe más datos de los necesarios.
- La IA no se usa para identificar personas vivas a partir de imágenes sin base legal.

### 7.2. Riesgos específicos

| Riesgo | Mitigación |
|---|---|
| Alucinaciones | Solo datos aportados; instrucciones estrictas; revisión humana. |
| Prompt injection | Separar instrucciones y contenido; delimitar; validar salida. |
| Exfiltración de datos | Minimización; no incluir secretos; proveedor con garantías. |
| Contenido dañino | Moderación y validación; rechazo de categorías prohibidas. |
| Coste descontrolado | Cuotas; límites por plan; alertas. |
| Sesgo | Revisión humana; evaluación de prompts; evitar inferencias sensibles. |

### 7.3. Trazabilidad

- Guardar tipo de generación, modelo, versión de prompt, usuario, organización y estado.
- Guardar solo el input redactado necesario.
- Vincular el texto aprobado con la generación que lo originó.
- Permitir auditoría y reproducción sin conservar datos excesivos.

---

## 8. Checklist de seguridad por fase

### Fase 1 — Fundación

- [ ] Variables de entorno y secretos.
- [ ] Auth con Supabase.
- [ ] RBAC base.
- [ ] Multi-tenancy y pruebas.
- [ ] Validación Zod.
- [ ] Errores seguros.
- [ ] Cabeceras de seguridad.
- [ ] Rate limiting básico.
- [ ] CI con auditoría de dependencias.

### Fase 2 — Organizaciones

- [ ] Invitaciones de empleados.
- [ ] MFA para administradores.
- [ ] Auditoría de cambios de rol.
- [ ] Último administrador protegido.
- [ ] Separación de contexto de organización.
- [ ] Acceso de soporte justificado.

### Fase 3 — Expedientes

- [ ] Autorización por expediente asignado.
- [ ] Documentos privados.
- [ ] URLs firmadas.
- [ ] Validación de fechas y estados.
- [ ] Auditoría de accesos.
- [ ] Pruebas cross-tenant.

### Fase 4 — Familias

- [ ] Tokens de invitación hasheados.
- [ ] Caducidad y un solo uso.
- [ ] Permisos familiares.
- [ ] Revocación inmediata.
- [ ] Documentos visibles solo si se autoriza.
- [ ] Protección contra enumeración.

### Fase 5 — Memoriales

- [ ] Autorización de publicación.
- [ ] Moderación de condolencias.
- [ ] Visibilidad y URLs.
- [ ] EXIF y metadatos.
- [ ] `noindex`.
- [ ] Reporte de contenido.
- [ ] Pruebas de acceso público/privado/restringido.

### Fase 6 — IA

- [ ] DPA con proveedor.
- [ ] Minimización.
- [ ] Cuotas.
- [ ] Registro de generaciones.
- [ ] Revisión humana.
- [ ] Evaluación de salidas.
- [ ] Etiquetado de contenido.

### Fase 7 — Comercial

- [ ] Webhooks firmados.
- [ ] Idempotencia.
- [ ] Datos de pago fuera del backend propio.
- [ ] Facturación y conservación.
- [ ] Auditoría de suscripciones.

---

## 9. Respuesta a incidentes

1. **Detección:** alertas, reportes, monitorización.
2. **Contención:** revocar sesiones, deshabilitar endpoints, aislar recursos.
3. **Evaluación:** alcance, datos afectados, riesgo para derechos.
4. **Notificación:** AEPD en 72 h si hay riesgo; comunicación a afectados si procede.
5. **Erradicación:** corregir causa, rotar secretos.
6. **Recuperación:** restaurar servicio y verificar integridad.
7. **Postmortem:** sin culpabilización, con acciones y plazos.

---

## 10. Decisiones legales y de privacidad pendientes

1. Rol de Legaria como responsable/encargado por tipo de tratamiento.
2. Plazos de conservación por categoría.
3. Documentación exigida para autorizar la publicación de un memorial.
4. Procedimiento de verificación de herederos.
5. Política de datos de personas fallecidas y familiares vivos.
6. Uso de OpenAI y transferencias internacionales.
7. Edad mínima y tratamiento de menores.
8. Indexación de memoriales en buscadores.
9. Conservación de logs de auditoría y de IA.
10. Necesidad y alcance de la DPIA.

Ver [docs/05-decisiones-pendientes.md](./05-decisiones-pendientes.md).
