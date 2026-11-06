```markdown
# Política de Tratamiento de Datos de Personas Fallecidas

- **Versión**: 0.1 (MVP)
- **Estado**: Borrador para revisión legal
- **Relacionado**: ADR 0006, specs 03 / 04 / 05 / 06
- **Aviso**: No sustituye el asesoramiento de un abogado especializado en protección de datos.

## 1. Marco normativo aplicable

| Norma | Relevancia |
|---|---|
| **RGPD (UE) 2016/679** | No se aplica a datos de personas fallecidas (Considerando 27). Sí aplica a familiares vivos. |
| **LOPDGDD (LO 3/2018)** | Art. 3 regula el acceso de familiares y herederos a los datos del fallecido. |
| **Ley 49/1979** | Regula la prestación de servicios funerarios. |
| **Ley 41/2002** | Relevante si se incorporan datos de salud. |
| **AI Act** | Aplicable a generación de textos con IA; riesgo limitado (transparencia obligatoria). |

## 2. Base legal del tratamiento

### 2.1. Datos del servicio funerario
- **Base legal**: ejecución de contrato (art. 6.1.b RGPD) entre la funeraria y los familiares contratantes.
- **Categorías especiales** (art. 9 RGPD): creencias religiosas (para ceremonias), datos de salud. Requieren **consentimiento explícito**.

### 2.2. Datos del memorial digital
- **Base legal**: **consentimiento explícito** (art. 6.1.a RGPD), documentado y revocable.
- **Publicación**: solo tras autorización verificable (ver § 4).

## 3. Quién puede ejercer derechos sobre los datos del fallecido

Conforme al art. 3 LOPDGDD:

1. Personas vinculadas al fallecido por razones familiares o de hecho.
2. Herederos del fallecido.
3. Personas designadas expresamente por el fallecido.

En caso de conflicto, la plataforma **no arbitrará**: documentará la solicitud, notificará a todos los `FAMILY_ADMIN` y congelará la publicación del memorial hasta resolución. Todo queda en `audit_logs`.

## 4. Flujo de autorización para publicar un memorial
[Funeraria crea expediente]
↓
[Familiares acceden vía invitación]
↓
[FAMILY_ADMIN solicita publicación del memorial]
↓
[Backend verifica: ≥1 FAMILY_ADMIN ha aceptado
la "Declaración de Autorización de Publicación"]
↓
[Se registra en publication_authorizations:
user_id, memorial_id, ip_hash, document_hash]
↓
[Memorial pasa a estado PUBLISHED]
↓
[URL pública accesible vía GET /api/v1/public/memorials/:slug]

text

La declaración cubre: familiar directo o heredero, capacidad legal, responsabilidad sobre contenido, conocimiento del derecho de otros familiares.

**Registro técnico obligatorio** en `audit_logs`: `user_id`, `memorial_id`, `action = "memorial.authorization.granted"`, `ip_hash`, `document_hash`, `timestamp`.

## 5. Derechos de los familiares vivos (RGPD)

| Derecho | Implementación |
|---|---|
| Acceso | Pantalla "Mis datos" + exportación JSON. |
| Rectificación | Edición de perfil + solicitud de rectificación (`content_requests`). |
| Supresión | Borrado de cuenta + anonimización de aportaciones. |
| Oposición | Retirada de consentimiento para publicación. |
| Portabilidad | Exportación de aportaciones propias. |

## 6. Datos sensibles y minimización

- **No se almacenan** datos de salud del fallecido salvo estrictamente necesarios y con consentimiento explícito.
- **No se almacenan** creencias religiosas salvo aportación voluntaria, marcadas con `sensitive = true`.
- Los prompts enviados a Gemini **no incluyen** DNI, dirección, teléfono, salud ni creencias (ver `specs/06-ia.md` § 4).

## 7. Conservación y eliminación

| Tipo de dato | Plazo | Acción al vencer |
|---|---|---|
| Expediente funerario | 5 años desde cierre | Anonimización |
| Memorial publicado | Hasta retirada por `FAMILY_ADMIN` | Borrado lógico + purga a 30 días |
| Documentación privada | Vigencia del expediente | Borrado de Storage + registro |
| Invitaciones caducadas | 90 días | Purga automática |
| `ai_generations` | 90 días (spec 06) | Anonimización |
| `audit_logs` | 1–2 años | Archivado en frío |

**Supresión solicitada por un familiar**: se elimina el contenido aportado, se anonimiza su autoría (`authorName = "Anónimo"`) y se conserva el registro de auditoría.

## 8. Encargados del tratamiento y transferencias internacionales

| Proveedor | Función | Ubicación | Garantías |
|---|---|---|---|
| **Neon** | PostgreSQL | UE (Frankfurt) en Free y planes de pago | SCC / DPA |
| **Neon Object Storage** | Almacenamiento S3-compatible | UE (Frankfurt) | SCC / DPA |
| **Better Auth** (autoalojado en la API) | Identidad y sesiones | Infraestructura de Render | No es un encargado externo: se ejecuta en la API |
| **Render** | Backend | US (free tier) | SCC |
| **Vercel** | Frontend | Global (edge) | SCC |
| **Google (Gemini)** | IA generativa | US | **No usar en producción con datos personales en free tier**; en MVP solo prompts anonimizados |
| **Resend** | Email transaccional | US | SCC |

> **Restricción del plan gratuito**: Neon Free permite elegir región europea (Frankfurt), pero Render Free y Resend operan en US. Para producción real, firmar DPA con cada proveedor y valorar regiones UE también para API y email.

## 9. Menores

- No se permite el registro de menores de 14 años sin consentimiento parental verificado.
- Los memoriales no contendrán datos de menores sin autorización expresa de sus tutores.

## 10. Registro de actividades de tratamiento (RAT)

Debe mantenerse en `docs/legal/rat.md` (pendiente de crear) con: nombre, finalidad, categorías, base legal, destinatarios, plazos, medidas.

## 11. Procedimiento ante brechas de seguridad

1. Detección y contención (revocación de tokens, rotación de claves).
2. Evaluación del riesgo.
3. Notificación a la AEPD en **72 horas** si hay riesgo.
4. Notificación a los afectados si el riesgo es alto.
5. Registro en `audit_logs` con `action = "security.incident"`.

## 12. Criterios de aceptación

- [ ] Ningún memorial se publica sin registro de autorización verificable.
- [ ] Los prompts de IA no contienen datos identificativos directos.
- [ ] Existe exportación de datos para el interesado.
- [ ] Existe flujo de supresión con anonimización.
- [ ] Todos los accesos a datos sensibles generan entrada en `audit_logs`.
- [ ] El plazo de conservación se aplica mediante jobs programados.